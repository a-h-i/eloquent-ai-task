from langchain_core.documents import Document


def build_faq_documents() -> list[Document]:
    # Fictional fintech company FAQ set. Small, focused, diverse, and chunkable.
    docs = [
        Document(
            page_content=(
                "Account creation: To create an account, provide your full name, email, and a strong password. "
                "We require phone verification using a one-time code sent via SMS. "
                "Accounts are available to residents of supported countries; see eligibility in our Terms."
            ),
            metadata={"category": "account", "topic": "creation", "slug": "account-creation"},
        ),
        Document(
            page_content=(
                "Identity verification: We verify identity with a government-issued ID and a quick liveness check. "
                "Most verifications complete within 2 minutes, but may take up to 24 hours during peak times."
            ),
            metadata={"category": "account", "topic": "verification", "slug": "identity-verification"},
        ),
        Document(
            page_content=(
                "Payments: You can send payments domestically via bank transfer or debit card. "
                "Transfers typically settle within minutes, but bank processing can delay up to 1 business day."
            ),
            metadata={"category": "payments", "topic": "domestic-transfers", "slug": "payments-domestic"},
        ),
        Document(
            page_content=(
                "International transfers: Supported corridors are listed in the app. "
                "FX rates are quoted upfront with a transparent fee. "
                "Delivery estimates vary by corridor, generally 5 minutes to 2 business days."
            ),
            metadata={"category": "payments", "topic": "international", "slug": "payments-international"},
        ),
        Document(
            page_content=(
                "Cards: Virtual cards are available instantly after verification. "
                "Physical cards ship within 5–7 business days. You can freeze or unfreeze your card in the app."
            ),
            metadata={"category": "cards", "topic": "management", "slug": "cards-management"},
        ),
        Document(
            page_content=(
                "Security: We use device binding, passkeys, and optional 2FA. "
                "For suspicious activity, freeze your account in-app and contact support. "
                "Never share one-time passcodes with anyone."
            ),
            metadata={"category": "security", "topic": "best-practices", "slug": "security-best-practices"},
        ),
        Document(
            page_content=(
                "Disputes and chargebacks: File a dispute within 60 days of the statement date. "
                "Provide receipts and correspondence. We usually resolve within 10 business days."
            ),
            metadata={"category": "support", "topic": "disputes", "slug": "support-disputes"},
        ),
        Document(
            page_content=(
                "Compliance: We follow KYC, AML, and sanctions screening requirements. "
                "We may request additional information to satisfy regulatory checks."
            ),
            metadata={"category": "compliance", "topic": "kyc-aml", "slug": "compliance-kyc-aml"},
        ),
        Document(
            page_content=(
                "Limits: New accounts have conservative limits that increase with successful usage and verification. "
                "View your current limits in Settings > Limits."
            ),
            metadata={"category": "limits", "topic": "tiers", "slug": "limits-tiers"},
        ),
        Document(
            page_content=(
                "Fees: We show fees transparently before you confirm any transfer. "
                "There are no hidden monthly maintenance fees for personal accounts."
            ),
            metadata={"category": "fees", "topic": "transparency", "slug": "fees-transparency"},
        ),
        Document(
            page_content=(
                "Data privacy: We never sell your personal data. "
                "You can request deletion of your data subject to legal retention requirements."
            ),
            metadata={"category": "privacy", "topic": "data-rights", "slug": "privacy-data-rights"},
        ),
        Document(
            page_content=(
                "API access: Business accounts can request API keys for payouts and balance retrieval. "
                "Keys can be restricted by IP and rotated from the dashboard."
            ),
            metadata={"category": "business", "topic": "api", "slug": "business-api"},
        ),
    ]
    return docs
