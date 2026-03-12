import re
import unicodedata
from datetime import datetime
from typing import Optional, Dict, Any

from django.conf import settings
from django.utils import timezone

from PIL import Image
import pytesseract


def _normalize(s: str) -> str:
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    return s.lower()


def ocr_image_to_text(image_field) -> str:
    # Windows: si settings.TESSERACT_CMD existe
    cmd = getattr(settings, "TESSERACT_CMD", None)
    if cmd:
        pytesseract.pytesseract.tesseract_cmd = cmd

    img = Image.open(image_field).convert("RGB")
    return pytesseract.image_to_string(img) or ""


def extract_nni_from_text(text: str) -> Optional[str]:
    # NNI souvent 10 chiffres (ex: 9691186290)
    candidates = re.findall(r"\b\d{10}\b", text)
    return candidates[0] if candidates else None


def parse_bankili_text(text: str) -> Dict[str, Any]:
    """
    Extrait depuis la capture:
    - status_type: "transfert" / "demande" / None
    - receiver
    - amount (MRU)
    - trs_id
    - paiement_dt (aware)
    """
    t = _normalize(text)

    status_type = None
    if "transfert reussi" in t or "transfert reussi!" in t:
        status_type = "transfert"
    elif "demande reussie" in t or "demande reussie!" in t:
        status_type = "demande"

    receiver = None
    m = re.search(r"receveur\s*[:\-]?\s*(\d+)", t)
    if m:
        receiver = m.group(1)

    amount = None
    m = re.search(r"montant\s*(envoye|envoy[eé])?\s*[:\-]?\s*([0-9][0-9\s]*)\s*mru", t)
    if m:
        digits = re.sub(r"\s+", "", m.group(2))
        try:
            amount = int(digits)
        except ValueError:
            amount = None

    trs_id = ""
    m = re.search(r"(trs\s*id|trsid)\s*[:\-]?\s*([0-9a-zA-Z]+)", t)
    if m:
        trs_id = m.group(2)

    paiement_dt = None
    m = re.search(r"date\s*et\s*heure\s*[:\-]?\s*(\d{2}[-/]\d{2}[-/]\d{2})\s+(\d{2}:\d{2}:\d{2})", t)
    if m:
        date_part = m.group(1).replace("/", "-")
        time_part = m.group(2)
        try:
            naive = datetime.strptime(f"{date_part} {time_part}", "%d-%m-%y %H:%M:%S")
            tz = timezone.get_current_timezone()
            paiement_dt = timezone.make_aware(naive, tz)
        except ValueError:
            paiement_dt = None

    return {
        "status_type": status_type,
        "receiver": receiver,
        "amount": amount,
        "trs_id": trs_id,
        "paiement_dt": paiement_dt,
        "raw_text": text,
    }