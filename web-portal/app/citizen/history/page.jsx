"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, CheckCircle2, Siren, AlertTriangle } from "lucide-react";
// Removed CitizenProtected import

export default function CitizenHistory() {
  const router = useRouter();
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // 1. Get User Data (No Token needed)
    const userStr = localStorage.getItem("citizen_user");

    // If we don't know who the user is, send them to login
    if (!userStr) {
        router.push("/citizen/login");
        return;
    }

    const userData = JSON.parse(userStr);

    // 2. Fetch History using Email (Public Endpoint)
    fetch(`http://localhost:5000/api/grievances?email=${userData.email}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
            setGrievances(data.data);
        }
        setLoading(false);
      })
      .catch((err) => {
          console.error(err);
          setLoading(false);
      });
  }, [router]);

  return (
      <div className="min-h-screen bg-slate-50 font-sans pb-20">
        
        {/* Header */}
        <div className="bg-white p-4 shadow-sm sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200">
            <button 
                onClick={() => router.push('/citizen/lodge')} 
                className="p-2 hover:bg-slate-100 rounded-full text-slate-600"
            >
                <ArrowLeft size={24} />
            </button>
            <h1 className="text-lg font-bold text-slate-800">My Reports</h1>
        </div>

        <div className="max-w-2xl mx-auto p-4 space-y-4">
            {loading ? (
                <div className="text-center py-20 text-slate-400 animate-pulse">Loading history...</div>
            ) : grievances.length === 0 ? (
                <div className="text-center py-20">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <Clock size={32}/>
                    </div>
                    <h3 className="text-slate-600 font-bold">No reports found</h3>
                    <p className="text-slate-400 text-sm">You haven't submitted any complaints yet.</p>
                </div>
            ) : (
                grievances.map((g) => (
                    <div key={g._id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                        {/* Status & Date */}
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex gap-2">
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 ${
                                    g.status === 'Resolved' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                }`}>
                                    {g.status === 'Resolved' ? <CheckCircle2 size={10}/> : <Clock size={10}/>}
                                    {g.status}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                    g.priority === 'High' || g.priority === 'Immediate' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}>
                                    {g.priority}
                                </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                                {new Date(g.createdAt).toLocaleDateString()}
                            </span>
                        </div>

                        <h3 className="font-bold text-slate-800">{g.category} Issue</h3>
                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">{g.description}</p>
                        
                        {/* Admin Reply Section */}
                        {g.adminReply && (
                            <div className="mt-3 bg-blue-50 p-3 rounded-lg border border-blue-100 animate-in fade-in">
                                <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Official Response</p>
                                <p className="text-xs text-slate-700">{g.adminReply}</p>
                            </div>
                        )}
                        
                        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                            <span className="bg-slate-100 px-2 py-1 rounded">📍 {g.area}</span>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
  );
}