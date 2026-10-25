import os
import requests
from dotenv import load_dotenv
from sarvamai import SarvamAI

load_dotenv()
api_key = os.getenv("SARVAM_API_KEY")

print(f"API Key present: {bool(api_key)}")

# 1. Test Chat Completion with sarvam-105b-conversations
print("\n--- Testing Sarvam-105B Conversations ---")
client = SarvamAI(api_subscription_key=api_key)
chat_res = client.chat.completions(
    model="sarvam-105b-conversations",
    messages=[
        {"role": "system", "content": "You are a cyber security intelligence agent. Output only JSON."},
        {"role": "user", "content": "Classify this call: 'Main CBI se bol raha hoon, aap digitally arrest ho chuke ho.' Output JSON with threat_score (0-100) and scam_type."}
    ],
    max_tokens=200
)
print("Chat reply:", chat_res.choices[0].message.content)

# 2. Test Text-to-Speech (Bulbul)
print("\n--- Testing Sarvam Bulbul TTS ---")
tts_url = "https://api.sarvam.ai/text-to-speech"
headers = {
    "api-subscription-key": api_key,
    "Content-Type": "application/json"
}

tts_payload = {
    "inputs": ["चेतावनी! यह एक फर्जी डिजिटल अरेस्ट फ्रॉड कॉल है। तुरंत कॉल काटें।"],
    "target_language_code": "hi-IN",
    "speaker": "shubh",
    "model": "bulbul:v4-flash"
}

tts_res = requests.post(tts_url, headers=headers, json=tts_payload, timeout=20)
print(f"TTS Status: {tts_res.status_code}")
if tts_res.status_code != 200:
    print(f"TTS Error text: {tts_res.text}")
    # Try fallback model if v4-flash isn't available
    print("Retrying with bulbul:v1 / bulbul:v2 ...")
    tts_payload["model"] = "bulbul:v2"
    tts_res = requests.post(tts_url, headers=headers, json=tts_payload, timeout=20)
    print(f"TTS v2 Status: {tts_res.status_code}")
    if tts_res.status_code != 200:
        tts_payload["model"] = "bulbul:v1"
        tts_res = requests.post(tts_url, headers=headers, json=tts_payload, timeout=20)
        print(f"TTS v1 Status: {tts_res.status_code}")

if tts_res.status_code == 200:
    audios = tts_res.json().get("audios", [])
    print(f"Generated {len(audios)} audio(s), base64 length: {len(audios[0]) if audios else 0}")
    # Save test sample
    if audios:
        import base64
        with open("sample_warning.wav", "wb") as f:
            f.write(base64.b64decode(audios[0]))
        print("Saved sample_warning.wav successfully!")
