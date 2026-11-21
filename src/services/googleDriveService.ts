import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';
import {
  PeerChallengeRecord,
  SavedProgressReport,
  StudentProgress,
} from '../types/curriculum';

export const DRIVE_BACKUP_FILENAME = 'AzizAcademy_Offline_Backup.json';

// Strict security rule: OAuth access token stays strictly in JS memory, never localStorage/sessionStorage
let inMemoryDriveToken: string | null = null;
let connectedDriveEmail: string | null = null;

export interface AzizAcademyDriveBackupPayload {
  schemaVersion: 1;
  appName: 'أكاديمية عزيز';
  curriculumYear: 2026;
  exportedAtIso: string;
  studentProgress: StudentProgress;
  savedReports: SavedProgressReport[];
  peerChallenges: PeerChallengeRecord[];
  offlineReadyLessonsCount: number;
}

export interface DriveBackupMetadata {
  id: string;
  name: string;
  modifiedTime: string;
  size?: string;
}

export function hasDriveAccessToken(): boolean {
  return Boolean(inMemoryDriveToken);
}

export function getGoogleDriveConnectedEmail(): string | null {
  return connectedDriveEmail;
}

export function clearDriveAccessToken(): void {
  inMemoryDriveToken = null;
  connectedDriveEmail = null;
}

export async function connectGoogleDrive(): Promise<string> {
  const driveProvider = new GoogleAuthProvider();
  driveProvider.addScope('https://www.googleapis.com/auth/drive.file');
  driveProvider.setCustomParameters({ prompt: 'consent select_account' });

  const result = await signInWithPopup(auth, driveProvider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  if (!credential?.accessToken) {
    throw new Error(
      'لم يُمنح رمز الوصول إلى Google Drive. يُرجى الموافقة على صلاحية حفظ ملفات التطبيق على Google Drive.'
    );
  }

  inMemoryDriveToken = credential.accessToken;
  connectedDriveEmail = result.user.email ?? result.user.displayName ?? null;
  return credential.accessToken;
}

async function driveFetchJson<T>(url: string, init: RequestInit = {}): Promise<T> {
  if (!inMemoryDriveToken) {
    throw new Error('لم يتم ربط حساب Google Drive في هذه الجلسة بعد.');
  }

  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${inMemoryDriveToken}`,
      ...(init.headers || {}),
    },
  });

  if (res.status === 401) {
    inMemoryDriveToken = null;
    throw new Error('انتهت صلاحية جلسة Google Drive. اضغط «ربط Google Drive» للمتابعة.');
  }

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`خطأ في Google Drive (${res.status}): ${txt.slice(0, 120)}`);
  }

  return (await res.json()) as T;
}

export async function findExistingDriveBackup(): Promise<DriveBackupMetadata | null> {
  const q = encodeURIComponent(`name = '${DRIVE_BACKUP_FILENAME}' and trashed = false`);
  const data = await driveFetchJson<{ files?: DriveBackupMetadata[] }>(
    `https://www.googleapis.com/drive/v3/files?q=${q}&spaces=drive&fields=files(id,name,modifiedTime,size)&pageSize=5`
  );
  return data.files && data.files.length > 0 ? data.files[0] : null;
}

export async function uploadBackupToGoogleDrive(
  payload: AzizAcademyDriveBackupPayload,
  existingFileId?: string
): Promise<DriveBackupMetadata> {
  if (!inMemoryDriveToken) {
    await connectGoogleDrive();
  }

  const boundary = `aziz_boundary_${Date.now()}`;
  const metadata = {
    name: DRIVE_BACKUP_FILENAME,
    mimeType: 'application/json',
    description: 'نسخة احتياطية كاملة لتقدّم التلميذ والمنهاج 2026 — أكاديمية عزيز',
  };

  const multipartBody =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(payload, null, 2)}\r\n` +
    `--${boundary}--`;

  const uploadUrl = existingFileId
    ? `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(existingFileId)}?uploadType=multipart&fields=id,name,modifiedTime,size`
    : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,modifiedTime,size';

  return driveFetchJson<DriveBackupMetadata>(uploadUrl, {
    method: existingFileId ? 'PATCH' : 'POST',
    headers: {
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartBody,
  });
}

export async function downloadBackupFromGoogleDrive(
  fileId: string
): Promise<AzizAcademyDriveBackupPayload> {
  const data = await driveFetchJson<AzizAcademyDriveBackupPayload>(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`
  );

  if (!data || !data.studentProgress || typeof data.studentProgress !== 'object') {
    throw new Error('ملف النسخة الاحتياطية غير صالح أو تالف.');
  }

  return data;
}
