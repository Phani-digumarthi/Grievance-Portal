"use client";

import { useEffect, useState } from "react";
import { 
  LayoutDashboard, CheckCircle2, Clock, Flame, 
  ArrowUpDown, Calendar, Siren, X, MapPin, Activity, Loader2,
  LogOut, History
} from "lucide-react";
import dynamic from "next/dynamic";

interface Grievance {
  _id: string;
  category: string;
  description: string;
  priority: "Immediate" | "High" | "Medium" | "Low";
  status: "Pending" | "Resolved";
  area: string;
  createdAt: string;
  explanation?: string;
}

const GrievanceMap = dynamic(() => import("@/components/GrievanceMap"), { 
  ssr: false,
  loading: () => <div className="h-112.5 w-full bg-slate-100 animate-pulse rounded-2xl border border-slate-200"></div> 
});

export default function AdminDashboard() {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All"); 
  const [isSmartSort, setIsSmartSort] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/grievances")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setGrievances(data.data);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleResolve = async (id: string) => {
    setResolvingId(id);
    try {
        const res = await fetch(`http://localhost:5000/api/grievances/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Resolved' })
        });
        const data = await res.json();
        if (data.success) {
            setGrievances(prev => prev.map(g => g._id === id ? { ...g, status: 'Resolved' } : g));
            if (selectedGrievance && selectedGrievance._id === id) {
                setSelectedGrievance({ ...selectedGrievance, status: 'Resolved' });
            }
        }
    } catch (error) {
        console.error("Failed to resolve:", error);
        alert("Failed to update status.");
    } finally {
        setResolvingId(null);
    }
  };

  const getFilteredGrievances = () => {
    let filtered = grievances;

    if (activeFilter !== "All") {
        if (activeFilter === "Pending" || activeFilter === "Resolved") {
            filtered = grievances.filter(g => g.status === activeFilter);
        } else {
            filtered = grievances.filter(g => g.priority === activeFilter);
        }
    }

    if (isSmartSort) {
      const priorityWeight: Record<string, number> = { 
          "Immediate": 4, "High": 3, "Medium": 2, "Low": 1 
      };
      return filtered.sort((a, b) => {
        const getScore = (g: Grievance) => {
            if (g.status === 'Resolved') return -1;
            return priorityWeight[g.priority] || 0;
        };
        return getScore(b) - getScore(a);
      });
    } else {
      return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  };

  const displayList = getFilteredGrievances();
  const count = (key: keyof Grievance, val: string) => grievances.filter(g => g[key] === val).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20 relative">
      
      {/* Header */}
      <div className="bg-white p-4 border-b border-slate-200 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 p-2 rounded-lg">
            <LayoutDashboard className="text-blue-600" size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin<span className="text-blue-600">Dashboard</span></h1>
        </div>
        
        <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                <History size={18} />
                History
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100">
                <LogOut size={18} />
                Logout
            </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">

        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <button onClick={() => setActiveFilter("All")} className={`p-4 rounded-xl border text-left transition-all hover:scale-105 shadow-sm ${activeFilter==="All" ? "bg-white border-blue-500 ring-2 ring-blue-500/10" : "bg-white border-slate-200 hover:border-blue-400"}`}>
                <div className="text-slate-500 text-[10px] font-bold uppercase mb-1">Total</div>
                <div className="text-2xl font-bold text-slate-900">{grievances.length}</div>
            </button>
            <button onClick={() => setActiveFilter("Pending")} className={`p-4 rounded-xl border text-left transition-all hover:scale-105 shadow-sm ${activeFilter==="Pending" ? "bg-white border-yellow-500 ring-2 ring-yellow-500/10" : "bg-white border-slate-200 hover:border-yellow-400"}`}>
                <div className="text-yellow-600 text-[10px] font-bold uppercase mb-1 flex items-center gap-1"><Clock size={12}/> Pending</div>
                <div className="text-2xl font-bold text-slate-900">{count("status", "Pending")}</div>
            </button>
            <button onClick={() => setActiveFilter("Resolved")} className={`p-4 rounded-xl border text-left transition-all hover:scale-105 shadow-sm ${activeFilter==="Resolved" ? "bg-white border-green-500 ring-2 ring-green-500/10" : "bg-white border-slate-200 hover:border-green-400"}`}>
                <div className="text-green-600 text-[10px] font-bold uppercase mb-1 flex items-center gap-1"><CheckCircle2 size={12}/> Resolved</div>
                <div className="text-2xl font-bold text-slate-900">{count("status", "Resolved")}</div>
            </button>
             <div className="hidden lg:block"></div>
            <button onClick={() => setActiveFilter("Immediate")} className={`p-4 rounded-xl border text-left transition-all hover:scale-105 shadow-sm ${activeFilter==="Immediate" ? "bg-purple-50 border-purple-500 ring-2 ring-purple-500/20" : "bg-white border-slate-200 hover:border-purple-400"}`}>
                <div className="text-purple-600 text-[10px] font-bold uppercase mb-1 flex items-center gap-1"><Siren size={12}/> Immediate</div>
                <div className="text-2xl font-bold text-slate-900">{count("priority", "Immediate")}</div>
            </button>
             <button onClick={() => setActiveFilter("High")} className={`p-4 rounded-xl border text-left transition-all hover:scale-105 shadow-sm ${activeFilter==="High" ? "bg-red-50 border-red-500 ring-2 ring-red-500/20" : "bg-white border-slate-200 hover:border-red-400"}`}>
                <div className="text-red-600 text-[10px] font-bold uppercase mb-1 flex items-center gap-1"><Flame size={12}/> High</div>
                <div className="text-2xl font-bold text-slate-900">{count("priority", "High")}</div>
            </button>
             <button onClick={() => setActiveFilter("Medium")} className={`p-4 rounded-xl border text-left transition-all hover:scale-105 shadow-sm ${activeFilter==="Medium" ? "bg-orange-50 border-orange-500 ring-2 ring-orange-500/20" : "bg-white border-slate-200 hover:border-orange-400"}`}>
                <div className="text-orange-600 text-[10px] font-bold uppercase mb-1">Medium</div>
                <div className="text-2xl font-bold text-slate-900">{count("priority", "Medium")}</div>
            </button>
        </div>

        {/* Map & List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                        <MapPin className="text-slate-400" size={20}/> Live Heatmap
                    </h2>
                    <div className="flex items-center gap-3 bg-white p-1.5 rounded-lg border border-slate-200 shadow-sm">
                        <span className={`text-xs font-bold px-2 ${!isSmartSort ? "text-blue-600" : "text-slate-400"}`}>Time</span>
                        <button onClick={() => setIsSmartSort(!isSmartSort)} className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 relative ${isSmartSort ? "bg-purple-600" : "bg-slate-200"}`}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isSmartSort ? "translate-x-6" : "translate-x-0"}`}></div>
                        </button>
                        <span className={`text-xs font-bold px-2 ${isSmartSort ? "text-purple-600" : "text-slate-400"}`}>Priority Sort</span>
                    </div>
                </div>
                <GrievanceMap grievances={displayList} />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-125">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur sticky top-0 rounded-t-2xl z-10">
                    <h3 className="font-bold flex items-center gap-2 text-slate-700">
                        {isSmartSort ? <ArrowUpDown size={16} className="text-purple-600"/> : <Calendar size={16} className="text-blue-600"/>}
                        {isSmartSort ? "Sorted by Urgency" : "Recent Reports"}
                    </h3>
                    <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">{displayList.length} items</span>
                </div>

                <div className="overflow-y-auto flex-1 p-2 space-y-2 custom-scrollbar">
                    {loading ? (
                        <div className="text-center py-10 text-slate-400">Loading...</div>
                    ) : displayList.length === 0 ? (
                        <div className="text-center py-10 text-slate-400">No records found.</div>
                    ) : (
                        displayList.map((g) => (
                            <div key={g._id} className={`p-3 rounded-xl border transition-all group hover:shadow-md ${
                                g.priority === 'Immediate' ? 'bg-purple-50 border-purple-200' : 'bg-white border-slate-100 hover:border-slate-300'
                            }`}>
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                        g.status === 'Resolved' ? 'bg-green-100 text-green-700 border border-green-200' :
                                        g.priority === 'Immediate' ? 'bg-purple-600 text-white shadow-purple-200 shadow-lg' :
                                        g.priority === 'High' ? 'bg-red-100 text-red-700 border border-red-200' :
                                        g.priority === 'Medium' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                                        'bg-blue-50 text-blue-600 border border-blue-100'
                                    }`}>
                                        {g.status === 'Resolved' ? <CheckCircle2 size={8}/> : g.priority === 'Immediate' && <Siren size={8}/>}
                                        {g.status === 'Resolved' ? 'Resolved' : g.priority}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                        {new Date(g.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' })}
                                    </span>
                                </div>
                                <h4 className="font-bold text-sm text-slate-800">{g.category} Issue</h4>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{g.description}</p>
                                <div className="mt-3 flex justify-between items-center">
                                    <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded">📍 {g.area}</span>
                                    <button onClick={() => setSelectedGrievance(g)} className="text-[10px] font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors">
                                        VIEW DETAILS &rarr;
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* Popup Modal */}
      {selectedGrievance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                             <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                selectedGrievance.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                                selectedGrievance.priority === 'Immediate' ? 'bg-purple-600 text-white' :
                                selectedGrievance.priority === 'High' ? 'bg-red-100 text-red-700' :
                                'bg-blue-100 text-blue-700'
                            }`}>
                                {selectedGrievance.status === 'Resolved' ? 'Resolved' : `${selectedGrievance.priority} Priority`}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">#{selectedGrievance._id.slice(-6)}</span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">{selectedGrievance.category} Issue</h2>
                    </div>
                    <button onClick={() => setSelectedGrievance(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 flex items-start gap-3">
                        <MapPin className="text-blue-600 mt-0.5" size={18} />
                        <div>
                            <p className="text-xs font-bold text-blue-800 uppercase">Location</p>
                            <p className="text-sm font-medium text-slate-700">{selectedGrievance.area}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Description</p>
                        <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                            &ldquo;{selectedGrievance.description}&rdquo;
                        </p>
                    </div>
                    {selectedGrievance.explanation && (
                         <div>
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                                <Activity size={12}/> Analysis
                            </p>
                            <div className="text-sm text-slate-600 italic border-l-2 border-purple-400 pl-3">
                                {selectedGrievance.explanation}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
                    <button 
                        onClick={() => setSelectedGrievance(null)}
                        className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        Close
                    </button>
                    
                    {selectedGrievance.status === 'Pending' ? (
                        <button 
                            onClick={() => handleResolve(selectedGrievance._id)}
                            disabled={resolvingId === selectedGrievance._id}
                            className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                        >
                            {resolvingId === selectedGrievance._id ? <Loader2 className="animate-spin" size={16}/> : <CheckCircle2 size={16}/>}
                            {resolvingId === selectedGrievance._id ? "Updating..." : "Mark as Resolved"}
                        </button>
                    ) : (
                        <button disabled className="px-4 py-2 text-sm font-bold text-green-700 bg-green-100 rounded-lg border border-green-200 flex items-center gap-2 opacity-100">
                            <CheckCircle2 size={16}/> Issue Resolved
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}

    </div>
  );
}