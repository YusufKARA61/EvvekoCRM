import re


def normalize_phone(phone: str) -> str:
    """Turkiye telefon numarasini normalize eder. -> +905XXXXXXXXX"""
    digits = re.sub(r"\D", "", phone)

    if digits.startswith("90") and len(digits) == 12:
        return f"+{digits}"
    elif digits.startswith("0") and len(digits) == 11:
        return f"+9{digits}"
    elif len(digits) == 10 and digits.startswith("5"):
        return f"+90{digits}"

    return phone
