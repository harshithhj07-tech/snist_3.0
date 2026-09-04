# Security Specification & Test Suite (Phase 0)

## 1. Data Invariants

1. **Profile Isolation**: Every user profile under `/profiles/{userId}` belongs strictly to `{userId}`. Users can only read or modify their own profile data.
2. **AI Conversation Identity**: An AI Conversation thread must have a valid string `id` and `title`. If `userId` is supplied, it must match the authenticated user's ID or the default session owner.
3. **Subcollection Relational Guard**: All child collections under `/profiles/{userId}/*` require identity verification against `{userId}`.
4. **Input Length Bounds**: No free-text string field in AI conversations, messages, or profile details may exceed its defined schema bounds (e.g. content max 10,000 characters; title max 200 characters).
5. **Path Validation**: Document IDs must conform to sanitization regex `^[a-zA-Z0-9_\-]+$` and have a length <= 128 chars.

---

## 2. The "Dirty Dozen" Threat Payloads

Below are 12 malicious or invalid payloads designed to exploit identity gaps, field poisoning, size overflow, or unauthorized reads/writes:

1. **Payload 1: Unauthenticated Profile Write**
   - Attempting to overwrite `/profiles/victim123` with no `request.auth`.
2. **Payload 2: Cross-User Profile Tampering**
   - User `attacker_uid` writing to `/profiles/victim_uid`.
3. **Payload 3: Oversized Content Denial-of-Wallet Attack**
   - Injecting a 50,000-character string into `content` in a `/profiles/{userId}/messages` document.
4. **Payload 4: Invalid Document ID Injection**
   - Writing to document path containing illegal script tags `/profiles/uid/documents/<script>alert(1)</script>`.
5. **Payload 5: Malformed AI Conversation Object**
   - Missing required field `title` or using numeric type for `id` in `ai_conversations`.
6. **Payload 6: Unauthorized Conversation Deletion**
   - Deleting an `ai_conversation` belonging to another user.
7. **Payload 7: Unbounded Array Injection**
   - Attempting to insert an array with 1,000 items into `existingDocs`.
8. **Payload 8: Type Mismatch Injection**
   - Passing a boolean for `title` or integer for `name`.
9. **Payload 9: Shadow Field Injection**
   - Injecting unapproved elevated permission keys (e.g., `isAdmin: true`) into `profile`.
10. **Payload 10: Unauthenticated Vault Read**
    - Reading `/profiles/target_user/documents/doc123` without authentication.
11. **Payload 11: Cross-Tenant Timeline Event Poisoning**
    - Creating a timeline event in another user's timeline.
12. **Payload 12: Orphaned Subcollection Write**
    - Writing to a subcollection when the user is not the authenticated owner of the parent profile.

---

## 3. Test Suite Verification

All "Dirty Dozen" payloads must trigger `PERMISSION_DENIED` errors under the Eight Pillars rules set.
