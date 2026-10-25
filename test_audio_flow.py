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

# 1. Authoritative Warning Alert
payload_warning = {
    "inputs": ["सावधान! यह एक फर्जी डिजिटल अरेस्ट फ्रॉड कॉल है। भारत में डिजिटल अरेस्ट का कोई कानून नहीं है। तुरंत यह कॉल काटें।"],
    "target_language_code": "hi-IN",
    "speaker": "simran_hi_news_breaking",
    "model": "bulbul:v4-flash"
}

res = requests.post(tts_url, headers=headers, json=payload_warning, timeout=20)
print(f"Warning TTS Status: {res.status_code}")
if res.status_code == 200:
    b64 = res.json()["audios"][0]
    with open("frontend/public/warning.wav", "wb") as f:
        f.write(base64.b64decode(b64))
    print(f"Saved frontend/public/warning.wav ({len(b64)} chars base64)")

# 2. Banarasi Uncle Honeypot Voice
payload_honeypot = {
    "inputs": ["अरे साहब, हम तो बहुत डर गए हैं! हमको जेल मत भेजिए। हम तो बूढ़े आदमी हैं। कौनसे बैंक खाते में पैसे भेजने हैं, धीरे-धीरे आईएफएससी कोड बताइए..."],
    "target_language_code": "hi-IN",
    "speaker": "ashok_hi_character",
    "model": "bulbul:v4-flash"
}

res2 = requests.post(tts_url, headers=headers, json=payload_honeypot, timeout=20)
print(f"Honeypot TTS Status: {res2.status_code}")
if res2.status_code == 200:
    b64 = res2.json()["audios"][0]
    with open("frontend/public/honeypot.wav", "wb") as f:
        f.write(base64.b64decode(b64))
    print(f"Saved frontend/public/honeypot.wav ({len(b64)} chars base64)")

# 3. Test Speech-to-Text with Saaras v2
stt_url = "https://api.sarvam.ai/speech-to-text"
with open("frontend/public/warning.wav", "rb") as f:
    files = {"file": ("warning.wav", f, "audio/wav")}
    data = {"model": "saaras:v2", "language_code": "hi-IN"}
    res_stt = requests.post(stt_url, headers={"api-subscription-key": api_key}, files=files, data=data, timeout=20)
    print(f"STT Status: {res_stt.status_code}")
    if res_stt.status_code == 200:
        print("STT Transcript:", res_stt.json().get("transcript"))
