"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Mail, Lock, User, Loader2, MapPin } from "lucide-react";

// List of allowed Kakinada Pincodes
const VALID_PINCODES = [
  "533001", "533002", "533003", "533004", 
  "533005", "533006", "533016"
];

export default function CitizenLogin() {
  const router = useRouter();
  
  const [view, setView] = useState('login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pincode, setPincode] = useState(""); 

  useEffect(() => { 
      setMessage(""); 
      if(view === 'login') { setName(""); setPincode(""); }
  }, [view]);

  // 🚀 UPDATED: Login via Backend API
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
        const res = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (data.success) {
            // Save user session for the frontend to use
            localStorage.setItem("citizen_user", JSON.stringify(data.user));
            router.push("/citizen/lodge");
        } else {
            setMessage(data.message || "❌ Login Failed");
        }
    } catch (err) {
        console.error("Login Error:", err);
        setMessage("❌ Server Error. Please check your connection.");
    } finally {
        setLoading(false);
    }
  };

  // 🚀 UPDATED: Sign Up via Backend API
  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // 1. Client-side Pincode Validation
    if (!VALID_PINCODES.includes(pincode.trim())) {
        setLoading(false);
        setMessage("❌ No service for this pincode.");
        return;
    }

    try {
        // 2. Call Backend API
        const res = await fetch('http://localhost:5000/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, pincode })
        });

        const data = await res.json();

        if (data.success) {
            setMessage("✅ Account created! Redirecting to login...");
            setTimeout(() => {
                setView('login');
                setLoading(false);
            }, 1500);
        } else {
            setMessage(data.message || "⚠️ Signup Failed");
            setLoading(false);
        }
    } catch (err) {
        console.error("Signup Error:", err);
        setMessage("❌ Server Error. Please check your connection.");
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        
        <div className="bg-blue-700 p-8 text-center text-white">
            <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20">
                <ShieldCheck size={32} />
            </div>
            <h1 className="text-2xl font-bold">
                {view === 'login' && "Citizen Login"}
                {view === 'signup' && "Create Account"}
            </h1>
            <p className="text-blue-100 text-sm mt-1">Kakinada Grievance Portal</p>
        </div>

        <div className="p-8">
            
            {message && (
                <div className={`mb-6 p-3 rounded-lg text-sm font-bold text-center ${message.startsWith('❌') ? 'bg-red-100 text-red-800 border border-red-200' : message.startsWith('⚠️') ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 'bg-green-100 text-green-800 border border-green-200'}`}>
                    {message}
                </div>
            )}

            {view === 'login' && (
                <form onSubmit={handleLogin} className="space-y-5 animate-in fade-in">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-3.5 text-slate-400" size={20} />
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 p-3 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none text-slate-900 font-medium placeholder:text-slate-400"
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 text-slate-400" size={20} />
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 p-3 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none text-slate-900 font-medium placeholder:text-slate-400"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button disabled={loading} className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-blue-200">
                        {loading ? <Loader2 className="animate-spin" /> : "Sign In"}
                    </button>

                    <div className="text-center mt-4">
                        <p className="text-slate-600 text-sm font-medium">Don't have an account? <button type="button" onClick={() => setView('signup')} className="text-blue-700 font-bold hover:underline">Create one</button></p>
                    </div>
                </form>
            )}

            {view === 'signup' && (
                <form onSubmit={handleSignUp} className="space-y-5 animate-in fade-in slide-in-from-right-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-3.5 text-slate-400" size={20} />
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-12 p-3 rounded-xl border border-slate-300 focus:border-blue-600 outline-none text-slate-900 font-medium"
                                placeholder="Enter your full name"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Kakinada Pincode</label>
                             <div className="relative">
                                <MapPin className="absolute left-4 top-3.5 text-slate-400" size={20} />
                                <input 
                                    type="text" 
                                    value={pincode}
                                    onChange={(e) => {
                                        // Only allow numbers and max 6 digits
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                        setPincode(val);
                                    }}
                                    className="w-full pl-12 p-3 rounded-xl border border-slate-300 focus:border-blue-600 outline-none text-slate-900 font-medium"
                                    placeholder="e.g. 533003"
                                    required
                                />
                             </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-3.5 text-slate-400" size={20} />
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 p-3 rounded-xl border border-slate-300 focus:border-blue-600 outline-none text-slate-900 font-medium"
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Set Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 text-slate-400" size={20} />
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 p-3 rounded-xl border border-slate-300 focus:border-blue-600 outline-none text-slate-900 font-medium"
                                placeholder="Create a strong password"
                                required
                            />
                        </div>
                    </div>

                    <button disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-green-200">
                        {loading ? <Loader2 className="animate-spin" /> : "Create Account"}
                    </button>

                    <div className="text-center mt-4">
                        <p className="text-slate-600 text-sm font-medium">Already have an account? <button type="button" onClick={() => setView('login')} className="text-blue-700 font-bold hover:underline">Log in</button></p>
                    </div>
                </form>
            )}

        </div>
      </div>
    </div>
  );
}