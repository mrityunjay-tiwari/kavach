import os
import io
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List
from sarvam_service import sarvam_service, MOCK_SCENARIOS

app = FastAPI(
    title="KAVACH API - Indic Cyber Defense Agent",
    description="Backend services for KAVACH: Autonomous Indic Voice Interceptor for Digital Arrest Scams",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeTextRequest(BaseModel):
    transcript: str
    caller_id: Optional[str] = "+91 98201-94821"

class TTSRequest(BaseModel):
    text: str
    persona: Optional[str] = "authority"  # "authority" or "honeypot"
    language_code: Optional[str] = "hi-IN"

@app.get("/api/health")
def health_check():
    api_key_configured = bool(sarvam_service.api_key)
    return {
        "status": "healthy",
        "service": "KAVACH Cyber Defense Engine",
        "sarvam_api_connected": api_key_configured,
        "mode": "live_api" if api_key_configured else "interactive_simulation"
    }

@app.get("/api/scenarios")
def list_scenarios():
    """Returns available pre-configured test scenarios for one-click demo testing."""
    return [
        {
            "id": "digital_arrest",
            "title": "Scenario 1: 'Digital Arrest' Extortion Call",
            "subtitle": "Impersonation of Mumbai Cyber Crime Inspector शिंदे",
            "threat_type": "Digital Arrest Fiction",
            "accent": "North Indian / Mumbai Police Diction (Hindi)",
            "summary": "Scammer claims victim's Aadhaar used in Rs 4 Cr money laundering & drugs parcel; threatens immediate digital arrest."
        },
        {
            "id": "electricity_scam",
            "title": "Scenario 2: Electricity Power-Cut APK Scam",
            "subtitle": "Impersonation of State Electricity Board Official",
            "threat_type": "Utility Phishing / Malware",
            "accent": "Urgent Administrative Hindi",
            "summary": "Scammer threatens power cut at 9:30 PM tonight unless user downloads APK and pays token Rs 15 fee."
        }
    ]

@app.get("/api/scenarios/{scenario_id}")
def get_scenario_data(scenario_id: str):
    if scenario_id not in MOCK_SCENARIOS:
        raise HTTPException(status_code=404, detail="Scenario not found")
    data = MOCK_SCENARIOS[scenario_id]
    return {
        "id": scenario_id,
        "transcript": data["transcript"],
        "analysis": data["analysis"],
        "warning_tts": sarvam_service.synthesize_speech(data["analysis"]["warning_speech_text"], persona="authority"),
        "honeypot_tts": sarvam_service.synthesize_speech(data["analysis"]["honeypot_speech_text"], persona="honeypot")
    }

@app.post("/api/analyze-audio")
async def analyze_audio(file: UploadFile = File(...), caller_id: Optional[str] = Form("+91 98201-94821")):
    """Uploads an audio clip, runs Sarvam STT, and executes Indus threat analysis."""
    try:
        content = await file.read()
        # 1. Transcribe
        stt_result = sarvam_service.transcribe_audio(file_bytes=content, filename=file.filename)
        transcript = stt_result.get("transcript", "")
        
        # 2. Analyze with Indus
        analysis = sarvam_service.analyze_threat(transcript)
        
        # 3. Generate TTS for both citizen shield & honeypot
        warning_audio = sarvam_service.synthesize_speech(analysis.get("warning_speech_text", ""), persona="authority")
        honeypot_audio = sarvam_service.synthesize_speech(analysis.get("honeypot_speech_text", ""), persona="honeypot")

        return {
            "caller_id": caller_id,
            "transcript": transcript,
            "analysis": analysis,
            "stt_source": stt_result.get("source"),
            "warning_tts": warning_audio,
            "honeypot_tts": honeypot_audio
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze-text")
def analyze_text(request: AnalyzeTextRequest):
    """Directly analyzes text transcript (useful for live typing or speech input)."""
    analysis = sarvam_service.analyze_threat(request.transcript)
    warning_audio = sarvam_service.synthesize_speech(analysis.get("warning_speech_text", ""), persona="authority")
    honeypot_audio = sarvam_service.synthesize_speech(analysis.get("honeypot_speech_text", ""), persona="honeypot")

    return {
        "caller_id": request.caller_id,
        "transcript": request.transcript,
        "analysis": analysis,
        "warning_tts": warning_audio,
        "honeypot_tts": honeypot_audio
    }

@app.post("/api/tts")
def generate_tts(request: TTSRequest):
    """Generates audio speech using Sarvam Bulbul TTS."""
    return sarvam_service.synthesize_speech(
        text=request.text,
        persona=request.persona,
        language_code=request.language_code
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
