"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation"; 
import { 
  ArrowLeft, Mic, Image as ImageIcon, Type, Send, 
  Loader2, CheckCircle2, Play, Trash2, History, MapPin 
} from "lucide-react";
import Link from "next/link";

// Locations from Kakinada Pincode List (Alphabetical Order)
const LOCATIONS = [
  "Anjaneya Nagar", "APSP Camp", "Ashok Nagar", "Auto Nagar", "Ayodhya Nagar",
  "Bank Colony", "Burma Colony", "Collectorate (KD-Collectorate)", "Drivers Colony",
  "Dwaraka Nagar", "FCI Colony", "Gandhi Nagar", "Ganganapalle",
  "Govt General Hospital (GGH)", "Gudari Gunta", "Indrapalem", "Jagannaickpur",
  "JNTU Kakinada", "Kaikavolu", "Kakinada Bazar", "Kakinada Head Office",
  "Kakinada Industrial Area", "Kakinada Municipal Corporation", "Kakinada Rural",
  "Karakuduru", "Kondayya Palem", "Kothuru", "Kovvada", "Kovvuru",
  "Rama Rao Peta", "Ramanayyapeta", "Sarpavaram", "Suryaraopeta",
  "Thammavaram", "Thimmapuram"
];

export default function SmartLodge() {
  const router = useRouter(); 
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [area, setArea] = useState(LOCATIONS[0]); 
  const [addressDetails, setAddressDetails] = useState(""); 
  
  // Input Modes
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  // UI
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    const userStr = localStorage.getItem("citizen_user");
    if (userStr) {
        const user = JSON.parse(userStr);
        setName(user.name);
        setEmail(user.email);
    }
  }, []);

  // Audio Logic
  const toggleRecord = async () => {
    if (isRecording) {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
    } else {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            chunksRef.current = [];
            recorder.ondataavailable = e => chunksRef.current.push(e.data);
            recorder.onstop = () => setAudioBlob(new Blob(chunksRef.current, { type: 'audio/wav' }));
            recorder.start();
            setIsRecording(true);
        } catch { alert("Mic Access Denied"); }
    }
  };

  const handleSubmit = async () => {
    if (!text && !file && !audioBlob) return alert("Please provide at least one input (Text, Audio, or Image).");

    setLoading(true);
    const formData = new FormData();
    formData.append("citizenName", name);
    formData.append("userEmail", email);
    formData.append("area", area);
    formData.append("addressDetails", addressDetails); 
    
    if (text) formData.append("textInput", text);
    if (file) formData.append("image", file);
    if (audioBlob) formData.append("audio", audioBlob, "voice.wav");
    
    const fullDescription = text 
      ? `${text}\n\n[Address Details: ${addressDetails || "N/A"}]`
      : `Media Report Submitted.\n\n[Address Details: ${addressDetails || "N/A"}]`;

    formData.append("category", "General"); 
    formData.append("priority", "Medium");
    formData.append("description", fullDescription); 

    try {
        const res = await fetch("http://localhost:5000/api/grievances/submit", { method: "POST", body: formData });
        const json = await res.json();
        
        if (json.success) {
            setSuccessData(json.data || {
                category: "General",
                priority: "Medium",
                description: fullDescription
            });
        }
    } catch {
        alert("Submission Failed");
    } finally {
        setLoading(false);
    }
  };

  if (successData) {
      return (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
              <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-200 animate-in zoom-in-95">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Success!</h2>
                  <p className="text-slate-500 mb-6 mt-2">Your report has been lodged successfully.</p>
                  
                  <div className="bg-slate-50 p-4 rounded-xl text-left border border-slate-200 text-sm space-y-2 mb-6">
                      <p><span className="font-bold text-slate-500 uppercase text-xs">Category:</span> <span className="font-bold text-slate-900">{successData.category}</span></p>
                      <p><span className="font-bold text-slate-500 uppercase text-xs">Priority:</span> <span className={`font-bold ${successData.priority==='High'?'text-red-600':'text-slate-900'}`}>{successData.priority}</span></p>
                      <p><span className="font-bold text-slate-500 uppercase text-xs">Description:</span> <span className="italic text-slate-600 line-clamp-3">&quot;{successData.description}&quot;</span></p>
                  </div>
                  
                  <button onClick={() => window.location.reload()} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold">Lodge Another</button>
                  <Link href="/citizen/history" className="block mt-4 text-blue-600 font-bold text-sm hover:underline">View My History</Link>
              </div>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      
      {/* Header */}
      <div className="bg-white p-4 sticky top-0 z-10 border-b border-slate-200 flex items-center justify-between">
         <div className="flex items-center gap-3">
             <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full">
                <ArrowLeft size={20}/>
             </button>
             <h1 className="text-lg font-bold text-slate-900">Smart Lodge</h1>
         </div>

         <Link href="/citizen/history" className="p-2 hover:bg-slate-100 rounded-full text-slate-600 flex items-center gap-2">
            <History size={20} />
            <span className="text-xs font-bold hidden sm:block">History</span>
         </Link>
      </div>

      <div className="max-w-xl mx-auto p-6 space-y-6">
        
        {/* User Info Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            
            {/* Row 1: Name & Area */}
            <div className="flex gap-4">
                <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Citizen Name</label>
                    <input value={name} onChange={e=>setName(e.target.value)} className="w-full font-bold text-slate-900 outline-none border-b border-slate-200 py-1 focus:border-blue-500 transition-colors" placeholder="Your Name" />
                </div>
                <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Area / Locality</label>
                    <select 
                        value={area} 
                        onChange={e => setArea(e.target.value)} 
                        className="w-full font-bold text-slate-900 outline-none bg-transparent cursor-pointer border-b border-slate-200 py-1 focus:border-blue-500 transition-colors"
                    >
                        {LOCATIONS.map((loc) => (
                            <option key={loc} value={loc}>{loc}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Row 2: Specific Address Details */}
            <div className="relative">
                 <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                    <MapPin size={10} /> Specific Address Details
                 </label>
                 <input 
                    value={addressDetails}
                    onChange={(e) => setAddressDetails(e.target.value)}
                    className="w-full bg-slate-50 rounded-lg px-3 py-2 text-sm font-medium text-slate-800 outline-none border border-slate-200 focus:border-blue-500 transition-colors"
                    placeholder="e.g. D.No 12-4, Near Water Tank, Beside Gandhi Statue..."
                 />
            </div>
        </div>

        <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest">Add Evidence (Mix & Match)</p>

        {/* Input Grid */}
        <div className="grid grid-cols-1 gap-4">
            
            {/* Voice Input */}
            <div className={`p-4 rounded-2xl border-2 transition-all ${audioBlob ? 'border-green-500 bg-green-50' : isRecording ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white'}`}>
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2 text-slate-900 font-bold">
                        <Mic size={20} className={isRecording ? 'text-red-500 animate-pulse' : 'text-slate-400'}/> 
                        {isRecording ? "Recording..." : audioBlob ? "Audio Ready" : "Voice Note"}
                    </div>
                    {audioBlob && <button onClick={()=>setAudioBlob(null)}><Trash2 size={16} className="text-slate-400 hover:text-red-500"/></button>}
                </div>
                {!audioBlob ? (
                    <button onClick={toggleRecord} className={`w-full py-3 rounded-xl font-bold text-sm ${isRecording ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        {isRecording ? "Stop Recording" : "Tap to Record"}
                    </button>
                ) : (
                    <div className="text-xs text-green-700 font-bold flex items-center gap-2"><Play size={12}/> Audio Captured</div>
                )}
            </div>

            {/* Image Input */}
            <div className={`p-4 rounded-2xl border-2 transition-all ${file ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-white'}`}>
                 <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2 text-slate-900 font-bold">
                        <ImageIcon size={20} className="text-slate-400"/> Photo Evidence
                    </div>
                    {file && <button onClick={()=>setFile(null)}><Trash2 size={16} className="text-slate-400 hover:text-red-500"/></button>}
                </div>
                {!file ? (
                    <label className="block w-full py-3 rounded-xl font-bold text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 text-center cursor-pointer">
                        Upload Photo
                        <input type="file" className="hidden" accept="image/*" onChange={e=>setFile(e.target.files?.[0]||null)}/>
                    </label>
                ) : (
                    <div className="text-xs text-green-700 font-bold truncate">File: {file.name}</div>
                )}
            </div>

            {/* Text Input */}
            <div className="p-4 rounded-2xl border-2 border-slate-200 bg-white focus-within:border-blue-500 transition-colors">
                <div className="flex items-center gap-2 text-slate-900 font-bold mb-2">
                    <Type size={20} className="text-slate-400"/> Description
                </div>
                <textarea 
                    value={text} 
                    onChange={e=>setText(e.target.value)} 
                    className="w-full h-20 outline-none resize-none text-sm font-medium text-slate-700 placeholder:text-slate-300"
                    placeholder="Type details (Optional if Image/Audio provided)..."
                />
            </div>

        </div>

        {/* Submit Button */}
        <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? <Loader2 className="animate-spin"/> : <Send size={20} />}
            {loading ? "Submitting..." : "Submit Grievance"}
        </button>

      </div>
    </div>
  );
}