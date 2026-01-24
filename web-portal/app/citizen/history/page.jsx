"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Clock, CheckCircle, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MyHistory() {
  const router = useRouter();
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  // ... inside MyHistory component ...

async function fetchUserGrievances(name) { // You can remove 'name' param if not used
    try {
        // Get user from storage to find email
        const userStr = localStorage.getItem("citizen_user");
        if (!userStr) return;
        const user = JSON.parse(userStr);

        // 🚀 CHANGED: Pass email in the URL query string
        const res = await fetch(`http://localhost:5000/api/grievances?email=${user.email}`);
        
        const json = await res.json();
        if (json.success) {
            setGrievances(json.data); // No need to filter manually anymore!
        }
    } catch (err) {
        console.error("Failed to fetch");
    } finally {
        setLoading(false);
    }
}

  useEffect(() => {
    const userStr = localStorage.getItem("citizen_user");
    if (!userStr) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(userStr);
    setUserName(user.name);
    fetchUserGrievances(user.name);
  }, []);

  async function fetchUserGrievances(name) {
    try {
      const res = await fetch("http://localhost:5000/api/grievances");
      const json = await res.json();
      if (json.success) {
        const myGrievances = json.data.filter((g) => 
            g.citizenName?.toLowerCase() === name.toLowerCase()
        );
        setGrievances(myGrievances);
      }
    } catch (err) {
      console.error("Failed to fetch grievances");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-2xl mx-auto">
        
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all">
     <ArrowLeft size={20} className="text-slate-900" />
</button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">My Complaints</h1>
            <p className="text-slate-600 text-sm font-medium">Logged in as {userName}</p>
          </div>
        </div>

        {loading ? (
           <p className="text-center text-slate-500 font-medium">Loading records...</p>
        ) : grievances.length === 0 ? (
           <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
              <p className="text-slate-900 font-bold mb-1">No complaints found</p>
              <p className="text-slate-500 text-sm mb-4">You haven't reported anything yet.</p>
              <Link href="/citizen/lodge" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">
                 Report Issue
              </Link>
           </div>
        ) : (
           <div className="space-y-4">
              {grievances.map((g) => (
                <div key={g._id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    
                    {/* Card Header */}
                    <div className="flex justify-between items-start mb-3">
                        <span className={`inline-block px-2 py-1 rounded text-[11px] font-bold uppercase ${
                            g.category === 'Police' ? 'bg-red-100 text-red-800' : 
                            g.category === 'Water' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                        }`}>
                            {g.category}
                        </span>
                        <span className="text-xs font-bold text-slate-400">
                            {new Date(g.createdAt).toLocaleDateString()}
                        </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-2">{g.description}</h3>
                    
                    <div className="flex items-center gap-2 mb-4 text-sm font-medium text-slate-600">
                        <MapPin size={14} className="text-red-500" /> {g.area}
                    </div>

                    {/* Footer Row */}
                    <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Est. Resolution</span>
                            <span className="text-xs font-bold text-blue-700">{g.estimatedTime || "Processing"}</span>
                        </div>
                        <StatusBadge status={g.status} />
                    </div>

                    {/* Official Response Block */}
                    {g.status === 'Resolved' && g.adminReply && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-lg animate-in fade-in">
                            <p className="text-[10px] font-bold text-green-600 uppercase flex items-center gap-1">
                                <CheckCircle size={12}/> Official Response
                            </p>
                            <p className="text-sm text-green-800 font-medium mt-1">"{g.adminReply}"</p>
                        </div>
                    )}
                </div>
              ))}
           </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
    if (status === 'Resolved') {
        return <span className="flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-full"><CheckCircle size={14}/> Resolved</span>
    }
    if (status === 'Pending') {
        return <span className="flex items-center gap-1.5 text-xs font-bold text-orange-700 bg-orange-50 px-3 py-1.5 rounded-full"><Clock size={14}/> Pending</span>
    }
    return <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">{status}</span>
}