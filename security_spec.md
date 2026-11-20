# Security Specification — Manarat Al-Taallum Firestore Rules

## 1. Data Invariants
1. **Default-Deny Net:** Any collection or document path not explicitly matched is denied for both read and write (`match /{document=**} { allow read, write: if false; }`).
2. **Ownership & Verified Identity:** All read/write operations require an authenticated user (`request.auth != null`) with a verified email (`request.auth.token.email_verified == true`) matching `{userId}` and `ownerId`.
3. **Master Gate Sync:** Subcollections (`/students/{studentId}`, `/activities/{activityId}`, `/progressReports/{reportId}`) cannot be created unless their parent document exists and is owned by `request.auth.uid`.
4. **Immutable Ownership & Timestamps:** `ownerId`, `studentId`, and `createdAt` can never be mutated on update; `createdAt == request.time` on create and `updatedAt == request.time` on update.
5. **Strict Schema & Bounds:** Every string enforces `.size()` bounds matching `firebase-blueprint.json`, every map enforces bounded key count, and `keys().hasAll(...) && keys().hasOnly(...)` blocks shadow fields.
6. **Zero PII Exposure:** Neither emails nor phone numbers are stored in Firestore documents; all documents are private to the owner UID (`allow list` evaluates `resource.data.ownerId == request.auth.uid` without `get()`).

## 2. The "Dirty Dozen" Adversarial Payloads (Must All Return PERMISSION_DENIED)
1. **Unauthenticated Read/Write:** Attempt `get`/`create` on `/users/uid1/students/stu1` with `auth: null`.
2. **Unverified Email Spoof:** Authenticated user with `email_verified: false` attempting `create` on `/users/uid1`.
3. **Cross-Tenant Identity Spoof:** User `uid2` attempting to read or write `/users/uid1/students/stu1` with `ownerId: 'uid2'`.
4. **Orphaned Student Write:** Creating `/users/uid1/students/stu1` when parent `/users/uid1` does not exist.
5. **Orphaned Activity/Report Write:** Creating `/users/uid1/students/stu1/progressReports/rep1` with mismatched `studentId: 'otherStu'`.
6. **Shadow / Ghost Field Injection:** Creating a `StudentProfile` containing an extra field `{ role: 'admin' }` or `{ isVerified: true }`.
7. **ID Poisoning (Oversized Path Variable):** Accessing `/users/uid1/students/${'a'.repeat(200)}` or invalid characters `stu$1`.
8. **Resource Poisoning (Oversized String):** Creating a `StudentProfile` with `studentName` length `> 60` (`'x'.repeat(120)`).
9. **Type Confusion (Value Poisoning):** Updating `points` on `StudentProfile` to a negative number (`-50`) or string (`"9999"`), or `selectedGrade` to `99`.
10. **Client-Forged Timestamp:** Creating `ProgressReport` with `createdAt: new Date('2020-01-01')` instead of `request.time`.
11. **Immutable Field Mutation:** Updating `StudentProfile` attempting to alter `ownerId` or `createdAt`, or updating an immutable `ProgressReport`.
12. **Blanket List Query Scraping:** Listing `/users/{uid1}/students` without ownership match (`uid2` listing `uid1` students).
