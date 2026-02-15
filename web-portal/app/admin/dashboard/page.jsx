"use client";

import { useEffect, useState } from "react";
import {
  LayoutDashboard, CheckCircle2, Clock, Flame,
  ArrowUpDown, Calendar, Siren, X, MapPin, Activity, Loader2,
  LogOut, Trash2, Image as ImageIcon, Volume2, AlertOctagon, Ban
} from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import AdminProtected from "./AdminProtected";

const GrievanceMap = dynamic(
  () => import("@/components/GrievanceMap"),
  { ssr: false }
);

export default function AdminDashboard() {
  const router = useRouter(); 
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter & UI States
  const [activeFilter, setActiveFilter] = useState("All"); 
  const [isSmartSort, setIsSmartSort] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [resolvingId, setResolvingId] = useState(null);
  
  // 🔍 NEW: Image Zoom State
  const [viewingImage, setViewingImage] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/grievances")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setGrievances(data.data);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);

  // --- ACTIONS ---

  const handleResolve = async (id) => {
    const reply = window.prompt("Enter a reply for the citizen:", "Your issue has been resolved successfully.");
    if (reply === null) return;

    setResolvingId(id);
    try {
        const res = await fetch(`http://localhost:5000/api/grievances/${id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem("adminToken")}` // Send Token
            },
            body: JSON.stringify({ 
                status: 'Resolved',
                adminReply: reply,
                estimatedTime: 'Completed'
            })
        });
        const data = await res.json();
        if (data.success) {
            setGrievances(prev => prev.map(g => g._id === id ? { ...g, status: 'Resolved', adminReply: reply } : g));
            if (selectedGrievance && selectedGrievance._id === id) {
                setSelectedGrievance({ ...selectedGrievance, status: 'Resolved', adminReply: reply });
            }
            alert("✅ Issue marked as Resolved!");
        } else {
            alert("❌ Server Error: " + (data.error || "Unknown error"));
        }
    } catch (error) {
        alert("❌ Network Error.");
    } finally {
        setResolvingId(null);
    }
  };

  // 🚫 MARK AS SPAM
  const handleSpam = async (id) => {
    if(!window.confirm("Are you sure you want to mark this report as SPAM? It will be moved to the Spam Folder.")) return;

    try {
        const res = await fetch(`http://localhost:5000/api/grievances/${id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem("adminToken")}`
            },
            body: JSON.stringify({ status: 'Spam' }) 
        });
        
        if (res.ok) {
            setGrievances(prev => prev.map(g => g._id === id ? { ...g, status: 'Spam' } : g));
            setSelectedGrievance(null); // Close popup
            alert("⚠️ Moved to Spam Folder");
        }
    } catch (err) {
        alert("Action Failed");
    }
  };

  // 🗑️ PERMANENT DELETE (For Spam)
  const handleDelete = async (id) => {
    if(!window.confirm("⚠️ PERMANENT DELETE: This cannot be undone. Delete this record?")) return;

    try {
        const res = await fetch(`http://localhost:5000/api/grievances/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem("adminToken")}` }
        });

        if (res.ok) {
            setGrievances(prev => prev.filter(g => g._id !== id));
            alert("🗑️ Record Deleted Permanently");
        }
    } catch (err) {
        alert("Delete Failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken"); 
    router.push("/"); 
  };

  // --- FILTERING LOGIC ---
  const getFilteredGrievances = () => {
    let filtered = grievances;

    if (activeFilter === "Spam") {
        return grievances.filter(g => g.status === 'Spam');
    }

    // Hide Spam from main views
    filtered = filtered.filter(g => g.status !== 'Spam');

    if (activeFilter !== "All") {
        if (activeFilter === "Pending" || activeFilter === "Resolved") {
            filtered = filtered.filter(g => g.status === activeFilter);
        } else {
            filtered = filtered.filter(g => g.priority === activeFilter);
        }
    }

    if (isSmartSort) {
      const priorityWeight = { "Immediate": 4, "High": 3, "Medium": 2, "Low": 1 };
      return filtered.sort((a, b) => {
        const getScore = (g) => g.status === 'Resolved' ? -1 : (priorityWeight[g.priority] || 0);
        return getScore(b) - getScore(a);
      });
    } else {
      return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  };

  const displayList = getFilteredGrievances();
  const count = (key, val) => grievances.filter(g => g[key] === val && g.status !== 'Spam').length;

  return (
    <AdminProtected>
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
            {/* SPAM BUTTON */}
            <button 
                onClick={() => setActiveFilter("Spam")} 
                className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-colors border ${activeFilter === 'Spam' ? 'bg-red-600 text-white border-red-600' : 'text-slate-600 bg-slate-100 hover:bg-slate-200 border-slate-200'}`}
            >
                <Ban size={18} /> Spam ({grievances.filter(g => g.status === 'Spam').length})
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 rounded-lg transition-colors border border-slate-200">
                <LogOut size={18} /> Logout
            </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">

        {/* Filters (Hidden if viewing Spam) */}
        {activeFilter !== 'Spam' && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                <button onClick={() => setActiveFilter("All")} className={`p-4 rounded-xl border text-left transition-all hover:scale-105 shadow-sm ${activeFilter==="All" ? "bg-white border-blue-500 ring-2 ring-blue-500/10" : "bg-white border-slate-200 hover:border-blue-400"}`}>
                    <div className="text-slate-500 text-[10px] font-bold uppercase mb-1">Total Active</div>
                    <div className="text-2xl font-bold text-slate-900">{grievances.filter(g => g.status !== 'Spam').length}</div>
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
        )}

        {/* Spam Warning Header */}
        {activeFilter === 'Spam' && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-center gap-3 text-red-800 animate-in fade-in">
                <AlertOctagon size={24} />
                <div>
                    <h3 className="font-bold">Spam Folder</h3>
                    <p className="text-sm">These reports are hidden from the main dashboard. You can permanently delete them here.</p>
                </div>
                <button onClick={() => setActiveFilter("All")} className="ml-auto text-sm font-bold bg-white px-3 py-1.5 rounded border border-red-200 hover:bg-red-100">Go Back</button>
            </div>
        )}

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
                {/* Don't show Spam on Map usually, but filtered list is passed so it's handled */}
                <GrievanceMap grievances={displayList} />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-125">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur sticky top-0 rounded-t-2xl z-10">
                    <h3 className="font-bold flex items-center gap-2 text-slate-700">
                        {isSmartSort ? <ArrowUpDown size={16} className="text-purple-600"/> : <Calendar size={16} className="text-blue-600"/>}
                        {activeFilter === 'Spam' ? "Junk Reports" : "Recent Reports"}
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
                                g.status === 'Spam' ? 'bg-red-50 border-red-100 opacity-75' :
                                g.priority === 'Immediate' ? 'bg-purple-50 border-purple-200' : 'bg-white border-slate-100 hover:border-slate-300'
                            }`}>
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                        g.status === 'Resolved' ? 'bg-green-100 text-green-700 border border-green-200' :
                                        g.status === 'Spam' ? 'bg-red-100 text-red-700 border border-red-200' :
                                        g.priority === 'Immediate' ? 'bg-purple-600 text-white shadow-purple-200 shadow-lg' :
                                        g.priority === 'High' ? 'bg-red-100 text-red-700 border border-red-200' :
                                        'bg-blue-50 text-blue-600 border border-blue-100'
                                    }`}>
                                        {g.status === 'Resolved' ? <CheckCircle2 size={8}/> : g.status === 'Spam' ? <Ban size={8}/> : g.priority === 'Immediate' && <Siren size={8}/>}
                                        {g.status === 'Resolved' ? 'Resolved' : g.status === 'Spam' ? 'SPAM' : g.priority}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                        {new Date(g.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' })}
                                    </span>
                                </div>
                                <h4 className="font-bold text-sm text-slate-800">{g.category} Issue</h4>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{g.description}</p>
                                <div className="mt-3 flex justify-between items-center">
                                    <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded">📍 {g.area}</span>
                                    
                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        {activeFilter === 'Spam' && (
                                            <button onClick={() => handleDelete(g._id)} className="text-[10px] font-bold text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors border border-red-100">
                                                DELETE
                                            </button>
                                        )}
                                        <button onClick={() => setSelectedGrievance(g)} className="text-[10px] font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors">
                                            VIEW &rarr;
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* VIEW DETAILS POPUP */}
      {selectedGrievance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50 sticky top-0 z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                             <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                selectedGrievance.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                                selectedGrievance.status === 'Spam' ? 'bg-red-100 text-red-700' :
                                'bg-blue-100 text-blue-700'
                            }`}>
                                {selectedGrievance.status}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">#{selectedGrievance._id.slice(-6)}</span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">{selectedGrievance.category} Issue</h2>
                        <div className="text-xs text-slate-500 font-medium mt-1">Submitted by: {selectedGrievance.citizenName || "Anonymous"}</div>
                        <div className="text-xs text-slate-400">{selectedGrievance.userEmail}</div>
                    </div>
                    <button onClick={() => setSelectedGrievance(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Location */}
                    <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 flex items-start gap-3">
                        <MapPin className="text-blue-600 mt-0.5" size={18} />
                        <div>
                            <p className="text-xs font-bold text-blue-800 uppercase">Location</p>
                            <p className="text-sm font-medium text-slate-700">{selectedGrievance.area}</p>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Description</p>
                        <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-wrap">
                            {selectedGrievance.description}
                        </p>
                    </div>

                    {/* Evidence */}
                    {(selectedGrievance.imageUrl || selectedGrievance.audioUrl) && (
                        <div className="border-t border-slate-100 pt-4">
                            <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">Evidence Attached</h4>
                            <div className="grid grid-cols-1 gap-4">
                                {selectedGrievance.imageUrl && (
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><ImageIcon size={12}/> Photo Evidence</p>
                                        
                                        {/* 📸 CLICK TO ZOOM */}
                                        <div 
                                            className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm cursor-zoom-in group"
                                            onClick={() => setViewingImage(`http://localhost:5000/${selectedGrievance.imageUrl}`)}
                                        >
                                            <img 
                                                /* Check if it's a full URL (Cloudinary) or relative path (Local) */
                                                src={selectedGrievance.imageUrl.startsWith('http') ? selectedGrievance.imageUrl : `http://localhost:5000/${selectedGrievance.imageUrl}`} 
                                                alt="Grievance Evidence" 
                                                className="w-full h-auto object-cover max-h-60 group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                                <span className="opacity-0 group-hover:opacity-100 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur">View Fullscreen</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {selectedGrievance.audioUrl && (
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><Volume2 size={12}/> Voice Note</p>
                                        <audio controls className="w-full h-10 rounded-lg shadow-sm">
                                            <source src={`http://localhost:5000/${selectedGrievance.audioUrl}`} type="audio/wav" />
                                        </audio>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center sticky bottom-0 z-10">
                    
                    {/* 🚫 SPAM BUTTON */}
                    {selectedGrievance.status !== 'Spam' && selectedGrievance.status !== 'Resolved' && (
                        <button 
                            onClick={() => handleSpam(selectedGrievance._id)}
                            className="px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200 flex items-center gap-2"
                        >
                            <Ban size={16}/> Mark as Spam
                        </button>
                    )}

                    <div className="flex gap-2 ml-auto">
                        <button 
                            onClick={() => setSelectedGrievance(null)}
                            className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                            Close
                        </button>
                        
                        {selectedGrievance.status === 'Pending' && (
                            <button 
                                onClick={() => handleResolve(selectedGrievance._id)}
                                disabled={resolvingId === selectedGrievance._id}
                                className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                            >
                                {resolvingId === selectedGrievance._id ? <Loader2 className="animate-spin" size={16}/> : <CheckCircle2 size={16}/>}
                                {resolvingId === selectedGrievance._id ? "Updating..." : "Resolve"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* 🖼️ FULL SCREEN IMAGE VIEWER */}
      {viewingImage && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 animate-in fade-in">
             <button 
                onClick={() => setViewingImage(null)}
                className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
             >
                <X size={24} />
             </button>
             <img 
                src={viewingImage} 
                alt="Full View" 
                className="max-w-full max-h-[90vh] rounded-lg shadow-2xl animate-in zoom-in-95"
             />
        </div>
      )}

     </div>
  </AdminProtected>
);
}