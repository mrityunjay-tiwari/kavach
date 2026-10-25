"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Play,
  Pause,
  AlertTriangle,
  Scale,
  Volume2,
  PhoneCall,
  PhoneOff,
  FileText,
  Copy,
  Check,
  Mic,
  Square,
  Sparkles,
  Radio,
  Bug,
  ChevronRight,
  ExternalLink
} from "lucide-react";

export default function Home() {
  // Modes: 'preset' or 'live_mic'
  const [activeTab, setActiveTab] = useState<"preset" | "mic">("preset");
  
  // Call state: 'idle' | 'calling' | 'active'
  const [callState, setCallState] = useState<"idle" | "calling" | "active">("idle");
  const [activeAudioTrack, setActiveAudioTrack] = useState<"scam" | "warning" | "honeypot" | null>(null);
  
  // Mic Recording State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordTimer, setRecordTimer] = useState<number>(0);
  const [isProcessingMic, setIsProcessingMic] = useState<boolean>(false);

  // Analysis State
  const [threatScore, setThreatScore] = useState<number>(98);
  const [copied, setCopied] = useState<boolean>(false);
  const [showReport, setShowReport] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Preset transcript
  const [transcript, setTranscript] = useState<string>(
    "मिस्टर वर्मा, मैं मुंबई साइबर क्राइम सेल से इंस्पेक्टर शिंदे बोल रहा हूँ। आपके आधार कार्ड से 4 करोड़ रुपये की मनी लॉन्ड्रिंग और ड्रग्स पार्सल का केस दर्ज हुआ है। आप इस समय डिजिटली अरेस्ट हो चुके हैं। तुरंत अपना वेबकैम ऑन रखिए और अपनी सारी बैंक डिटेल्स और बैलेंस आरबीआई के सेफ वॉल्ट अकाउंट में ट्रांसफर कीजिए जांच के लिए।"
  );

  // Play audio track helper with reliable fallback
  const playTrack = (track: "scam" | "warning" | "honeypot", textFallback: string) => {
    // If already playing this track, pause
    if (activeAudioTrack === track && audioRef.current) {
      audioRef.current.pause();
      setActiveAudioTrack(null);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    const soundMap = {
      scam: "/api/audio/scam_call.wav",
      warning: "/api/audio/warning.wav",
      honeypot: "/api/audio/honeypot.wav",
    };

    const audio = new Audio(soundMap[track]);
    audioRef.current = audio;
    setActiveAudioTrack(track);

    audio.onended = () => setActiveAudioTrack(null);
    audio.onerror = () => {
      console.warn("Audio file playback fallback to browser speech synthesis");
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const utter = new SpeechSynthesisUtterance(textFallback);
        utter.lang = "hi-IN";
        utter.onend = () => setActiveAudioTrack(null);
        utter.onerror = () => setActiveAudioTrack(null);
        window.speechSynthesis.speak(utter);
      } else {
        setActiveAudioTrack(null);
      }
    };

    audio.play().catch((err) => {
      console.warn("Autoplay policy prevented playback, attempting speech synthesis:", err);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const utter = new SpeechSynthesisUtterance(textFallback);
        utter.lang = "hi-IN";
        utter.onend = () => setActiveAudioTrack(null);
        utter.onerror = () => setActiveAudioTrack(null);
        window.speechSynthesis.speak(utter);
      } else {
        setActiveAudioTrack(null);
      }
    });
  };

  // Start Call Simulation
  const triggerCallSimulation = () => {
    setCallState("active");
    setThreatScore(98);
    setTranscript(
      "मिस्टर वर्मा, मैं मुंबई साइबर क्राइम सेल से इंस्पेक्टर शिंदे बोल रहा हूँ। आपके आधार कार्ड से 4 करोड़ रुपये की मनी लॉन्ड्रिंग और ड्रग्स पार्सल का केस दर्ज हुआ है। आप इस समय डिजिटली अरेस्ट हो चुके हैं। तुरंत अपना वेबकैम ऑन रखिए और अपनी सारी बैंक डिटेल्स और बैलेंस आरबीआई के सेफ वॉल्ट अकाउंट में ट्रांसफर कीजिए जांच के लिए।"
    );
    playTrack(
      "scam",
      "मिस्टर वर्मा, मैं मुंबई साइबर सेल से इंस्पेक्टर शिंदे बोल रहा हूँ। आप डिजिटली अरेस्ट हो चुके हैं।"
    );
  };

  // End Call
  const endCall = () => {
    if (audioRef.current) audioRef.current.pause();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setActiveAudioTrack(null);
    setCallState("idle");
  };

  // Real Microphone Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        setIsProcessingMic(true);

        try {
          const formData = new FormData();
          formData.append("audio", audioBlob, "mic_record.wav");

          const res = await fetch("/api/analyze", {
            method: "POST",
            body: formData,
          });

          if (res.ok) {
            const data = await res.json();
            if (data.transcript) {
              setTranscript(data.transcript);
            }
            if (data.analysis?.threat_score !== undefined) {
              setThreatScore(data.analysis.threat_score);
            }
          }
        } catch (e) {
          console.error("Mic analysis error:", e);
        } finally {
          setIsProcessingMic(false);
          setCallState("active");
        }

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordTimer(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordTimer((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing mic:", err);
      alert("Microphone access permission is required to test live voice!");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const copyReport = () => {
    const text = `NATIONAL CYBER CRIME REPORTING PORTAL (1930) - INCIDENT REPORT
Autonomous Forensic Intercept by KAVACH (Sarvam AI Platform)

SUSPECT CALLER: +91 98201-94821 [SPOOFED / MUMBAI]
CLAIMED IDENTITY: Inspector Shinde, Mumbai Cyber Crime Cell (Fraudulent)
THREAT TYPE: "Digital Arrest" Coercion & Fake Narcotics Parcel Extortion
THREAT CONFIDENCE: ${threatScore}% (CRITICAL)

STATUTORY FINDING (Bharatiya Nagarik Suraksha Sanhita 2023):
"Digital Arrest" has zero existence under Indian law. No magistrate or police officer can detain citizens via video call or demand money transfer to safe vaults.

APPLICABLE CHARGES:
• BNS Section 318(4) (Cheating by Impersonation)
• BNS Section 204 (Impersonating a Public Servant)
• BNS Section 308 (Extortion under threat of injury)
• IT Act Section 66D (Cheating through computer resource)

TRANSCRIPT EVIDENCE (Sarvam Saaras:v4 STT):
"${transcript}"
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#FBFBFC] text-slate-900 flex flex-col justify-between">
      {/* Sleek Minimalist Header */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
              <ShieldAlert className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-slate-900">
                  KAVACH <span className="font-normal text-slate-400">|</span> कवच
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Shield Active
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Autonomous Indic Voice Threat Interceptor for "Digital Arrest" Scams
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              Sarvam Saaras:v4
            </span>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              Sarvam-105B
            </span>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              Bulbul:v4-flash
            </span>
          </div>
        </div>
      </header>

      {/* Main Focus Area: Cinematic Intercept Simulator */}
      <div className="max-w-4xl mx-auto px-6 py-8 w-full space-y-6">
        {/* Simple Mode Toggle */}
        <div className="flex items-center justify-center">
          <div className="bg-slate-200/70 p-1 rounded-xl flex items-center gap-1 shadow-inner">
            <button
              onClick={() => {
                setActiveTab("preset");
                endCall();
              }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === "preset"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🚨 1-Click Scam Simulation
            </button>
            <button
              onClick={() => {
                setActiveTab("mic");
                endCall();
              }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === "mic"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-emerald-600" /> Test with Live Mic
            </button>
          </div>
        </div>

        {/* HERO CARD: Live Call Intercept Console */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Top Banner: Call Status Header */}
          <div className="p-6 border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs transition ${
                  callState === "active"
                    ? "bg-rose-600 text-white animate-pulse"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                <PhoneCall className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-slate-900">
                    +91 98201-94821
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200">
                    Suspected VOIP Spoof
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Caller Claim: <span className="font-medium text-slate-700">Inspector Shinde, Mumbai Cyber Police</span>
                </p>
              </div>
            </div>

            {/* Primary Action Button */}
            <div>
              {activeTab === "preset" ? (
                callState === "active" ? (
                  <button
                    onClick={endCall}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition"
                  >
                    <PhoneOff className="w-4 h-4 text-rose-400" /> End Call
                  </button>
                ) : (
                  <button
                    onClick={triggerCallSimulation}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs hover:shadow transition"
                  >
                    <Play className="w-4 h-4 fill-white" /> Simulate & Play Incoming Call
                  </button>
                )
              ) : (
                /* Live Mic Button */
                isRecording ? (
                  <button
                    onClick={stopRecording}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold animate-pulse shadow-xs transition"
                  >
                    <Square className="w-3.5 h-3.5 fill-white" /> Stop & Analyze ({recordTimer}s)
                  </button>
                ) : (
                  <button
                    onClick={startRecording}
                    disabled={isProcessingMic}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition disabled:opacity-50"
                  >
                    <Mic className="w-4 h-4 text-emerald-400" />
                    {isProcessingMic ? "Transcribing via Saaras:v4..." : "Record Live Voice"}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Transcript & Threat Body */}
          <div className="p-6 space-y-6">
            {/* Live Audio Transcript Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-slate-400" />
                  Live Hindi Audio Stream (Transcribed by Sarvam Saaras:v4)
                </span>
                {activeAudioTrack === "scam" && (
                  <span className="flex items-center gap-1 text-rose-600 font-semibold animate-pulse text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-rose-600"></span> Audio Playing
                  </span>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-sm leading-relaxed text-slate-800 font-sans">
                "{transcript}"
              </div>
            </div>

            {/* Instant Threat Assessment Bar */}
            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-rose-950">
                      THREAT DETECTED: 98% CRITICAL EXTORTION
                    </span>
                  </div>
                  <p className="text-xs text-rose-800">
                    Statutory Reality: <span className="font-semibold">"Digital Arrest" has ZERO legal existence in India under the BNSS Code 2023.</span>
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-600 text-white shadow-xs">
                NON-BAILABLE OFFENSE
              </span>
            </div>

            {/* THE TWO HERO COUNTER-ACTIONS (Clean, Big, Obvious) */}
            <div className="pt-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Autonomous Counter-Defenses
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Citizen Shield */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 transition shadow-xs flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        ACTION 1: CITIZEN SHIELD
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">Bulbul:v4-flash</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">
                      🔊 Play Citizen Audio Warning
                    </h3>
                    <p className="text-xs text-slate-600 leading-snug">
                      "सावधान! यह 100% फर्जी डिजिटल अरेस्ट फ्रॉड है। तुरंत यह कॉल काटें।"
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      playTrack(
                        "warning",
                        "सावधान! यह एक फर्जी डिजिटल अरेस्ट फ्रॉड कॉल है। तुरंत यह कॉल काटें।"
                      )
                    }
                    className={`mt-4 w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition ${
                      activeAudioTrack === "warning"
                        ? "bg-emerald-700 text-white border-emerald-800 shadow-xs"
                        : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                    }`}
                  >
                    {activeAudioTrack === "warning" ? (
                      <>
                        <Pause className="w-3.5 h-3.5" /> Pause Warning Voice
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-emerald-800" /> Play Voice Alert (Sarvam Bulbul)
                      </>
                    )}
                  </button>
                </div>

                {/* 2. Banarasi Uncle Honeypot (The Showstopper) */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-amber-300 transition shadow-xs flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        ACTION 2: HONEYPOT BAITER
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">ashok_hi_character</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">
                      🐝 Deploy Banarasi Uncle Baiter
                    </h3>
                    <p className="text-xs text-slate-600 leading-snug">
                      "अरे साहब, हम तो बहुत डर गए हैं! कौनसे बैंक खाते में पैसे भेजने हैं, धीरे-धीरे बताइए..."
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      playTrack(
                        "honeypot",
                        "अरे साहब, हम तो बहुत डर गए हैं! हमको जेल मत भेजिए। कौनसे खाते में पैसे भेजने हैं बताइए..."
                      )
                    }
                    className={`mt-4 w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition ${
                      activeAudioTrack === "honeypot"
                        ? "bg-amber-600 text-white border-amber-700 shadow-xs"
                        : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                    }`}
                  >
                    {activeAudioTrack === "honeypot" ? (
                      <>
                        <Pause className="w-3.5 h-3.5" /> Pause Honeypot
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-amber-800" /> Deploy Honeypot (Sarvam Bulbul)
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Action 3: 1930 Cyber Crime Report Toggle */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setShowReport(!showReport)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition"
              >
                <FileText className="w-4 h-4 text-slate-500" />
                {showReport ? "Hide" : "View"} Pre-filled 1930 National Cyber Crime Report
              </button>

              <button
                onClick={copyReport}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied Official Dossier
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" /> Copy Incident Dossier
                  </>
                )}
              </button>
            </div>

            {/* Collapsible Report Box */}
            {showReport && (
              <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 font-mono text-xs leading-relaxed space-y-2 border border-slate-800">
                <div className="text-emerald-400 font-bold border-b border-slate-800 pb-1.5 flex justify-between">
                  <span>// NATIONAL CYBER CRIME PORTAL (1930) - COMPLAINT DOSSIER</span>
                  <span>STATUS: READY TO SUBMIT</span>
                </div>
                <div><span className="text-slate-400">INCIDENT TYPE:</span> Digital Arrest Coercion & Law Enforcement Impersonation</div>
                <div><span className="text-slate-400">SUSPECT NUMBER:</span> +91 98201-94821 [FLAGGED: VOIP / MUMBAI]</div>
                <div><span className="text-slate-400">CLAIMED IDENTITY:</span> Inspector Shinde, Mumbai Cyber Police (Fraudulent)</div>
                <div><span className="text-slate-400">APPLICABLE BNS SECTIONS:</span> BNS 318(4) (Cheating) • BNS 204 (Impersonating Public Servant) • BNS 308 (Extortion) • IT Act 66D</div>
              </div>
            )}
          </div>
        </div>

        {/* Presentation Tip for User */}
        <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-900 leading-relaxed">
            <span className="font-bold">Pitch Tip for Judges:</span> Click{" "}
            <span className="font-semibold text-emerald-950">"Simulate & Play Incoming Call"</span>. Let them hear the aggressive scammer in Hindi. Then click{" "}
            <span className="font-semibold text-emerald-950">"Deploy Honeypot"</span> to let them hear the Banarasi uncle voice bait the scammer live. That 30-second interaction wins the room!
          </p>
        </div>
      </div>

      {/* Clean Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-4 text-center text-xs text-slate-500">
        KAVACH | Powered strictly by Sarvam AI: Saaras:v4 • Sarvam-105B • Bulbul:v4-flash
      </footer>
    </main>
  );
}
