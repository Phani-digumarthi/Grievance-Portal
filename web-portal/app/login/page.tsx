"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Mail, Lock, User, Loader2 } from "lucide-react";

export default function CitizenLogin() {
  const router = useRouter();
  
  const [view, setView] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => { setMessage(""); }, [view]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
        const storedUser = localStorage.getItem(`user_${email}`);
        
        if (!storedUser) {
            setLoading(false);
            setMessage("❌ Account not found. Please Sign Up.");
            return;
        }

        const user = JSON.parse(storedUser);
        
        if (user.password !== password) {
            setLoading(false);
            setMessage("❌ Incorrect Password.");
            return;
        }

        localStorage.setItem("citizen_user", JSON.stringify({ name: user.name, email: user.email }));
        router.push("/citizen/lodge");
    }, 1000);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
        if (localStorage.getItem(`user_${email}`)) {
            setLoading(false);
            setMessage("⚠️ Email already exists. Please Login.");
            return;
        }

        const newUser = { name, email, password };
        localStorage.setItem(`user_${email}`, JSON.stringify(newUser));
        
        localStorage.setItem("citizen_user", JSON.stringify({ name, email }));
        
        setLoading(false);
        router.push("/citizen/lodge");
    }, 1000);
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
                <div className={`mb-6 p-3 rounded-lg text-sm font-bold text-center ${message.startsWith('✅') ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
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