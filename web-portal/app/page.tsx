import Link from "next/link";
import { Shield, User, ArrowRight, Mic, Camera, MapPin, LayoutDashboard } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden font-sans selection:bg-blue-100">
      
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-3xl opacity-60" />
        <div className="absolute top-[20%] -left-[10%] w-[400px] h-[400px] bg-indigo-100/40 rounded-full blur-3xl opacity-60" />
      </div>

      <nav className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center animate-in fade-in slide-in-from-top-4">
        <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-600/20">
                <Shield className="text-white w-6 h-6" />
            </div>
            <div className="flex flex-col">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">Civic<span className="text-blue-600">Connect</span></h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Kakinada Municipal Corp</p>
            </div>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center max-w-5xl mx-auto mt-8 md:mt-0 pb-20">
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-600 font-bold text-xs mb-8 shadow-sm hover:shadow-md transition-shadow cursor-default animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            System Operational
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          Smart Civic <br className="hidden md:block" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Grievance Portal
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 mb-12 max-w-2xl font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          Report civic issues instantly using voice, image, and text. 
          Help us make <span className="text-slate-900 font-semibold underline decoration-blue-300 decoration-2 underline-offset-2">Kakinada</span> cleaner, safer, and smarter.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <Link 
            href="/login" 
            className="group relative w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl hover:shadow-slate-900/20 transition-all hover:-translate-y-1 overflow-hidden"
          >
             <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
             <User className="w-5 h-5" /> 
             <span>Citizen Login</span>
             <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link 
            href="/admin/login" 
            className="group w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all"
          >
             <LayoutDashboard className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
             <span>Admin Portal</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full text-left animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
            <FeatureCard 
                icon={<Mic className="w-6 h-6 text-purple-600"/>}
                bg="bg-purple-50"
                title="Voice Reporting"
                desc="Just speak your complaint. The system captures and processes it instantly."
            />
             <FeatureCard 
                icon={<Camera className="w-6 h-6 text-green-600"/>}
                bg="bg-green-50"
                title="Photo Evidence"
                desc="Upload photos. We verify location and authenticity automatically."
            />
             <FeatureCard 
                icon={<MapPin className="w-6 h-6 text-red-600"/>}
                bg="bg-red-50"
                title="Hotspot Map"
                desc="Real-time heatmap of critical issues for faster municipal response."
            />
        </div>

      </main>

      <footer className="relative z-10 py-8 text-center border-t border-slate-200 bg-white/50 backdrop-blur-sm">
        <p className="text-slate-500 text-sm font-semibold">© 2024 Kakinada Municipal Corporation</p>
        <p className="text-xs text-slate-400 mt-1">Empowering Citizens with Technology</p>
      </footer>

    </div>
  );
}

function FeatureCard({ icon, bg, title, desc }: { icon: React.ReactNode, bg: string, title: string, desc: string }) {
    return (
        <div className="group p-6 bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300">
            <div className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                {icon}
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">{title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
        </div>
    )
}