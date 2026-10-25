import os
import requests
import base64
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("SARVAM_API_KEY")

tts_url = "https://api.sarvam.ai/text-to-speech"
headers = {
    "api-subscription-key": api_key,
    "Content-Type": "application/json"
}

# Generate Scam Call Audio in Hindi (Impersonating Inspector Shinde)
scam_script = "मिस्टर वर्मा, मैं मुंबई साइबर क्राइम सेल से इंस्पेक्टर शिंदे बोल रहा हूँ। आपके आधार कार्ड से केनरा बैंक में 4 करोड़ रुपये की मनी लॉन्ड्रिंग और ड्रग्स पार्सल का केस दर्ज हुआ है। आप इस समय डिजिटली अरेस्ट हो चुके हैं। तुरंत अपना वेबकैम ऑन रखिए और अपनी सारी बैंक डिटेल्स और बैलेंस आरबीआई के सेफ वॉल्ट अकाउंट में ट्रांसफर कीजिए जांच के लिए।"

payload = {
    "inputs": [scam_script],
    "target_language_code": "hi-IN",
    "speaker": "ratan_hi_customer_expressive",
    "model": "bulbul:v4-flash",
    "pace": 1.05
}

res = requests.post(tts_url, headers=headers, json=payload, timeout=25)
print("Scam call TTS status:", res.status_code)
if res.status_code == 200:
    b64 = res.json()["audios"][0]
    with open("frontend/public/scam_call.wav", "wb") as f:
        f.write(base64.b64decode(b64))
    print("Saved frontend/public/scam_call.wav successfully!")
