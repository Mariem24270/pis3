import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, MEDIA_BASE_URL } from "../api/config";
import { 
  Activity, LogOut, LayoutDashboard, Search, History, 
  CheckCircle, Clock, X, User, Menu, ChevronRight, CalendarDays
} from "lucide-react";

function EspaceDocteurLocal() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [patients, setPatients] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [recherche, setRecherche] = useState("");
  const [patientSelectionne, setPatientSelectionne] = useState(null);
  const [notesTemp, setNotesTemp] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const navigate = useNavigate();
  const token = localStorage.getItem("token") || localStorage.getItem("accessToken");

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    const loadData = async () => {
      try {
        const profRes = await fetch(`${API_BASE_URL}/me/`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const profData = await profRes.json();
        setDoctorProfile(profData.profile || null);
        
        const patRes = await fetch(`${API_BASE_URL}/consultations-payees/`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const patData = await patRes.json();
        const liste = Array.isArray(patData) ? patData : (patData.results || []);
        
        // Sécurité : Vérification de l'ID avant filtrage
        if (profData.profile?.id) {
            setPatients(liste.filter(p => String(p.doctor) === String(profData.profile.id)));
        }
      } catch (err) { 
        console.error("Erreur de chargement des données", err);
      } finally { 
        setLoading(false); 
      }
    };
    loadData();
  }, [token, navigate]);

  const handleSave = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/consultations-payees/${patientSelectionne.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ diagnostic: notesTemp }),
      });
      if (res.ok) {
        setPatients(prev => prev.map(p => p.id === patientSelectionne.id ? {...p, diagnostic: notesTemp} : p));
        setPatientSelectionne(null);
      }
    } catch (e) { alert("Erreur lors de l'enregistrement"); }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="flex flex-col items-center gap-4">
        <Activity className="text-indigo-600 animate-bounce" size={40} />
        <span className="text-[10px] font-black tracking-[0.5em] text-slate-400">INITIALISATION...</span>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F1F4F9] font-sans text-slate-900 overflow-hidden">
      
      {/* SIDEBAR RESPONSIVE (CHAMBRE) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0B0D11] transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 mb-12 px-2">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
              <Activity size={20} className="text-white"/>
            </div>
            <span className="text-white font-black tracking-tighter text-xl italic uppercase">MauriSanté</span>
          </div>

          <nav className="flex-1 space-y-3">
            <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-4 px-2">Menu Principal</p>
            <button onClick={() => {setActiveTab("dashboard"); setIsSidebarOpen(false);}} className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-[11px] font-bold transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              <div className="flex items-center gap-3"><LayoutDashboard size={18} /> DASHBOARD</div>
              <ChevronRight size={14} className={activeTab === 'dashboard' ? 'opacity-100' : 'opacity-0'} />
            </button>
            <button onClick={() => {setActiveTab("historique"); setIsSidebarOpen(false);}} className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-[11px] font-bold transition-all ${activeTab === 'historique' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              <div className="flex items-center gap-3"><History size={18} /> HISTORIQUE</div>
              <ChevronRight size={14} className={activeTab === 'historique' ? 'opacity-100' : 'opacity-0'} />
            </button>
          </nav>

          <button onClick={() => {localStorage.clear(); navigate("/login");}} className="flex items-center gap-3 px-4 py-4 text-rose-500 text-[11px] font-black uppercase tracking-widest hover:bg-rose-500/10 rounded-2xl transition-all mt-auto border border-white/5">
            <LogOut size={18} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* HEADER RESPONSIVE */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 lg:px-10 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-600 bg-slate-100 rounded-lg">
              <Menu size={20} />
            </button>
            <h1 className="text-sm lg:text-lg font-black text-slate-800 tracking-tight hidden sm:block uppercase italic">
              Dr. {doctorProfile?.user?.username || "Médecin"}
            </h1>
          </div>

          <div className="relative flex-1 max-w-xs lg:max-w-md mx-4 group">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500" />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="w-full py-2.5 pl-10 pr-4 bg-slate-100/50 border-none rounded-xl text-[11px] font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all"
              onChange={(e) => setRecherche(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-50 rounded-xl overflow-hidden border-2 border-white shadow-sm flex items-center justify-center font-bold text-indigo-600">
                {doctorProfile?.photo ? <img src={`${MEDIA_BASE_URL}${doctorProfile.photo}`} className="w-full h-full object-cover" /> : <User size={20}/>}
             </div>
          </div>
        </header>

        {/* ZONE DE SCROLL */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          
          {activeTab === "dashboard" && (
            <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <CalendarDays size={18} className="text-indigo-600" />
                  <h2 className="text-xs lg:text-sm font-black uppercase tracking-widest text-slate-500">File d'attente active</h2>
                </div>
                <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] font-black text-slate-400 shadow-sm uppercase tracking-tighter">
                  {patients.filter(p => !p.diagnostic).length} en attente
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {patients.filter(p => !p.diagnostic && p.nom_complet.toLowerCase().includes(recherche.toLowerCase())).map(p => (
                  <div key={p.id} className="bg-white p-6 rounded-[2rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)] transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 bg-slate-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                        {p.nom_complet.charAt(0)}
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Date Réservation</p>
                        <p className="text-[10px] font-bold text-slate-600 mt-0.5">{new Date().toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                    
                    <h3 className="font-black text-slate-800 uppercase text-xs tracking-tight mb-1">{p.nom_complet}</h3>
                    <p className="text-[10px] text-indigo-500 font-bold tracking-widest mb-6 uppercase">NNI: {p.NNI}</p>

                    <button onClick={() => { setPatientSelectionne(p); setNotesTemp(""); }} className="w-full py-3.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-lg active:scale-95">
                       Démarrer Soin
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "historique" && (
            <div className="bg-white rounded-[2.5rem] p-6 lg:p-10 shadow-sm border border-white animate-in zoom-in-95 duration-500">
               <div className="flex items-center gap-3 mb-10 border-b border-slate-50 pb-6">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-sm"><CheckCircle size={20}/></div>
                  <h2 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em]">Archives Médicales</h2>
               </div>
               
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                 {patients.filter(p => p.diagnostic && p.nom_complet.toLowerCase().includes(recherche.toLowerCase())).map(p => (
                   <div key={p.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white transition-all">
                      <div className="flex-1">
                         <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{p.nom_complet}</p>
                         <div className="mt-2 p-3 bg-white/80 rounded-lg text-[10px] text-slate-500 italic border border-slate-100">
                            "{p.diagnostic}"
                         </div>
                      </div>
                      <div className="text-right min-w-[100px]">
                         <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-tighter">Terminé</span>
                         <p className="text-[9px] text-slate-300 font-bold mt-2 uppercase">{new Date().toLocaleDateString()}</p>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          )}
        </div>
      </main>

      {/* OVERLAY SIDEBAR MOBILE */}
      {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300" />}

      {/* MODAL RESPONSIVE */}
      {patientSelectionne && (
        <div className="fixed inset-0 bg-[#0F172A]/70 backdrop-blur-md z-[100] flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-white">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                <div>
                   <h2 className="text-base font-black text-slate-800 uppercase tracking-tighter italic">{patientSelectionne.nom_complet}</h2>
                   <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest mt-1">Examen en cours</p>
                </div>
                <button onClick={() => setPatientSelectionne(null)} className="p-3 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-all text-slate-400"><X size={20}/></button>
            </div>
            <div className="p-8">
              <textarea 
                value={notesTemp} 
                onChange={(e) => setNotesTemp(e.target.value)} 
                className="w-full h-44 p-6 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-xs font-semibold text-slate-700 focus:bg-white focus:border-indigo-300 transition-all mb-6 shadow-inner" 
                placeholder="Rédigez le diagnostic ici..." 
              />
              <button onClick={handleSave} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95">
                Valider & Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EspaceDocteurLocal;