# QCF Foundation CRM Architecture

## Public layer
- news headline + concise summary
- QCF-E / QCF-L / QCF-U research archive
- free Civilization Co-builder registration
- interest preference selection
- donation and activity entry points
- votes and initiatives

## Identity lifecycle
pending → email_verified → active → unsubscribed / suspended / deleted

Civilization ID is separate from donor, voter and administrator permissions.

## CRM workspace
- Dashboard
- Co-builders
- Briefs & News
- Communications
- Donations
- Activities
- Civilization Voting
- Civilization Initiatives
- Governance & Audit

## Email architecture
Planned sender after DNS verification: QCF Foundation <Founder@qcf.org.cn>

Resend opt-in topics:
- QCF-E｜量子科技与能源
- QCF-L｜生命科学
- QCF-U｜文明研究
- QCF公益活动通知
- QCF文明投票与倡议

All non-transactional mail requires recorded opt-in.

## Privacy requirements before production
- explicit consent and privacy notice
- double opt-in
- unsubscribe and preference centre
- data export/deletion
- minimal-data policy
- retention schedule
- role-based access
- audit logging
- secret management
- Swiss/EU data-protection review

## Open-source product
Working name: Foundation Commons CRM.
QCF remains the reference implementation while QCF-specific branding, internal governance rules and private data stay outside the generic public core.
