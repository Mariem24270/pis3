import re
import requests
from django.conf import settings


def normalize_phone(phone: str) -> str:
    phone = (phone or "").strip()
    phone = re.sub(r"[^\d+]", "", phone)

    if phone.startswith("+"):
        return phone

    digits = re.sub(r"\D", "", phone)
    if not digits:
        return ""

    cc = getattr(settings, "DEFAULT_COUNTRY_CODE", "+222")
    return f"{cc}{digits}"


def send_whatsapp_message(to_phone: str, text: str) -> dict:
    api_key = getattr(settings, "WASENDER_API_KEY", "")
    url = getattr(settings, "WASENDER_API_URL", "https://www.wasenderapi.com/api/send-message")

    if not api_key:
        return {"ok": False, "error": "WASENDER_API_KEY manquant dans settings.py"}

    to_phone = normalize_phone(to_phone)
    if not to_phone:
        return {"ok": False, "error": "Numéro téléphone invalide"}

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    data = {
        "to": to_phone,
        "text": text
    }

    try:
        resp = requests.post(url, json=data, headers=headers, timeout=15)
        try:
            return resp.json()
        except Exception:
            return {"ok": False, "status_code": resp.status_code, "text": resp.text}
    except requests.RequestException as e:
        return {"ok": False, "error": str(e)}
