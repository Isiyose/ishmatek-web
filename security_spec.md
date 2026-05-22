# Security Specification — Zero-Trust ABAC Security Design

This spec describes the authorization rules, strict data invariants, and hostile payloads verified for validation on our Firestore database.

## 1. Data Invariants

- **Read Access**: Anyone (all authenticated users) can read the status of devices, operators, metrics, and global status logs to maintain operational synchronicity.
- **Device Invariants**:
  - Write checks require authentication.
  - Device IDs in the payload must match the document path variable (`deviceId`).
  - Device coordinate fields (`lat`, `lng`) must remain within logical ranges.
- **User/Operator Tracker Invariants**:
  - An operator can only write or post-coordinate coordinates belonging to their own `userId` path (where `userId == request.auth.uid`).
  - Self-assigned privilege escalation or changing other users' metadata is blocked.
- **Metrics Invariants**:
  - Centralized operational indicators are structurally validated against arbitrary scale values.
- **Logs Invariants**:
  - Global console entries can only be posted by active workers (`isSignedIn()`).

## 2. The Dirty Dozen Payloads

Below are twelve malicious payloads designed to hijack identity, integrity, or system states, and which MUST return `PERMISSION_DENIED`:

1. **Malicious Device Registration (Identity Spoofing)**: Trying to add a device status payload as an unauthenticated guest.
2. **Device Path Hijacking (ID Poisoning)**: Target path `/devices/SN-ABC` but payload contains `"id": "SN-XYZ"` to trigger key mismatch issues.
3. **Ghost Field Spraying (Shadow Update Attack)**: Submitting a valid device status alongside an unapproved system-admin modifier key: `{"id": "SN-001", "isSystemAdminApproved": true}`.
4. **Denial of Wallet Attack**: Generating a massive 10MB junk payload string into a status log field to exhaust indexing costs.
5. **Operator Identity Theft (Self-Assigned Session)**: Authenticated as operator `U_A_102` but attempting to modify operator `U_B_999`'s GPS points.
6. **Privilege Escalation Bypass**: Submitting a registration payload modifying your user role to `"Super Admin"` on a restricted path.
7. **Negative Boundaries Telemetry**: Attempting to set local telemetry temperature to absolute zero OR general limits: `{"temp": -9999.0}`.
8. **Malicious Empty Telemetry Payload**: Triggering state corruption through an empty metrics update schema violating properties constraints.
9. **Fake Verification Claim**: Injecting fake verification parameters into a user metadata document.
10. **Terminal Sync Bypass**: Overwriting a system log with critical diagnostic alerts using fake timestamp values from the client rather than the server clock.
11. **Orphaned Writes Injection**: Posting telemetry indicators referencing missing parent device configurations.
12. **Blanket Query Scraping**: Forcing database scans through unindexed blanket client selectors.

---

## 3. The Firebase Security Rules

Below is the zero-trust `firestore.rules` blueprint enforcing absolute structural integrity:
