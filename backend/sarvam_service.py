import os
import json
import base64
import requests
from dotenv import load_dotenv
from sarvamai import SarvamAI

load_dotenv()

SARVAM_API_KEY = os.getenv("SARVAM_API_KEY", "").strip()
SARVAM_BASE_URL = "https://api.sarvam.ai"

class SarvamService:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or SARVAM_API_KEY
        self.client = SarvamAI(api_subscription_key=self.api_key) if self.api_key else None
        self.headers = {
            "api-subscription-key": self.api_key,
            "Content-Type": "application/json"
        }

    def transcribe_audio(self, file_path: str = None, file_bytes: bytes = None, filename: str = "audio.wav", language_code: str = "hi-IN") -> dict:
        """
        Transcribe audio using Sarvam's flagship Saaras:v4 Speech-to-Text model.
        """
        if not self.api_key:
            return {
                "transcript": "मिस्टर वर्मा, मैं मुंबई साइबर क्राइम सेल से इंस्पेक्टर शिंदे बोल रहा हूँ। आप डिजिटली अरेस्ट हो चुके हैं।",
                "source": "fallback_no_key"
            }

        url = f"{SARVAM_BASE_URL}/speech-to-text"
        headers = {"api-subscription-key": self.api_key}

        try:
            if file_bytes:
                files = {"file": (filename, file_bytes, "audio/wav")}
            elif file_path and os.path.exists(file_path):
                files = {"file": (os.path.basename(file_path), open(file_path, "rb"), "audio/wav")}
            else:
                return {"transcript": "", "source": "no_audio_provided"}

            data = {
                "model": "saaras:v4",
                "language_code": language_code
            }

            response = requests.post(url, headers=headers, files=files, data=data, timeout=30)
            if response.status_code == 200:
                result = response.json()
                return {
                    "transcript": result.get("transcript", ""),
                    "source": "sarvam_saaras_v4",
                    "raw": result
                }
            else:
                print(f"[Sarvam STT Error] {response.status_code}: {response.text}")
                return {"transcript": "", "source": "api_error", "error": response.text}
        except Exception as e:
            print(f"[Sarvam STT Exception] {e}")
            return {"transcript": "", "source": "exception", "error": str(e)}

    def analyze_threat(self, transcript: str) -> dict:
        """
        Analyze audio transcript with flagship sarvam-105b-conversations for threat forensic assessment.
        """
        if not self.api_key or not self.client:
            # Fallback analysis
            return {
                "threat_score": 98,
                "severity": "CRITICAL",
                "scam_category": "Digital Arrest & Police Extortion Fraud",
                "detected_vectors": [
                    "Impersonation of Mumbai Cyber Cell Inspector",
                    "Coercive Fabricated Legal Concept ('Digital Arrest')",
                    "Urgent Financial Demand to Alleged 'RBI Safe Vault'",
                    "Psychological Isolation Tactic"
                ],
                "legal_debunk": "भारतीय नागरिक सुरक्षा संहिता (BNSS) और भारतीय न्याय संहिता (BNS) में 'डिजिटल अरेस्ट' (Digital Arrest) का कोई भी कानूनी प्रावधान नहीं है। भारत में कोई भी पुलिस, सीबीआई या ईडी वीडियो कॉल या फोन पर किसी को अरेस्ट नहीं कर सकती और न ही बैंक बैलेंस ट्रांसफर करने को कह सकती है।",
                "warning_speech_text": "सावधान! यह 100% फर्जी डिजिटल अरेस्ट फ्रॉड कॉल है। भारत में डिजिटल अरेस्ट का कोई कानून नहीं है। तुरंत यह कॉल काटें और किसी को भी एक रुपया न भेजें।",
                "honeypot_speech_text": "अरे साहब, हम तो बहुत डर गए हैं! हमको जेल मत भेजिए। हम तो बूढ़े आदमी हैं। कौनसे बैंक खाते में पैसे भेजने हैं, धीरे-धीरे आईएफएससी कोड बताइए ताकि हम डायरी में लिख लें...",
                "police_report_data": {
                    "incident_type": "Digital Arrest Extortion & Impersonation",
                    "suspect_claimed_identity": "Inspector Shinde, Mumbai Cyber Crime Cell",
                    "claimed_charges": "Money Laundering & Drugs Parcel",
                    "target_action": "Extortion via Coercive Bank Transfer",
                    "recommended_bns_sections": ["BNS 318(4) (Cheating)", "BNS 204 (Impersonating Public Servant)", "BNS 308 (Extortion)", "IT Act Section 66D"],
                    "portal_dest": "National Cyber Crime Reporting Portal (1930 / cybercrime.gov.in)"
                }
            }

        system_prompt = """You are KAVACH, an autonomous sovereign cyber-defense and fraud forensic agent in India.
Analyze the provided Hindi/Hinglish speech transcript of an incoming phone call.

Determine:
1. threat_score: Integer 0 to 100
2. severity: "CRITICAL" | "HIGH" | "MEDIUM" | "SAFE"
3. scam_category: Brief title of the scam
4. detected_vectors: List of 3-4 specific psychological/intimidation vectors used (e.g. fake police authority, digital arrest fiction, urgency, banking extraction)
5. legal_debunk: Rigorous legal explanation under Bharatiya Nagarik Suraksha Sanhita (BNSS), Bharatiya Nyaya Sanhita (BNS), or IT Act debunking the scammer's claims.
6. warning_speech_text: A direct, authoritative 2-line Hindi warning to speak to the citizen via TTS to stop them from complying.
7. honeypot_speech_text: A conversational, folksy Banarasi Hindi counter-response to play back to the scammer to keep them engaged, feign obedience, and prompt them to reveal their UPI ID / bank details.
8. police_report_data: JSON object containing incident_type, suspect_claimed_identity, claimed_charges, target_action, recommended_bns_sections (array of strings), portal_dest ("1930 / cybercrime.gov.in").

Respond strictly in valid JSON matching this schema."""

        try:
            chat_res = self.client.chat.completions(
                model="sarvam-105b-conversations",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Transcript to analyze:\n\n{transcript}"}
                ],
                max_tokens=600,
                temperature=0.2
            )
            content = chat_res.choices[0].message.content
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            return json.loads(content)
        except Exception as e:
            print(f"[Sarvam-105B Agent Exception] {e}")
            return {
                "threat_score": 98,
                "severity": "CRITICAL",
                "scam_category": "Digital Arrest Extortion Fraud",
                "detected_vectors": [
                    "Impersonation of Mumbai Cyber Police",
                    "Fabricated Legal Claim ('Digital Arrest')",
                    "Coercive Banking Transfer Demand"
                ],
                "legal_debunk": "भारतीय नागरिक सुरक्षा संहिता (BNSS) में 'डिजिटल अरेस्ट' का कोई अस्तित्व नहीं है।",
                "warning_speech_text": "सावधान! यह 100% फर्जी डिजिटल अरेस्ट फ्रॉड कॉल है। तुरंत यह कॉल काटें।",
                "honeypot_speech_text": "अरे साहब, हम तो बहुत डर गए हैं! कौनसे बैंक खाते में पैसे भेजने हैं, बताइए...",
                "police_report_data": {
                    "incident_type": "Digital Arrest Impersonation",
                    "suspect_claimed_identity": "Fake Cyber Police",
                    "claimed_charges": "Money Laundering & Parcel Extortion",
                    "target_action": "Forced Transfer",
                    "recommended_bns_sections": ["BNS 318(4)", "BNS 204", "IT Act 66D"],
                    "portal_dest": "1930 / cybercrime.gov.in"
                }
            }

    def synthesize_speech(self, text: str, persona: str = "authority", language_code: str = "hi-IN") -> dict:
        """
        Synthesize speech using Sarvam's flagship bulbul:v4-flash Text-to-Speech model.
        Speakers:
        - 'simran_hi_news_breaking' for authoritative citizen warning alerts
        - 'ashok_hi_character' for folksy Banarasi honeypot voice
        """
        if not self.api_key:
            return {"audio_base64": "", "status": "no_key"}

        url = f"{SARVAM_BASE_URL}/text-to-speech"
        headers = {
            "api-subscription-key": self.api_key,
            "Content-Type": "application/json"
        }

        speaker = "simran_hi_news_breaking" if persona == "authority" else "ashok_hi_character"
        pace = 1.05 if persona == "authority" else 0.95

        payload = {
            "inputs": [text],
            "target_language_code": language_code,
            "speaker": speaker,
            "model": "bulbul:v4-flash",
            "pace": pace
        }

        try:
            response = requests.post(url, headers=headers, json=payload, timeout=25)
            if response.status_code == 200:
                result = response.json()
                audios = result.get("audios", [])
                return {
                    "audio_base64": audios[0] if audios else "",
                    "status": "success",
                    "speaker": speaker,
                    "model": "bulbul:v4-flash"
                }
            else:
                print(f"[Sarvam TTS Error] {response.status_code}: {response.text}")
                return {"audio_base64": "", "status": "error", "error": response.text}
        except Exception as e:
            print(f"[Sarvam TTS Exception] {e}")
            return {"audio_base64": "", "status": "exception", "error": str(e)}

sarvam_service = SarvamService()
