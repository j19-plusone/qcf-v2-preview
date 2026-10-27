# Unified Civilization ID — 27 October 2026

Implementation status: leaderboard UI and strict public projection validator prepared. Authentication, account linking, passkeys and ledger connection are NOT implemented by this change. Production remains unchanged until reviewed and connected.

## Confirmed user requirements
- Founder Jessica Sage retains 2026000001. Do not allocate this ID again, derive it from email input, or allow self-claimed administrator access.
- One account may link email, phone, Apple, GitHub and World identities after verification. A new login method must be linked from an authenticated account with reauthentication and proof of control. Email equality alone is not an account merge policy.
- Existing Lumina governance system is the first integration target, not a second competing ledger. Inspect authenticated capabilities and obtain its repository/API before changing its authentication.
- Public leaderboard contains exactly civilization_id, q and category; labels: QCF管理员, 共建者会员, 共建者非会员. Never publish contact details or authentication identities. Backend must independently authorise publication of each row.
- Energy Q is non-transferable contribution recognition. Imported article, initiative and milestone awards require source, reviewer, timestamp and unique event ID to prevent duplicate awards. Existing 500 Q per-person milestone instruction is not proof of an existing ledger entry. Never seed invented balances.
- Keep display category separate from internal committee authorisation. Membership or score does not grant access to Lumina.

## Authentication design to integrate after inspecting backend
- Stable server-owned person/account key, immutable unique civilization_id, unique(provider, provider_subject). Allocate new IDs atomically in the database; reserve founder identity using an authenticated, audited administrative operation.
- Existing user's data is accessible only through an authenticated /me response. Local demo records are not identity evidence and cannot be silently promoted.
- Email and phone require verified one-time challenges, expiry and rate limits. OAuth/OIDC needs provider configuration, state/nonce/PKCE and server-side verification. World credentials must be verified by its supported server verification flow, not a typed wallet address.
- Passkeys use WebAuthn with server-generated one-time challenges, origin/RP validation and a reviewed verification library. Private keys remain with the device/password manager; server stores credential public keys. Website operator and assistant never save plaintext passwords.
- User opt-ins (unchecked): “为此文明 ID 创建通行密钥” and “在此设备保持登录”. Keep these separate: account linking alone does not imply persistent login consent. Remembered session cookies must be HttpOnly, Secure, appropriately SameSite, rotated, expiring and revocable. Sign-out/revoke removes access. Sensitive governance actions require reauthentication.
- qcf.org.cn and lumina.tradealliance.vip are separate sites. Do not copy cookies or promise shared passkeys. Use a deliberately configured central identity provider/SSO with separate site sessions if supported.

## Acceptance tests before enabling real founder login
1. Verified founder sign-in returns 2026000001; an unverified matching email cannot claim it.
2. Link each supported provider, log out, sign in with each: same ID and balance. Conflicting existing bindings are rejected.
3. Concurrent new registrations never duplicate IDs; test IDs never enter official namespace.
4. Session persists only with opt-in; expired/revoked sessions fail. Registration and login replay challenges fail.
5. Backend rejects non-committee users even when client role or Q is modified.
6. Duplicate imported award is rejected; leaderboard contains only confirmed public rows and no private data.
7. Cross-device recovery and missing passkey flows are tested without loss of ID.
