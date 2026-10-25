# 🛡️ KAVACH (कवच)
### Autonomous Indic Voice Shield Protecting Citizens from Financial Fraud
*Built for Sarvam Campus @ IIT BHU '26*

---

## 🎯 Overview
**KAVACH** is a sovereign, real-time voice defense system designed specifically for non-English-speaking Indian citizens who are disproportionately targeted by financial phone scams (Bank KYC blocks, "Digital Arrest", electricity cut-off APKs, and lottery advance-fee fraud).

Using Sarvam AI's sovereign Indic stack, KAVACH acts as an active in-call security co-pilot that listens in native Indian dialects, whispers calm guidance directly into the citizen's ear in plain Hindi, automatically silences the microphone if the citizen attempts to read out an OTP, and can even unleash an AI Honeypot to bait the scammer and extract their fraudulent bank details.

---

## 🧠 Sovereign AI Stack (Strictly Sarvam AI)

| Capability | Model | Role in KAVACH |
|---|---|---|
| **Speech-to-Text (STT)** | **`saaras:v4`** | High-accuracy transcription of fast, aggressive colloquial Hindi/Hinglish speech and numbers. |
| **Forensic Agent & Legal Reasoning** | **`sarvam-105b-conversations`** | Detects coercion vectors, conducts statutory reality checks under **BNSS Code 2023**, and drafts 1930 incident dossiers. |
| **Citizen Shield Voice (TTS)** | **`bulbul:v4-flash`** (`simran_hi_news_breaking`) | Sub-250ms urgent, authoritative Hindi voice alert to stop the victim from complying. |
| **Honeypot Scam-Baiter (TTS)** | **`bulbul:v4-flash`** (`ashok_hi_character`) | Authentic folksy Banarasi character voice to keep the scammer engaged and extract destination UPI/bank accounts. |

---

## 🔒 Privacy by Design (DPDP Act 2023 Compliant)
1. **Saved Contacts are 100% Dormant**: Calls from saved phonebook contacts (family/friends) are completely blacklisted and never processed. Zero audio captured.
2. **In-Call Physical Kill Switch**: User can tap **"Mute AI"** at any second during a call to permanently kill AI listening for that session.
3. **Verified Institutional Directory**: Checks incoming numbers against certified TRAI & banking registry ranges to flag spoofed VoIP lines.

---

## ⚡ 4-Tier Active Intervention Engine
* **Tier 1 (In-Ear Whisper)**: Discreet audio prompt in mother tongue: *"डरो मत! बैंक कभी फोन पर OTP नहीं मांगता..."*
* **Tier 2 (Credential Shield)**: Real-time microphone mute if the user starts speaking numbers/OTP to the scammer.
* **Tier 3 (Banarasi Honeypot)**: Sarvam Indus Agent steps in as a naive citizen to waste the scammer's time.
* **Tier 4 (Family Circuit-Breaker)**: Automated WhatsApp/SMS alert to children/caregivers.
* **Tier 5 (1930 Cyber Crime Report)**: One-click official complaint formatted for `cybercrime.gov.in`.

---

## 🚀 Quickstart & Local Run

### Frontend (Next.js 14):
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### Backend (Python FastAPI):
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Open [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🌐 Deploy to Vercel (1-Click Full-Stack)
Both frontend and serverless API routes are pre-configured for Vercel:
```bash
cd frontend
npx vercel --prod
```
Add `SARVAM_API_KEY` in Vercel project environment variables.
