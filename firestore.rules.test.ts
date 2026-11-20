/**
 * Phase 0: Payload-First Security Test Specification ("Dirty Dozen" Payloads)
 * Verifies every adversarial payload violates blueprint & rules invariants.
 */

export interface DirtyDozenTestCase {
  id: number;
  name: string;
  targetPath: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  authContext: { uid: string | null; emailVerified: boolean };
  payload?: Record<string, unknown>;
  expectedOutcome: 'PERMISSION_DENIED';
  enforcedByRule: string;
}

export const DIRTY_DOZEN_CASES: DirtyDozenTestCase[] = [
  {
    id: 1,
    name: 'Unauthenticated Read/Write',
    targetPath: '/users/uid1/students/stu1',
    operation: 'get',
    authContext: { uid: null, emailVerified: false },
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedByRule: 'isOwner(userId) && isEmailVerified()',
  },
  {
    id: 2,
    name: 'Unverified Email Spoof',
    targetPath: '/users/uid1',
    operation: 'create',
    authContext: { uid: 'uid1', emailVerified: false },
    payload: { ownerId: 'uid1', activeStudentId: '' },
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedByRule: 'isEmailVerified() requires request.auth.token.email_verified == true',
  },
  {
    id: 3,
    name: 'Cross-Tenant Identity Spoof',
    targetPath: '/users/uid1/students/stu1',
    operation: 'create',
    authContext: { uid: 'uid2', emailVerified: true },
    payload: { ownerId: 'uid2', studentName: 'عزيز', selectedGrade: 5 },
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedByRule: 'isOwner(userId) && data.ownerId == request.auth.uid',
  },
  {
    id: 4,
    name: 'Orphaned Student Write',
    targetPath: '/users/uid1/students/stu1',
    operation: 'create',
    authContext: { uid: 'uid1', emailVerified: true },
    payload: { ownerId: 'uid1', studentName: 'عزيز', selectedGrade: 5 },
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedByRule: 'Master Gate exists(/databases/$(database)/documents/users/$(userId))',
  },
  {
    id: 5,
    name: 'Orphaned Report with Mismatched studentId',
    targetPath: '/users/uid1/students/stu1/progressReports/rep1',
    operation: 'create',
    authContext: { uid: 'uid1', emailVerified: true },
    payload: { ownerId: 'uid1', studentId: 'otherStu' },
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedByRule: 'data.studentId == studentId && exists(parent student)',
  },
  {
    id: 6,
    name: 'Shadow / Ghost Field Injection',
    targetPath: '/users/uid1/students/stu1',
    operation: 'create',
    authContext: { uid: 'uid1', emailVerified: true },
    payload: { ownerId: 'uid1', studentName: 'عزيز', isAdmin: true },
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedByRule: 'data.keys().hasAll(...) && data.keys().hasOnly(...)',
  },
  {
    id: 7,
    name: 'ID Poisoning (Oversized Path Variable)',
    targetPath: `/users/uid1/students/${'a'.repeat(120)}`,
    operation: 'create',
    authContext: { uid: 'uid1', emailVerified: true },
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedByRule: 'isValidStudentDocId(studentId) enforces size() <= 64 and regex',
  },
  {
    id: 8,
    name: 'Resource Poisoning (Oversized Student Name)',
    targetPath: '/users/uid1/students/stu1',
    operation: 'create',
    authContext: { uid: 'uid1', emailVerified: true },
    payload: { ownerId: 'uid1', studentName: 'x'.repeat(120) },
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedByRule: 'data.studentName.size() <= 60',
  },
  {
    id: 9,
    name: 'Value Poisoning (Invalid Grade or Negative Points)',
    targetPath: '/users/uid1/students/stu1',
    operation: 'update',
    authContext: { uid: 'uid1', emailVerified: true },
    payload: { points: -50, selectedGrade: 99 },
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedByRule: 'isValidStudentProfile(incoming()) validates grade in [3,4,5,6] and points >= 0',
  },
  {
    id: 10,
    name: 'Client-Forged Timestamp',
    targetPath: '/users/uid1/students/stu1/progressReports/rep1',
    operation: 'create',
    authContext: { uid: 'uid1', emailVerified: true },
    payload: { ownerId: 'uid1', createdAt: '2020-01-01T00:00:00Z' },
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedByRule: 'incoming().createdAt == request.time',
  },
  {
    id: 11,
    name: 'Immutable Field Mutation',
    targetPath: '/users/uid1/students/stu1',
    operation: 'update',
    authContext: { uid: 'uid1', emailVerified: true },
    payload: { ownerId: 'uid2' },
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedByRule: 'incoming().ownerId == existing().ownerId && affectedKeys().hasOnly(...)',
  },
  {
    id: 12,
    name: 'Blanket List Query Scraping',
    targetPath: '/users/uid1/students',
    operation: 'list',
    authContext: { uid: 'uid2', emailVerified: true },
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedByRule: 'allow list: if isSignedIn() && isEmailVerified() && existing().ownerId == request.auth.uid',
  },
];
