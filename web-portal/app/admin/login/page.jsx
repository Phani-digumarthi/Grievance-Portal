"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowRight, Loader2 } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    setTimeout(() => {
        if (email === "admin@kakinada.gov.in" && password === "admin123") {
            localStorage.setItem("adminToken", "valid");
            router.push("/admin/dashboard");
        } else {
            setError("Invalid Official Credentials");
            setLoading(false);
        }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white max-w-sm w-full rounded-2xl shadow-2xl overflow-hidden">
        
        <div className="bg-slate-800 p-8 text-center border-b border-slate-700">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                <ShieldAlert size={32} />
            </div>
            <h1 className="text-xl font-bold text-white">Official Access</h1>
            <p className="text-slate-400 text-xs mt-1">Authorized Personnel Only</p>
        </div>

        <div className="p-8">
            {error && (
                <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm font-bold text-center rounded-lg border border-red-100">
                    {error}
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Official Email</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full p-3 rounded-lg border border-slate-300 focus:border-slate-800 outline-none font-medium text-slate-900"
                        placeholder="admin@kakinada.gov.in"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Secure Password</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full p-3 rounded-lg border border-slate-300 focus:border-slate-800 outline-none font-medium text-slate-900"
                        placeholder="••••••••"
                    />
                </div>

                <button 
                    disabled={loading}
                    className="w-full bg-slate-900 hover:bg-black text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all mt-4"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <>Access Dashboard <ArrowRight size={16}/></>}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
}