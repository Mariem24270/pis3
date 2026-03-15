import requests
from django.conf import settings


def send_whatsapp_message(to_phone: str, text: str) -> dict:
    instance = getattr(settings, "ULTRAMSG_INSTANCE", "")
    token = getattr(settings, "ULTRAMSG_TOKEN", "")

    if not instance or not token:
        return {"ok": False, "error": "ULTRAMSG_INSTANCE ou ULTRAMSG_TOKEN manquant dans settings.py"}

    # Nettoyer le numéro — garder seulement les chiffres
    phone = to_phone.strip().replace("+", "").replace(" ", "").replace("-", "")

    # Ajouter indicatif +222 si numéro mauritanien sans indicatif
    if len(phone) == 8:
        phone = "222" + phone

    url = f"https://api.ultramsg.com/{instance}/messages/chat"

    data = {
        "token": token,
        "to": phone,
        "body": text,
        "priority": 1,
    }

    try:
        resp = requests.post(url, data=data, timeout=15)
        print("=== ULTRAMSG RÉPONSE ===", resp.status_code, resp.text)
        return resp.json()
    except requests.RequestException as e:
        print("=== ULTRAMSG ERREUR ===", str(e))
        return {"ok": False, "error": str(e)}