# QCF Civilization ID v1.0

## Principle

**One Human. One Civilization ID.**

Civilization ID is a QCF membership and participation identity. It is not a passport, citizenship document, government identity, payment credential or medical identity.

## All-in-One bindings

The ID can bind verified account methods without centralising raw biometric secrets.

### Core identity
- verified email
- verified mobile number
- Civilization ID number

### Device-bound authenticators
- Apple Face ID / Touch ID through WebAuthn / Passkeys
- Android / Google biometric unlock through WebAuthn / Passkeys
- hardware security keys (FIDO2)
- platform passkeys

QCF stores only the public-key credential, credential ID and authenticator metadata required for verification. **QCF must never receive or store fingerprint templates, face templates, Secure Enclave secrets or private keys.**

### Apple / Google account bindings
Store only OAuth/OpenID Connect provider subject identifiers and verified email status. Never store Apple or Google passwords, private keys or recovery codes.

### DNA credential
DNA is optional and requires explicit separate consent.

QCF must not place raw genomic files, variant files or genetic sequences in the Civilization ID record. A DNA binding may contain only:
- credential hash
- issuing laboratory or credential issuer
- verification status
- optional proof URL / verifiable credential reference
- consent version

Raw genomic data belongs in a separately governed health/genomics vault, not the CRM.

## Card display

The member card may show:
- Civilization ID
- display name / envoy name
- issue date
- QR verification URL
- subscription interests
- verified email / phone status
- Passkey status
- Apple / Google account status
- DNA credential status (optional)

It must never show:
- raw fingerprint / face data
- full phone number
- private keys
- OAuth tokens
- DNA sequence
- recovery codes

## Email footer

Every QCF brief sent to an active Civilization Co-builder may include:
- display name
- Civilization ID
- QR verification link
- three brief-interest pillars
- privacy / preference / unsubscribe links

The footer should not include biometric or genetic information.

## Required production controls

Before activating production identity binding:
1. Server-side WebAuthn challenge generation and verification.
2. HTTPS-only cookies and CSRF protection.
3. Rate limiting and abuse monitoring.
4. Encrypted secrets.
5. Phone verification provider.
6. Apple and Google OAuth apps.
7. Separate explicit DNA consent and privacy assessment.
8. Recovery and account-compromise process.
9. Audit log for every binding / unbinding event.
10. Swiss / EU data-protection review.
