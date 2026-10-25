"use client";

import React, { useState, useRef } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Play,
  Pause,
  AlertTriangle,
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
  Users,
  Lock,
  Headphones,
  CheckCircle2,
  EyeOff,
  Settings2,
  Database
} from "lucide-react";

interface ScamScenario {
  id: string;
  name: string;
  category: string;
  caller: string;
  is_saved_contact: boolean;
  threat_score: number;
  targeted_vulnerability: string;
  transcript: string;
  audio_url: string;
  whisper_advice: string;
  honeypot_dialogue: string;
  detected_vectors: string[];
  sensitive_data_targeted: string[];
}

const FINANCIAL_SCAM_TAXONOMY: Record<string, ScamScenario> = {
  kyc_block: {
    id: "kyc_block",
    name: "1. Bank KYC Account Freeze",
    category: "Banking Phishing",
    caller: "+91 91234-88219 [UNSAVED: UNKNOWN NUMBER]",
    is_saved_contact: false,
    threat_score: 96,
    targeted_vulnerability: "Fear of bank account suspension & loss of pension/savings",
    transcript:
      "नमस्ते सर, मैं भारतीय स्टेट बैंक के मुंबई हेड ऑफिस से सीनियर मैनेजर बोल रहा हूँ। आपके बैंक खाते का केवाईसी वेरीफिकेशन एक्सपायर हो गया है। अगर 24 घंटे में आधार पैन अपडेट नहीं हुआ तो आपका खाता और एटीएम कार्ड हमेशा के लिए ब्लॉक हो जाएगा। तुरंत आपके मोबाइल पर जो 6 अंकों का ओटीपी आया है वो मुझे बताइए ताकि मैं आपका खाता अनब्लॉक कर सकूं!",
    audio_url: "/api/audio/warning.wav",
    whisper_advice:
      "सावधान: बैंक कभी भी फोन पर OTP, पासवर्ड या CVV नहीं मांगता। OTP मत बताइए, आपका खाता पूरी तरह सुरक्षित है।",
    honeypot_dialogue:
      "अरे मैनेजर साहब, हमारे पेंशन का खाता मत बंद कीजिए! हमारी आंखें कमजोर हैं, चश्मा ढूंढ रहे हैं। कौनसा मैसेज आया है धीरे-धीरे पढ़ के बताइए...",
    detected_vectors: [
      "Fake Bank Authority (SBI Senior Manager)",
      "Manufactured Emergency (Account block within 24h)",
      "Active Credential Harvesting (6-digit OTP Solicitation)"
    ],
    sensitive_data_targeted: ["Banking OTP", "Debit Card PIN", "Aadhaar Card Linkage"]
  },
  digital_arrest: {
    id: "digital_arrest",
    name: "2. Digital Arrest & Police Coercion",
    category: "Extortion / Impersonation",
    caller: "+91 98201-94821 [UNSAVED: VOIP MUMBAI]",
    is_saved_contact: false,
    threat_score: 98,
    targeted_vulnerability: "Fear of police raid, criminal arrest & societal shame",
    transcript:
      "मिस्टर वर्मा, मैं मुंबई साइबर क्राइम सेल से इंस्पेक्टर शिंदे बोल रहा हूँ। आपके आधार कार्ड से 4 करोड़ रुपये की मनी लॉन्ड्रिंग और ड्रग्स पार्सल का केस दर्ज हुआ है। आप इस समय डिजिटली अरेस्ट हो चुके हैं। तुरंत अपना वेबकैम ऑन रखिए और अपनी सारी बैंक डिटेल्स और बैलेंस आरबीआई के सेफ वॉल्ट अकाउंट में ट्रांसफर कीजिए जांच के लिए।",
    audio_url: "/api/audio/scam_call.wav",
    whisper_advice:
      "कानूनी चेतावनी: भारतीय कानून (BNSS) में 'डिजिटल अरेस्ट' नाम की कोई चीज नहीं है। पुलिस वीडियो कॉल पर अरेस्ट नहीं कर सकती। तुरंत कॉल काटें।",
    honeypot_dialogue:
      "अरे साहब, हम तो बूढ़े आदमी हैं, जिंदगी में कभी थाना नहीं गए! बहुत डर लग रहा है। कौनसे बैंक खाते में पैसे भेजने हैं, धीरे-धीरे आईएफएससी कोड बताइए...",
    detected_vectors: [
      "Law Enforcement Impersonation (Inspector Shinde)",
      "Fabricated Legal Statute ('Digital Arrest' Fiction)",
      "Forced Fund Transfer to Fraudulent Account"
    ],
    sensitive_data_targeted: ["Bank Balance", "RTGS/IMPS Transfer to Fraud Account"]
  },
  lottery_kbc: {
    id: "lottery_kbc",
    name: "3. KBC / PM-Scheme Lottery Scam",
    category: "Advance-Fee Fraud",
    caller: "+91 97712-40912 [UNSAVED: UNKNOWN MOBILE]",
    is_saved_contact: false,
    threat_score: 91,
    targeted_vulnerability: "Greed/Hope of life-changing money for financially underprivileged citizens",
    transcript:
      "बधाई हो सर! आपके मोबाइल नंबर पर प्रधानमंत्री जन-कल्याण योजना और केबीसी का 25 लाख रुपये का लकी ड्रा इनाम निकला है। यह चेक आपके घर भेजने के लिए गवर्नमेंट टैक्स और रजिस्ट्रेशन फीस के मात्र 2,500 रुपये तुरंत दिए गए यूपीआई नंबर पर ट्रांसफर कीजिए, आधे घंटे में 25 लाख आपके खाते में क्रेडिट हो जाएगा!",
    audio_url: "/api/audio/scam_call.wav",
    whisper_advice:
      "सतर्कता सलाह: किसी भी असली सरकारी योजना या लॉटरी के पैसे मिलने के लिए पहले पैसे नहीं देने पड़ते। यह 100% एडवांस-फी फ्रॉड है।",
    honeypot_dialogue:
      "अरे भैया सचमुच 25 लाख निकला है क्या! हमारे पास तो अभी पैसे नहीं हैं। क्या आप 25 लाख में से ही 2,500 रुपये काट कर बाकी पैसा भेज सकते हैं?",
    detected_vectors: [
      "Advance-Fee Fraud Pattern (Pay token fee to get prize)",
      "Fake Government / Celebrity Endorsement (KBC / PM Yojana)",
      "Urgent UPI Payment Request"
    ],
    sensitive_data_targeted: ["Upfront UPI Advance Fee", "UPI PIN Credential"]
  },
  electricity_bill: {
    id: "electricity_bill",
    name: "4. Electricity Bill Power-Cut APK",
    category: "Utility Malware Phishing",
    caller: "+91 94310-88124 [UNSAVED: UNKNOWN MOBILE]",
    is_saved_contact: false,
    threat_score: 93,
    targeted_vulnerability: "Fear of sudden power outage disrupting home or small shop",
    transcript:
      "प्रिय उपभोक्ता, आपकी बिजली का बिल अपडेट नहीं होने के कारण आज रात 9:30 बजे आपके घर का पावर कनेक्शन काट दिया जाएगा। तुरंत हमारे इलेक्ट्रिसिटी ऑफिसर से संपर्क करें या दिए गए लिंक से महावितरण सपोर्ट ऐप डाउनलोड करके 15 रुपये का पेंडिंग चार्ज भरें, नहीं तो पेनल्टी लगेगी।",
    audio_url: "/api/audio/scam_call.wav",
    whisper_advice:
      "सुरक्षा सलाह: बिजली विभाग कभी भी फोन पर APK ऐप डाउनलोड करने या निजी नंबर पर 15 रुपये भरने को नहीं कहता। लिंक पर क्लिक न करें।",
    honeypot_dialogue:
      "सर हमारी दुकान की लाइट मत काटिए, सारा सामान खराब हो जाएगा! हम तुरंत पैसा भेज रहे हैं। बताइए कौनसा यूपीआई नंबर है आपका...",
    detected_vectors: [
      "Fake Utility Official (Electricity Discom)",
      "Artificial Deadline Pressure (Power cut tonight at 9:30 PM)",
      "Malicious APK Screen-Share Link Trap"
    ],
    sensitive_data_targeted: ["Malicious APK Install", "Device SMS / Banking Credentials"]
  }
};

