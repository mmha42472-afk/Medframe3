# Security Specification for MedFrame Studio

## 1. Data Invariants
- **Public Visibility Boundary**: Only doctor profiles with `status == "published"` may be read by unauthenticated visitors or non-admin users. Drafts and archived profiles are restricted strictly to verified administrators.
- **Admin Mutation Exclusivity**: Doctors collection documents (`/doctors/{doctorId}`) cannot be created, updated, or deleted by any unauthenticated visitor or non-admin user.
- **Admin Identity**: Admin privileges are gated through Firebase custom claims (`token.admin == true`), trusted document existence in `/admins/{adminId}`, or the bootstrapped verified admin email `mmha42472@gmail.com`.
- **Slug and ID Sanitization**: All document IDs and slugs must conform to `^[a-zA-Z0-9_\\-]+$` with bounded string lengths ($\le 128$ characters).

## 2. Dirty Dozen Security Payloads (Rejected by Rules)
1. Unauthenticated write attempting to create a fake doctor profile.
2. Unauthenticated user querying `doctors` with status `draft`.
3. Non-admin authenticated user attempting to publish or modify an existing doctor.
4. Payload with document ID exceeding 128 characters or containing illegal path traversal symbols.
5. Updating a doctor with a spoofed or empty `status` string.
6. Spoofed email without `email_verified == true`.
7. Non-admin attempting to delete an active doctor website.
8. Writing to `/admins/{adminId}` by an unprivileged user.
9. Attempting to bypass the default catch-all denial for arbitrary collections.
10. Payload with an excessively oversized name string (>200 chars).
11. Reading private draft doctor profiles through direct document get.
12. Shadow update attempting to inject unauthorized admin flags into a regular doctor document.

## 3. Rules Implementation
The rules in `firestore.rules` implement zero-trust ABAC, default denial, strict type and size bounds, and admin gates.
