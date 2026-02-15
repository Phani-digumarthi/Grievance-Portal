"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation"; 
import { 
  ArrowLeft, Mic, Image as ImageIcon, Type, Send, 
  Loader2, CheckCircle2, Play, Trash2, History, MapPin, 
  Camera, RefreshCw, X, Map
} from "lucide-react";
import Link from "next/link";

// Locations List
const LOCATIONS = [
  "Anjaneya Nagar", "APSP Camp", "Ashok Nagar", "Auto Nagar", "Ayodhya Nagar",
  "Bank Colony", "Burma Colony", "Collectorate", "Drivers Colony",
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
  
  // User Data
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [area, setArea] = useState(LOCATIONS[0]); 
  const [addressDetails, setAddressDetails] = useState(""); 
  
  // Inputs
  const [text, setText] = useState("");
  const [file, setFile] = useState(null); 
  const [audioBlob, setAudioBlob] = useState(null);
  
  // States
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);

  // --- 📸 GEO CAMERA STATES ---
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [geoData, setGeoData] = useState({ 
      lat: null, 
      lng: null, 
      address: "Fetching location...", 
      time: "" 
  });
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Audio Refs
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

  // --- 📸 GEO CAMERA LOGIC ---

  const startCamera = async () => {
    setIsCameraOpen(true);
    setFile(null); 

    // 1. Get Location & Address
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            // Reverse Geocode (Get readable address)
            let addressText = "Unknown Location";
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                const data = await res.json();
                addressText = data.display_name.split(",").slice(0, 3).join(", "); // Shorten address
            } catch (err) {
                console.error("Address fetch failed", err);
            }

            setGeoData({
                lat: lat.toFixed(6),
                lng: lng.toFixed(6),
                address: addressText,
                time: new Date().toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'medium' })
            });
        }, (err) => {
            alert("Location access needed for Geo-Tagging.");
            setGeoData({ lat: "N/A", lng: "N/A", address: "Location Denied", time: new Date().toLocaleString() });
        });
    }

    // 2. Start Video
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }); 
        streamRef.current = stream;
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    } catch (err) {
        alert("Camera access denied.");
        setIsCameraOpen(false);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas) {
        const context = canvas.getContext("2d");
        
        // Set canvas size to match video resolution
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // 1. Draw The Photo
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // --- 🎨 DRAW THE "GPS MAP CAMERA" OVERLAY ---
        
        const padding = 20;
        const boxHeight = 140; 
        const boxY = canvas.height - boxHeight - padding;
        const boxX = padding;
        const boxWidth = canvas.width - (padding * 2);

        // A. Draw Semi-Transparent Black Box (The "Card")
        context.fillStyle = "rgba(0, 0, 0, 0.75)"; 
        context.roundRect ? context.roundRect(boxX, boxY, boxWidth, boxHeight, 15) : context.fillRect(boxX, boxY, boxWidth, boxHeight);
        context.fill();

        // B. Draw "Map Placeholder" (Left Side)
        const mapSize = 100;
        const mapX = boxX + 20;
        const mapY = boxY + 20;
        
        // Draw Map Box Background
        context.fillStyle = "rgba(255, 255, 255, 0.2)";
        context.fillRect(mapX, mapY, mapSize, mapSize);
        
        // Draw Pin Icon (Simplified as circle/text)
        context.fillStyle = "#ef4444"; // Red
        context.beginPath();
        context.arc(mapX + mapSize/2, mapY + mapSize/2, 10, 0, 2 * Math.PI);
        context.fill();
        context.fillStyle = "white";
        context.font = "bold 10px Arial";
        context.fillText("MAP", mapX + 38, mapY + mapSize + 15);

        // C. Draw Text Info (Right Side)
        const textX = mapX + mapSize + 20;
        const textY = boxY + 35;

        context.textAlign = "left";
        context.fillStyle = "white";

        // 1. Location Name (Bold)
        context.font = "bold 24px Arial";
        context.fillText(area || "Kakinada", textX, textY);

        // 2. Full Address
        context.font = "14px Arial";
        context.fillText(geoData.address, textX, textY + 25);
        
        // 3. Lat / Long
        context.font = "14px monospace";
        context.fillStyle = "#cbd5e1"; // Light gray
        context.fillText(`Lat: ${geoData.lat}  Long: ${geoData.lng}`, textX, textY + 50);

        // 4. Date & Time
        context.font = "14px Arial";
        context.fillStyle = "#fbbf24"; // Amber color for time
        context.fillText(geoData.time, textX, textY + 75);

        // --- END OVERLAY ---

        // Convert to File and Save
        canvas.toBlob((blob) => {
            const capturedFile = new File([blob], "geo_evidence.jpg", { type: "image/jpeg" });
            setFile(capturedFile);
            stopCamera(); 
        }, "image/jpeg", 0.95);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  // --- 🎙️ AUDIO LOGIC ---
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
    if (!text && !file && !audioBlob) {
        setLoading(false);
        return alert("Please provide at least one input.");
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("citizenName", name || "Anonymous Citizen"); 
    formData.append("userEmail", email || "anonymous@example.com"); 
    formData.append("area", area);
    
    // Add Geo Data to Description automatically
    const geoInfo = geoData.lat ? `\n\n[📍 GEO-TAG: ${geoData.lat}, ${geoData.lng} | ${geoData.address}]` : "";
    
    const fullDescription = text 
      ? `${text}\n\n[Address Details: ${addressDetails || "N/A"}]${geoInfo}`
      : `Media Report Submitted.\n\n[Address Details: ${addressDetails || "N/A"}]${geoInfo}`;

    formData.append("description", fullDescription); 
    formData.append("category", "General"); 
    formData.append("priority", "Medium");
    
    if (file) formData.append("image", file);
    if (audioBlob) formData.append("audio", audioBlob, "voice.wav");
    
    try {
        const res = await fetch("http://localhost:5000/api/grievances/submit", {
            method: "POST",
            body: formData
        });

        const json = await res.json();
        
        if (json.success) {
            setSuccessData(json.data);
        } else {
            alert("Submission Failed: " + (json.error || "Unknown Error"));
        }
    } catch (err) {
        console.error(err);
        alert("Network Error. Please check if the server is running.");
    } finally {
        setLoading(false);
    }
  };

  if (successData) {
      return (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
              <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center animate-in zoom-in-95 border border-slate-200">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-200">
                      <CheckCircle2 size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Report Lodged!</h2>
                  <p className="text-slate-800 font-medium mb-6 mt-2">Your Geo-Tagged evidence has been uploaded.</p>
                  
                  <div className="bg-slate-100 p-5 rounded-xl text-left text-sm space-y-3 mb-6 border border-slate-300">
                      <p className="flex justify-between border-b border-slate-300 pb-2">
                          <span className="font-bold text-slate-700 uppercase tracking-wide text-xs">Category</span> 
                          <span className="font-bold text-slate-900">{successData.category}</span>
                      </p>
                      <p className="flex justify-between border-b border-slate-300 pb-2">
                          <span className="font-bold text-slate-700 uppercase tracking-wide text-xs">Priority</span> 
                          <span className="font-bold text-slate-900">{successData.priority}</span>
                      </p>
                      <p className="flex justify-between">
                          <span className="font-bold text-slate-700 uppercase tracking-wide text-xs">Reference ID</span> 
                          <span className="font-mono font-bold text-blue-700">#{successData._id.slice(-6)}</span>
                      </p>
                  </div>
                  
                  <button onClick={() => window.location.reload()} className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-colors shadow-lg">Lodge Another</button>
              </div>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      
      {/* Header */}
      <div className="bg-white p-4 sticky top-0 z-10 border-b border-slate-200 flex items-center justify-between shadow-sm">
         <div className="flex items-center gap-3">
             <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full text-slate-800">
                <ArrowLeft size={20}/>
             </button>
             <h1 className="text-lg font-bold text-slate-900">Smart Lodge</h1>
         </div>
         <Link href="/citizen/history" className="p-2 hover:bg-slate-100 rounded-full text-slate-700 flex items-center gap-2">
            <History size={20} />
            <span className="text-xs font-bold hidden sm:block">History</span>
         </Link>
      </div>

      <div className="max-w-xl mx-auto p-6 space-y-6">
        
        {/* User Info Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex gap-4">
                <div className="flex-1">
                    <label className="text-xs font-bold text-slate-700 uppercase mb-1.5 block">Citizen Name</label>
                    <input 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        className="w-full font-bold text-slate-900 outline-none border-b-2 border-slate-200 py-1.5 bg-transparent focus:border-blue-600 transition-colors" 
                        placeholder="Anonymous"
                    />
                </div>
                <div className="flex-1">
                    <label className="text-xs font-bold text-slate-700 uppercase mb-1.5 block">Area</label>
                    <select value={area} onChange={e => setArea(e.target.value)} className="w-full font-bold text-slate-900 outline-none bg-transparent cursor-pointer border-b-2 border-slate-200 py-1.5 focus:border-blue-600 transition-colors">
                        {LOCATIONS.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
                    </select>
                </div>
            </div>
            <div className="relative">
                 <label className="text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center gap-1">
                    <MapPin size={12} className="text-slate-700"/> Specific Address
                 </label>
                 <input 
                    value={addressDetails} 
                    onChange={(e) => setAddressDetails(e.target.value)} 
                    className="w-full bg-slate-50 rounded-lg px-3 py-3 text-sm font-medium text-slate-900 outline-none border border-slate-300 focus:border-blue-600 placeholder:text-slate-500" 
                    placeholder="e.g. Near Water Tank..." 
                />
            </div>
        </div>

        <p className="text-center text-slate-700 text-xs font-bold uppercase tracking-widest bg-slate-200 py-2 rounded-full">Evidence Collection</p>

        <div className="grid grid-cols-1 gap-4">

            {/* 📸 GEO CAMERA UI */}
            <div className={`p-4 rounded-2xl border-2 transition-all ${file ? 'border-green-500 bg-green-50' : isCameraOpen ? 'border-blue-500 bg-slate-900' : 'border-slate-300 bg-white'}`}>
                <div className="flex justify-between items-center mb-3">
                    <div className={`flex items-center gap-2 font-bold ${isCameraOpen ? 'text-white' : 'text-slate-800'}`}>
                        <Camera size={20} className={isCameraOpen ? 'text-blue-400' : 'text-slate-700'}/> 
                        {isCameraOpen ? "Camera Active" : file ? "Evidence Captured" : "Visual Evidence"}
                    </div>
                    {(file || isCameraOpen) && (
                        <button onClick={() => { setFile(null); stopCamera(); }} className="text-slate-500 hover:text-red-600">
                            <X size={20} />
                        </button>
                    )}
                </div>

                {isCameraOpen ? (
                    <div className="relative rounded-xl overflow-hidden bg-black shadow-lg">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-80 object-cover"></video>
                        <canvas ref={canvasRef} className="hidden"></canvas>
                        
                        {/* Live Overlay Preview */}
                        <div className="absolute bottom-4 left-4 right-4 bg-black/60 p-4 rounded-xl text-white backdrop-blur-sm border border-white/10">
                             <div className="flex justify-between items-start">
                                 <div>
                                     <p className="text-lg font-bold text-white">{area}</p>
                                     <p className="text-[10px] text-slate-300 mt-1 max-w-[200px] leading-tight">{geoData.address}</p>
                                     <p className="text-[10px] text-blue-300 font-mono mt-2">Lat: {geoData.lat} | Lng: {geoData.lng}</p>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-xl font-bold text-amber-400">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                    <p className="text-[10px] text-slate-300">{new Date().toLocaleDateString()}</p>
                                 </div>
                             </div>
                        </div>

                        <button onClick={capturePhoto} className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full border-4 border-slate-300 shadow-lg active:scale-95 transition-transform z-20"></button>
                    </div>
                ) : !file ? (
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={startCamera} className="py-4 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl font-bold text-sm flex flex-col items-center gap-2 border border-blue-200 transition-colors">
                            <Camera size={24} />
                            Open Geo-Camera
                        </button>
                        <label className="py-4 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-sm flex flex-col items-center gap-2 border border-slate-300 cursor-pointer transition-colors">
                            <ImageIcon size={24} />
                            Upload from Gallery
                            <input type="file" className="hidden" accept="image/*" onChange={e=>setFile(e.target.files?.[0]||null)}/>
                        </label>
                    </div>
                ) : (
                    <div className="relative">
                        <img src={URL.createObjectURL(file)} alt="Evidence" className="w-full h-64 object-cover rounded-xl border border-slate-300 shadow-sm" />
                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                            <CheckCircle2 size={12}/> Geo-Tagged
                        </div>
                        <button onClick={startCamera} className="absolute bottom-2 right-2 bg-white text-slate-900 text-xs font-bold px-3 py-1.5 rounded shadow-sm flex items-center gap-1 hover:bg-slate-100 border border-slate-200">
                             <RefreshCw size={12}/> Retake
                        </button>
                    </div>
                )}
            </div>

            {/* 🎙️ Voice Input */}
            <div className={`p-4 rounded-2xl border-2 transition-all ${audioBlob ? 'border-green-500 bg-green-50' : isRecording ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white'}`}>
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2 text-slate-800 font-bold">
                        <Mic size={20} className={isRecording ? 'text-red-600 animate-pulse' : 'text-slate-700'}/> 
                        {isRecording ? "Recording..." : audioBlob ? "Audio Ready" : "Voice Note"}
                    </div>
                    {audioBlob && <button onClick={()=>setAudioBlob(null)}><Trash2 size={18} className="text-slate-500 hover:text-red-600"/></button>}
                </div>
                {!audioBlob ? (
                    <button onClick={toggleRecord} className={`w-full py-3 rounded-xl font-bold text-sm border ${isRecording ? 'bg-red-600 text-white border-red-700' : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'}`}>
                        {isRecording ? "Stop Recording" : "Tap to Record"}
                    </button>
                ) : (
                    <div className="text-xs text-green-800 font-bold flex items-center gap-2"><Play size={12}/> Audio Captured</div>
                )}
            </div>

            {/* 📝 Text Input */}
            <div className="p-4 rounded-2xl border-2 border-slate-300 bg-white focus-within:border-blue-600 transition-colors">
                <div className="flex items-center gap-2 text-slate-800 font-bold mb-2">
                    <Type size={20} className="text-slate-700"/> Grievance Description
                </div>
                <textarea 
                    value={text} 
                    onChange={e=>setText(e.target.value)} 
                    className="w-full h-20 outline-none resize-none text-sm font-medium text-slate-900 placeholder:text-slate-500"
                    placeholder="Describe the issue here..."
                />
            </div>
        </div>

        {/* Submit Button */}
        <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-lg shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
        {loading ? <Loader2 className="animate-spin"/> : <Send size={20} />}
            {loading ? "Submitting..." : "Submit Grievance"}
        </button>

      </div>
    </div>
  );
}