export default function Home() {
  const [selectedScenarioKey, setSelectedScenarioKey] = useState<string>("kyc_block");
  
  // Privacy by Design Settings
  const [privacySavedContactsOnly, setPrivacySavedContactsOnly] = useState<boolean>(true);
  const [isAiListeningMuted, setIsAiListeningMuted] = useState<boolean>(false);
  const [showPrivacySettings, setShowPrivacySettings] = useState<boolean>(false);

  // Call & Audio Playback State
  const [isCallActive, setIsCallActive] = useState<boolean>(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  // Intervention States
  const [familyAlertSent, setFamilyAlertSent] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showReport, setShowReport] = useState<boolean>(false);

  // Live Mic State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordTimer, setRecordTimer] = useState<number>(0);
  const [isProcessingMic, setIsProcessingMic] = useState<boolean>(false);

  const scenario = FINANCIAL_SCAM_TAXONOMY[selectedScenarioKey] || FINANCIAL_SCAM_TAXONOMY["kyc_block"];
  const [currentTranscript, setCurrentTranscript] = useState<string>(scenario.transcript);
  const [currentThreatScore, setCurrentThreatScore] = useState<number>(scenario.threat_score);

  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const playAudio = (url: string, id: string, textFallback: string) => {
    if (playingAudio === id && audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setPlayingAudio(null);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    if (audioPlayerRef.current) audioPlayerRef.current.pause();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    const audio = new Audio(url);
    audioPlayerRef.current = audio;
    setPlayingAudio(id);

    audio.onended = () => setPlayingAudio(null);
    audio.onerror = () => {
      console.warn("Audio file error, falling back to speech synthesis");
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const utter = new SpeechSynthesisUtterance(textFallback);
        utter.lang = "hi-IN";
        utter.onend = () => setPlayingAudio(null);
        window.speechSynthesis.speak(utter);
      } else {
        setPlayingAudio(null);
      }
    };

    audio.play().catch((err) => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const utter = new SpeechSynthesisUtterance(textFallback);
        utter.lang = "hi-IN";
        utter.onend = () => setPlayingAudio(null);
        window.speechSynthesis.speak(utter);
      } else {
        setPlayingAudio(null);
      }
    });
  };

  const handleStartCall = () => {
    setIsAiListeningMuted(false);
    setIsCallActive(true);
    setCurrentTranscript(scenario.transcript);
    setCurrentThreatScore(scenario.threat_score);
    playAudio(scenario.audio_url, "scam_call", scenario.transcript);
  };

  const handleEndCall = () => {
    if (audioPlayerRef.current) audioPlayerRef.current.pause();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsCallActive(false);
    setPlayingAudio(null);
  };

  const toggleAiMute = () => {
    setIsAiListeningMuted(!isAiListeningMuted);
    if (!isAiListeningMuted && audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setPlayingAudio(null);
    }
  };

  const sendFamilyAlert = () => {
    setFamilyAlertSent(true);
    setTimeout(() => setFamilyAlertSent(false), 4000);
  };

  // Live Mic Logic
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
          formData.append("audio", audioBlob, "mic_voice.wav");

          const res = await fetch("/api/analyze", {
            method: "POST",
            body: formData,
          });

          if (res.ok) {
            const data = await res.json();
            if (data.transcript) setCurrentTranscript(data.transcript);
            if (data.analysis?.threat_score) setCurrentThreatScore(data.analysis.threat_score);
          }
        } catch (e) {
          console.error("Mic analysis error:", e);
        } finally {
          setIsProcessingMic(false);
          setIsCallActive(true);
        }

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordTimer(0);
      timerIntervalRef.current = setInterval(() => setRecordTimer((t) => t + 1), 1000);
    } catch (err) {
      alert("Microphone permission is required to test live voice!");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const copyDossier = () => {
    const report = `NATIONAL CYBER CRIME REPORTING PORTAL (1930) - FINANCIAL SCAM DOSSIER
Generated autonomously by KAVACH (Powered by Sarvam AI Platform)

SCAM CLASSIFICATION: ${scenario.name} (${scenario.category})
CALLER IDENTIFIER: ${scenario.caller}
THREAT CONFIDENCE SCORE: ${currentThreatScore}% (CRITICAL)
TARGETED VULNERABILITY: ${scenario.targeted_vulnerability}

SENSITIVE CREDENTIALS TARGETED:
${scenario.sensitive_data_targeted.map((item) => `• ${item}`).join("\n")}

FORENSIC SPEECH TRANSCRIPT (Sarvam Saaras:v4 STT):
"${currentTranscript}"

STATUTORY LEGAL FINDINGS (BNSS 2023 & RBI Directives):
${scenario.whisper_advice}
`;
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#FBFBFC] text-slate-900 flex flex-col justify-between">
      {/* Institutional Top Navbar */}
      <header className="border-b border-slate-200/80 bg-white sticky top-0 z-40 shadow-2xs">
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
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active Interceptor
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Autonomous Indic Voice Shield Protecting Citizens from Financial Fraud
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPrivacySettings(!showPrivacySettings)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition"
            >
              <Settings2 className="w-3.5 h-3.5 text-slate-500" />
              Privacy Controls
            </button>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-600" /> Saaras:v4
            </span>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              Sarvam-105B
            </span>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              Bulbul:v4
            </span>
          </div>
        </div>
      </header>

      {/* Main Focus Area */}
      <div className="max-w-4xl mx-auto px-6 py-8 w-full space-y-6">
        {/* Privacy by Design Banner (Collapsible / Toggleable) */}
        {showPrivacySettings && (
          <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-600" />
                Privacy by Design & DPDP Act 2023 Safeguards
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Zero Cloud Storage of Private Audio
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>📱 Saved Phonebook Contacts</span>
                  <span className="text-emerald-700 font-mono">100% Dormant</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Calls from saved family/friends are NEVER processed or sent to AI. Listener remains completely OFF.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>🏛️ Official Institutional Directory</span>
                  <span className="text-blue-700 font-mono">Verified DB</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Cross-checks inbound numbers against certified TRAI & banking registry to detect spoofed SIP trunks.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Scam Archetype Category Selector */}
        <section className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Covering All Major Indian Financial Voice Scams
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Only activates on unsaved/unknown calls
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.values(FINANCIAL_SCAM_TAXONOMY).map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedScenarioKey(item.id);
                  handleEndCall();
                  setCurrentTranscript(item.transcript);
                  setCurrentThreatScore(item.threat_score);
                }}
                className={`p-2.5 text-left rounded-xl border transition ${
                  selectedScenarioKey === item.id
                    ? "border-emerald-500 bg-emerald-50/50 text-emerald-950 font-bold shadow-2xs"
                    : "border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold truncate">
                  {item.category}
                </div>
                <div className="text-xs truncate font-medium mt-0.5">{item.name}</div>
              </button>
            ))}
          </div>
        </section>

        {/* HERO CARD: Live Call Intercept Console */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Active Call Header Banner */}
          <div className="p-6 border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs transition ${
                  isCallActive
                    ? isAiListeningMuted
                      ? "bg-slate-600 text-white"
                      : "bg-rose-600 text-white animate-pulse"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                <PhoneCall className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-slate-900">
                    {scenario.caller}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200">
                    Unsaved Number • AI Active
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Targeted Weakness: <span className="font-medium text-slate-700">{scenario.targeted_vulnerability}</span>
                </p>
              </div>
            </div>

            {/* Action Buttons & In-Call Kill Switch */}
            <div className="flex items-center gap-2">
              {isCallActive ? (
                <>
                  {/* IN-CALL PRIVACY KILL SWITCH */}
                  <button
                    onClick={toggleAiMute}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition ${
                      isAiListeningMuted
                        ? "bg-emerald-600 text-white border-emerald-700"
                        : "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100"
                    }`}
                  >
                    <EyeOff className="w-4 h-4" />
                    {isAiListeningMuted ? "AI Resumed (Tap to Mute)" : "Mute AI (Stop Listening)"}
                  </button>

                  <button
                    onClick={handleEndCall}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition"
                  >
                    <PhoneOff className="w-4 h-4 text-rose-400" /> End Call
                  </button>
                </>
              ) : (
                <button
                  onClick={handleStartCall}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs hover:shadow transition"
                >
                  <Play className="w-4 h-4 fill-white" /> Simulate & Play Fraud Call
                </button>
              )}

              {/* Live Mic Alternative */}
              {isRecording ? (
                <button
                  onClick={stopRecording}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold animate-pulse shadow-xs transition"
                >
                  <Square className="w-3.5 h-3.5 fill-white" /> Stop Mic ({recordTimer}s)
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  disabled={isProcessingMic}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-2xs transition"
                >
                  <Mic className="w-3.5 h-3.5 text-slate-600" />
                  {isProcessingMic ? "Transcribing..." : "Live Mic"}
                </button>
              )}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Live Audio Transcript Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-slate-400" />
                  Live Audio Stream (Transcribed by Sarvam Saaras:v4)
                </span>
                {isAiListeningMuted ? (
                  <span className="flex items-center gap-1 text-amber-600 font-bold text-[11px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    <EyeOff className="w-3.5 h-3.5" /> AI Listening Paused by User
                  </span>
                ) : playingAudio === "scam_call" ? (
                  <span className="flex items-center gap-1 text-rose-600 font-semibold animate-pulse text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-rose-600"></span> Audio Streaming
                  </span>
                ) : null}
              </div>

              <div className={`p-4 rounded-2xl border text-sm leading-relaxed font-sans transition ${
                isAiListeningMuted
                  ? "bg-amber-50/40 border-amber-200 text-slate-500 italic"
                  : "bg-slate-50/80 border-slate-200/80 text-slate-800"
              }`}>
                {isAiListeningMuted
                  ? "[AI Listening Paused by User — Audio stream is not being captured or transcribed]"
                  : `"${currentTranscript}"`}
              </div>
            </div>

            {/* Forensic Detection Indicators */}
            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-rose-950">
                      HOW WE DETECTED: {currentThreatScore}% FRAUD CONFIDENCE
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {scenario.detected_vectors.map((vec, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-medium px-2 py-0.5 rounded bg-white text-rose-900 border border-rose-200 shadow-2xs"
                      >
                        🚩 {vec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* THE MULTI-TIER INTERVENTION SUITE */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>How We Intervene (4-Tier Active Intervention Engine)</span>
                <span className="text-slate-400 font-normal">Autonomous Actions to Protect the Citizen</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Intervention 1: In-Ear Whispered Guidance */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 transition shadow-xs flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <Headphones className="w-3 h-3" /> TIER 1: IN-EAR WHISPER
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Private Audio</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Discreet In-Ear Audio Prompt to Victim
                    </h4>
                    <p className="text-xs text-slate-600 leading-snug">
                      "{scenario.whisper_advice}"
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      playAudio("/api/audio/warning.wav", "whisper", scenario.whisper_advice)
                    }
                    className="mt-3 w-full py-2 px-3 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 flex items-center justify-center gap-1.5 transition"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    {playingAudio === "whisper" ? "Pause In-Ear Audio" : "Listen to In-Ear Audio Guide (Bulbul:v4)"}
                  </button>
                </div>

                {/* Intervention 2: OTP & Credential Shield */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 transition shadow-xs flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> TIER 2: CREDENTIAL SHIELD
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold">Auto-Active</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Automatic Microphone Mute on Sensitive Data
                    </h4>
                    <p className="text-xs text-slate-600 leading-snug">
                      If the citizen attempts to utter an OTP or PIN, KAVACH actively cuts off transmission to the scammer.
                    </p>
                  </div>

                  <div className="mt-3 p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600 font-mono">
                    <span>Targeted: {scenario.sensitive_data_targeted[0]}</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Blocked
                    </span>
                  </div>
                </div>

                {/* Intervention 3: Honeypot Scam-Baiter */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-amber-300 transition shadow-xs flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 flex items-center gap-1">
                        <Bug className="w-3 h-3" /> TIER 3: HONEYPOT BAITER
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">ashok_hi_character</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">
                      AI Agent Steps In to Waste Scammer's Time
                    </h4>
                    <p className="text-xs text-slate-600 leading-snug">
                      "{scenario.honeypot_dialogue}"
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      playAudio("/api/audio/honeypot.wav", "honeypot", scenario.honeypot_dialogue)
                    }
                    className="mt-3 w-full py-2 px-3 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 flex items-center justify-center gap-1.5 transition"
                  >
                    <Bug className="w-3.5 h-3.5" />
                    {playingAudio === "honeypot" ? "Pause Honeypot" : "Deploy Banarasi Honeypot (Bulbul:v4)"}
                  </button>
                </div>

                {/* Intervention 4: Family Emergency Circuit-Breaker */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-purple-300 transition shadow-xs flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 flex items-center gap-1">
                        <Users className="w-3 h-3" /> TIER 4: FAMILY CIRCUIT-BREAKER
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">WhatsApp Alert</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Instant WhatsApp/SMS Alert to Family Member
                    </h4>
                    <p className="text-xs text-slate-600 leading-snug">
                      Alerts caregiver/children: "⚠️ Father is currently on an active scam call demanding banking OTP."
                    </p>
                  </div>

                  <button
                    onClick={sendFamilyAlert}
                    className="mt-3 w-full py-2 px-3 rounded-xl text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 flex items-center justify-center gap-1.5 transition"
                  >
                    <Users className="w-3.5 h-3.5" />
                    {familyAlertSent ? "✓ Emergency Alert Sent to Family!" : "Simulate Family Alert Dispatch"}
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom 1930 Cyber Crime Report Drawer */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setShowReport(!showReport)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition"
              >
                <FileText className="w-4 h-4 text-slate-500" />
                {showReport ? "Hide" : "View"} Pre-filled 1930 Cyber Crime Portal Report
              </button>

              <button
                onClick={copyDossier}
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

            {showReport && (
              <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 font-mono text-xs leading-relaxed space-y-2 border border-slate-800">
                <div className="text-emerald-400 font-bold border-b border-slate-800 pb-1.5 flex justify-between">
                  <span>// NATIONAL CYBER CRIME PORTAL (1930) - OFFICIAL COMPLAINT</span>
                  <span>STATUS: EVIDENCE PACKAGED</span>
                </div>
                <div><span className="text-slate-400">INCIDENT TYPE:</span> {scenario.name} ({scenario.category})</div>
                <div><span className="text-slate-400">SUSPECT NUMBER:</span> {scenario.caller}</div>
                <div><span className="text-slate-400">TARGETED DATA:</span> {scenario.sensitive_data_targeted.join(", ")}</div>
                <div><span className="text-slate-400">APPLICABLE LAWS:</span> BNS 318(4) (Cheating) • IT Act Section 66D • RBI Digital Safety Framework</div>
              </div>
            )}
          </div>
        </div>

        {/* Presentation Pitch Banner */}
        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-950 leading-relaxed">
            <span className="font-bold">Privacy Architecture (DPDP Act 2023):</span> Saved phonebook contacts are 100% dormant. AI only activates on unsaved numbers, with a physical in-call kill switch allowing the user to pause listening at any second.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-4 text-center text-xs text-slate-500">
        KAVACH | Complete Financial Fraud Voice Shield Powered by Sarvam AI
      </footer>
    </main>
  );
}
