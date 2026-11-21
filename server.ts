import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { askLessonTutor, TutorApiError, type AskLessonTutorInput } from './server/geminiClient.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ParentDigestSubjectItem {
  name: string;
  completedLessons: number;
  totalLessons: number;
  completionPercent: number;
  accuracy: number;
}

interface ParentDigestRequest {
  parentEmail?: string;
  studentName?: string;
  gradeLabel?: string;
  governorate?: string;
  cadence?: string;
  masteryPercent?: number;
  accuracyPercent?: number;
  points?: number;
  streakDays?: number;
  completedLessonsCount?: number;
  totalLessonsCount?: number;
  earnedBadgesCount?: number;
  includeSubjectDetails?: boolean;
  consentAccepted?: boolean;
  subjects?: ParentDigestSubjectItem[];
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeHeader(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim();
}

const CADENCE_AR_LABELS: Record<string, string> = {
  weekly: 'أسبوعي',
  biweekly: 'كل أسبوعين',
  monthly: 'شهري',
  disabled: 'عند الطلب فقط',
};

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  const port = Number(process.env.PORT || 3000);
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.post('/api/lesson-chat', async (req, res) => {
    try {
      const body = req.body as Partial<AskLessonTutorInput> | undefined;
      if (!body || !body.lesson || typeof body.message !== 'string') {
        res.status(400).json({ error: 'بيانات الدرس أو السؤال غير مكتملة.' });
        return;
      }

      const reply = await askLessonTutor({
        lesson: body.lesson,
        studentName: body.studentName,
        history: Array.isArray(body.history) ? body.history : [],
        message: body.message,
      });

      res.json({ reply });
    } catch (err) {
      if (err instanceof TutorApiError) {
        res.status(err.status).json({ error: err.message });
        return;
      }
      const message = err instanceof Error ? err.message : 'خطأ غير متوقع في الخادم.';
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/parent-digest', async (req, res) => {
    try {
      const body = (req.body || {}) as ParentDigestRequest;
      const parentEmail = sanitizeHeader(String(body.parentEmail || ''));
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!body.consentAccepted) {
        res.status(400).json({
          error: 'يجب تأكيد موافقة الولي الصريحة على معالجة البريد الإلكتروني أولاً.',
        });
        return;
      }

      if (!emailRegex.test(parentEmail) || parentEmail.length > 160) {
        res.status(400).json({
          error: 'صيغة البريد الإلكتروني لولي الأمر غير صحيحة.',
        });
        return;
      }

      const studentName = String(body.studentName || 'عزيز').slice(0, 60);
      const gradeLabel = String(body.gradeLabel || 'السنة السادسة ابتدائي').slice(0, 60);
      const governorate = String(body.governorate || 'تونس').slice(0, 40);
      const cadenceKey = String(body.cadence || 'weekly');
      const cadenceLabel = CADENCE_AR_LABELS[cadenceKey] ?? 'أسبوعي';
      const masteryPercent = Math.max(0, Math.min(100, Number(body.masteryPercent || 0)));
      const accuracyPercent = Math.max(0, Math.min(100, Number(body.accuracyPercent || 0)));
      const points = Math.max(0, Number(body.points || 0));
      const streakDays = Math.max(0, Number(body.streakDays || 0));
      const completedLessonsCount = Math.max(0, Number(body.completedLessonsCount || 0));
      const totalLessonsCount = Math.max(1, Number(body.totalLessonsCount || 1));
      const earnedBadgesCount = Math.max(0, Number(body.earnedBadgesCount || 0));
      const includeSubjects = Boolean(body.includeSubjectDetails);
      const subjects = Array.isArray(body.subjects) ? body.subjects.slice(0, 8) : [];
      const generatedAtIso = new Date().toISOString();

      const subject = sanitizeHeader(
        `أكاديمية عزيز — تقرير متابعة الولي (${cadenceLabel}) للتلميذ: ${studentName}`
      );

      const subjectLines = includeSubjects
        ? subjects
            .map(
              (s) =>
                `- ${String(s.name || '').slice(0, 40)}: ${Number(s.completedLessons || 0)}/${Number(s.totalLessons || 0)} درساً (${Number(s.completionPercent || 0)}%) · الدقة ${Number(s.accuracy || 0)}%`
            )
            .join('\n')
        : 'تم إخفاء تفاصيل المواد حسب إعدادات الخصوصية المختارة من الولي.';

      const textBody = [
        `السلام عليكم ورحمة الله وبركاته،`,
        ``,
        `هذا ملخّص متابعة التلميذ "${studentName}" (${gradeLabel} - ولاية ${governorate}) من منصة أكاديمية عزيز 2026:`,
        `- نسبة الإتقان السنوي: ${masteryPercent}% (${completedLessonsCount} من أصل ${totalLessonsCount} درساً)`,
        `- متوسط الدقة في التمارين: ${accuracyPercent > 0 ? `${accuracyPercent}%` : 'لا توجد تمارين مصححة بعد'}`,
        `- الرصيد والأوسمة: ${points} نقطة · ${earnedBadgesCount} أوسمة`,
        `- المواظبة المتواصلة: ${streakDays} أيام`,
        ``,
        includeSubjects ? `تفاصيل الأداء حسب المواد:` : `ملف الخصوصية:`,
        subjectLines,
        ``,
        `دورية الإشعار المفعّلة: ${cadenceLabel}`,
        `تاريخ الإصدار: ${generatedAtIso.slice(0, 10)}`,
        `مع أطيب التمنيات بالنجاح والتفوّق — فريق أكاديمية عزيز.`,
      ].join('\n');

      const subjectRowsHtml = includeSubjects
        ? subjects
            .map(
              (s) => `
                <tr>
                  <td style="padding:8px;border:1px solid #e2e8f0;font-weight:700">${escapeHtml(String(s.name || ''))}</td>
                  <td style="padding:8px;border:1px solid #e2e8f0">${Number(s.completedLessons || 0)} / ${Number(s.totalLessons || 0)}</td>
                  <td style="padding:8px;border:1px solid #e2e8f0">${Number(s.completionPercent || 0)}%</td>
                  <td style="padding:8px;border:1px solid #e2e8f0">${Number(s.accuracy || 0)}%</td>
                </tr>`
            )
            .join('')
        : '';

      const htmlBody = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="utf-8" /><title>${escapeHtml(subject)}</title></head>
<body style="font-family:Tahoma,Arial,sans-serif;background:#f8fafc;color:#0f172a;padding:24px;direction:rtl;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;border:2px solid #bae6fd;border-radius:16px;padding:24px;">
    <h2 style="margin:0 0 8px 0;color:#0369a1;">أكاديمية عزيز — متابعة ولي الأمر 2026</h2>
    <p style="margin:0 0 16px 0;color:#475569;font-size:14px;">التلميذ: <strong>${escapeHtml(studentName)}</strong> · ${escapeHtml(gradeLabel)} · ولاية ${escapeHtml(governorate)}</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
      <div style="background:#f0f9ff;padding:12px;border-radius:10px;"><strong>الإتقان:</strong> ${masteryPercent}% (${completedLessonsCount}/${totalLessonsCount})</div>
      <div style="background:#ecfdf5;padding:12px;border-radius:10px;"><strong>الدقة:</strong> ${accuracyPercent}%</div>
      <div style="background:#fffbeb;padding:12px;border-radius:10px;"><strong>النقاط والأوسمة:</strong> ${points} نقطة · ${earnedBadgesCount} أوسمة</div>
      <div style="background:#fff7ed;padding:12px;border-radius:10px;"><strong>المواظبة:</strong> ${streakDays} أيام</div>
    </div>
    ${
      includeSubjects && subjects.length > 0
        ? `<table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:16px;">
            <thead><tr style="background:#f1f5f9;"><th style="padding:8px;border:1px solid #e2e8f0;">المادة</th><th style="padding:8px;border:1px solid #e2e8f0;">الدروس</th><th style="padding:8px;border:1px solid #e2e8f0;">الإنجاز</th><th style="padding:8px;border:1px solid #e2e8f0;">الدقة</th></tr></thead>
            <tbody>${subjectRowsHtml}</tbody>
          </table>`
        : `<p style="font-size:13px;color:#64748b;">تفاصيل المواد محجوبة وفق تفضيل الخصوصية المحدّد.</p>`
    }
    <p style="font-size:12px;color:#64748b;border-top:1px solid #e2e8f0;padding-top:12px;">نموذج الإرسال الدوري: ${escapeHtml(cadenceLabel)} · تاريخ الإصدار: ${generatedAtIso.slice(0, 10)}</p>
  </div>
</body>
</html>`;

      const encodedSubject = `=?UTF-8?B?${Buffer.from(subject, 'utf8').toString('base64')}?=`;
      const emlContent = [
        `To: ${parentEmail}`,
        `Subject: ${encodedSubject}`,
        `MIME-Version: 1.0`,
        `Content-Type: text/html; charset=UTF-8`,
        `Content-Transfer-Encoding: 8bit`,
        ``,
        htmlBody,
      ].join('\r\n');

      let deliveryMode: 'webhook_dispatched' | 'generated_eml' = 'generated_eml';
      const webhookUrl = process.env.PARENT_DIGEST_WEBHOOK_URL?.trim();
      if (webhookUrl) {
        try {
          const hookRes = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: parentEmail,
              subject,
              textBody,
              htmlBody,
              cadence: cadenceKey,
              generatedAtIso,
            }),
          });
          if (hookRes.ok) {
            deliveryMode = 'webhook_dispatched';
          }
        } catch {
          // Non-fatal: still return generated .eml & preview cleanly
        }
      }

      res.json({
        ok: true,
        deliveryMode,
        subject,
        textBody,
        emlContent,
        generatedAtIso,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'تعذّر توليد ملخّص متابعة ولي الأمر.';
      res.status(500).json({ error: message });
    }
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        ws: { server: httpServer },
        allowedHosts: true,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('/{*splat}', (_req, res) => {
      const indexHtml = path.join(distDir, 'index.html');
      if (fs.existsSync(indexHtml)) {
        res.sendFile(indexHtml);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
