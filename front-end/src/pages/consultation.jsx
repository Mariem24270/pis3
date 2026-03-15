import React, { useState, useEffect, useMemo } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Camera, FileText, Calendar as CalIcon,
  Clock, X, Users, ShieldCheck, Wallet, Search, CheckCircle,
} from "lucide-react";

const API_BASE_URL   = "http://127.0.0.1:8000/api";
const MEDIA_BASE_URL = "http://127.0.0.1:8000";

/* ══════════════════════════════════════════════
   TIMER
══════════════════════════════════════════════ */
const CountdownTimer = ({ initialMinutes, onExpire }) => {
  const [seconds, setSeconds] = useState(initialMinutes * 60);
  useEffect(() => {
    if (seconds <= 0) { onExpire(); return; }
    const t = setInterval(() => setSeconds(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [seconds, onExpire]);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-[#1a365d] rounded-full text-xs font-medium border border-[#2b6cb0]/20">
      <div className="w-1.5 h-1.5 bg-[#1a365d] rounded-full animate-pulse"/>
      {m}:{s < 10 ? `0${s}` : s}
    </div>
  );
};

/* ══════════════════════════════════════════════
   DOCTOR CARD
══════════════════════════════════════════════ */
function DoctorCard({ doctor, consultations, onBookingSuccess }) {
  const [selectedDate,  setSelectedDate]  = useState(null);
  const [selectedSlot,  setSelectedSlot]  = useState(null);
  const [isModalOpen,   setIsModalOpen]   = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [nomComplet,    setNomComplet]     = useState("");
  const [phone,         setPhone]         = useState("");
  const [fileNNI,       setFileNNI]       = useState(null);
  const [filePaiement,  setFilePaiement]  = useState(null);

  // ✅ État de confirmation — remplace alert()
  const [confirmed,     setConfirmed]     = useState(false);
  const [errorMsg,      setErrorMsg]      = useState("");

  const dailySlots = useMemo(() => {
    if (!selectedDate) return [];
    return consultations.filter(c =>
      c.doctor_name === doctor.doctor_name &&
      new Date(c.date_fin).toDateString() === selectedDate.toDateString()
    );
  }, [selectedDate, consultations, doctor.doctor_name]);

  const handleOpenBooking = () => { if (selectedSlot) { setConfirmed(false); setErrorMsg(""); setIsModalOpen(true); } };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fileNNI || !filePaiement) { setErrorMsg("Veuillez charger les deux documents requis."); return; }
    setLoading(true);
    setErrorMsg("");
    const data = new FormData();
    data.append("nomComplet_patient", nomComplet);
    data.append("numero_tel_patient", phone);
    data.append("photo_nni",          fileNNI);
    data.append("capture_paiement",   filePaiement);
    try {
      const res    = await fetch(`${API_BASE_URL}/pay-consultation/${selectedSlot.id}/`, { method:"POST", body:data, credentials:"include" });
      const result = await res.json();
      if (res.ok && (result.ok || result.status === "success")) {
        setConfirmed(true); // ✅ Affiche l'écran de succès
        onBookingSuccess();
      } else {
        setErrorMsg(result.error || result.message || "Erreur lors de la validation du paiement.");
      }
    } catch { setErrorMsg("Erreur de connexion au serveur."); }
    finally { setLoading(false); }
  };

  const closeModal = () => { setIsModalOpen(false); setConfirmed(false); setErrorMsg(""); };

  return (
    <div className="bg-white rounded-3xl border border-[#2b6cb0]/20 shadow-lg p-6 mb-6 transition hover:shadow-xl">
      <div className="flex flex-col lg:flex-row gap-8">

        {/* ── Infos docteur ── */}
        <div className="lg:w-1/4 text-center lg:text-left">
          <div className="relative inline-block mb-4">
            <img
              src={doctor.doctor_photo
                ? (doctor.doctor_photo.startsWith("http") ? doctor.doctor_photo : `${MEDIA_BASE_URL}${doctor.doctor_photo}`)
                : "https://via.placeholder.com/150"}
              className="w-24 h-24 rounded-2xl object-cover ring-4 ring-[#2b6cb0]/20"
              alt={doctor.doctor_name}
            />
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1.5 rounded-xl border-2 border-white shadow">
              <ShieldCheck size={16}/>
            </div>
          </div>
          <h2 className="text-lg font-semibold text-[#1a365d]">{doctor.doctor_name}</h2>
          <p className="text-[#2b6cb0] text-xs uppercase tracking-wide mt-1">{doctor.doctor_specialite}</p>
          <div className="mt-6 space-y-2 text-xs text-gray-500">
            <div className="flex items-center gap-2"><Wallet size={14} className="text-[#2b6cb0]"/> Bankily / Masrivi</div>
            <div className="flex items-center gap-2"><Users  size={14} className="text-[#2b6cb0]"/> Places limitées</div>
          </div>
        </div>

        {/* ── Calendrier & créneaux ── */}
        <div className="lg:flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="custom-calendar-container">
            <p className="text-xs font-medium text-[#1a365d] uppercase tracking-wide mb-3 flex items-center gap-1">
              <CalIcon size={14}/> 1. Date
            </p>
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileClassName={({ date }) =>
                consultations.some(c =>
                  c.doctor_name === doctor.doctor_name &&
                  new Date(c.date_fin).toDateString() === date.toDateString()
                ) ? "has-avail" : null
              }
            />
          </div>

          <div className="flex flex-col">
            <p className="text-xs font-medium text-[#1a365d] uppercase tracking-wide mb-3 flex items-center gap-1">
              <Clock size={14}/> 2. Créneaux
            </p>
            <div className="space-y-2 overflow-y-auto max-h-[240px] pr-1">
              {dailySlots.map(s => (
                <button key={s.id} onClick={() => setSelectedSlot(s)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition ${
                    selectedSlot?.id === s.id
                      ? "bg-[#1a365d] border-[#1a365d] text-white"
                      : "bg-[#e6f0fa] border-[#2b6cb0]/20 hover:bg-[#d4e4f5]"
                  }`}>
                  <span className="font-medium text-sm">
                    {new Date(s.date_fin).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-lg ${
                    selectedSlot?.id === s.id ? "bg-[#2b6cb0]" : "bg-white text-[#1a365d] border border-[#2b6cb0]/30"
                  }`}>
                    {s.n_places||"5"} pl.
                  </span>
                </button>
              ))}
              {dailySlots.length === 0 && <p className="text-center py-6 text-gray-400 text-sm">Aucun créneau</p>}
            </div>
            <button disabled={!selectedSlot} onClick={handleOpenBooking}
              className="mt-4 w-full bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] text-white py-3 rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-30 transition shadow-sm">
              Réserver
            </button>
          </div>
        </div>
      </div>

      {/* ══ MODAL ══ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden" style={{ animation:"slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}>

            {/* ── VUE SUCCÈS ── */}
            {confirmed ? (
              <div className="flex flex-col items-center text-center px-8 py-10">
                {/* Cercle animé */}
                <div style={{ width:"80px", height:"80px", borderRadius:"50%", background:"linear-gradient(135deg,#d1fae5,#a7f3d0)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"20px", boxShadow:"0 8px 30px rgba(16,185,129,0.25)", animation:"popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}>
                  <CheckCircle size={40} color="#059669" strokeWidth={2}/>
                </div>

                <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Réservation confirmée !</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-2">
                  Votre dossier a été transmis avec succès.
                </p>

                {/* Infos séance */}
                <div className="w-full bg-slate-50 rounded-2xl p-4 mb-6 text-left">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-[#1a365d] flex items-center justify-center flex-shrink-0">
                      <ShieldCheck size={16} color="white"/>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Médecin</p>
                      <p className="text-sm font-bold text-slate-800">{doctor.doctor_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#2b6cb0] flex items-center justify-center flex-shrink-0">
                      <CalIcon size={16} color="white"/>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Date & Heure</p>
                      <p className="text-sm font-bold text-slate-800">
                        {selectedSlot && new Date(selectedSlot.date_fin).toLocaleString("fr-FR", { day:"numeric", month:"long", hour:"2-digit", minute:"2-digit" })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Message WhatsApp */}
                <div className="w-full flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-6 text-left">
                  <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background:"#25D366" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-800 mb-0.5">Confirmation WhatsApp</p>
                    <p className="text-xs text-emerald-600 leading-relaxed">Un message de confirmation sera envoyé sur votre WhatsApp après vérification par le secrétaire.</p>
                  </div>
                </div>

                <button onClick={closeModal}
                  className="w-full py-3.5 bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] text-white rounded-2xl font-bold text-sm hover:opacity-90 transition shadow-lg">
                  Fermer
                </button>
              </div>

            ) : (
              /* ── VUE FORMULAIRE ── */
              <>
                {/* Header */}
                <div className="relative p-5 bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <CountdownTimer initialMinutes={5} onExpire={closeModal}/>
                    <span className="text-xs text-blue-200">Sécurisé</span>
                  </div>
                  <button onClick={closeModal} className="p-1.5 hover:bg-white/20 rounded-lg">
                    <X size={18} className="text-white"/>
                  </button>
                </div>

                <div className="p-5">
                  <p className="text-sm text-gray-400 mb-4 font-medium">
                    {selectedSlot && new Date(selectedSlot.date_fin).toLocaleString("fr-FR", { day:"numeric", month:"long", year:"numeric", hour:"2-digit", minute:"2-digit" })}
                  </p>

                  {/* Message d'erreur stylisé */}
                  {errorMsg && (
                    <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl p-3 mb-4">
                      <X size={16} className="text-red-500 flex-shrink-0"/>
                      <p className="text-xs text-red-600 font-medium">{errorMsg}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      <input type="text" placeholder="Nom complet" required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2b6cb0]/30 focus:border-[#2b6cb0] transition"
                        onChange={e => setNomComplet(e.target.value)}/>
                      <input type="tel" placeholder="Téléphone (WhatsApp)" required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2b6cb0]/30 focus:border-[#2b6cb0] transition"
                        onChange={e => setPhone(e.target.value)}/>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <label className={`flex flex-col items-center p-4 border-2 border-dashed rounded-2xl cursor-pointer transition ${fileNNI ? "bg-blue-50 border-[#2b6cb0]" : "border-gray-200 hover:border-[#2b6cb0]/40 hover:bg-blue-50/30"}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${fileNNI ? "bg-[#1a365d]" : "bg-gray-100"}`}>
                          <Camera size={18} color={fileNNI ? "white" : "#9ca3af"}/>
                        </div>
                        <span className="text-[10px] font-bold text-center leading-tight" style={{ color: fileNNI ? "#1a365d" : "#9ca3af" }}>
                          {fileNNI ? "✓ NNI ajouté" : "Photo NNI"}
                        </span>
                        <input type="file" className="hidden" accept="image/*" required onChange={e => setFileNNI(e.target.files[0])}/>
                      </label>

                      <label className={`flex flex-col items-center p-4 border-2 border-dashed rounded-2xl cursor-pointer transition ${filePaiement ? "bg-blue-50 border-[#2b6cb0]" : "border-gray-200 hover:border-[#2b6cb0]/40 hover:bg-blue-50/30"}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${filePaiement ? "bg-[#1a365d]" : "bg-gray-100"}`}>
                          <FileText size={18} color={filePaiement ? "white" : "#9ca3af"}/>
                        </div>
                        <span className="text-[10px] font-bold text-center leading-tight" style={{ color: filePaiement ? "#1a365d" : "#9ca3af" }}>
                          {filePaiement ? "✓ Reçu ajouté" : "Reçu Bankily"}
                        </span>
                        <input type="file" className="hidden" accept="image/*" required onChange={e => setFilePaiement(e.target.files[0])}/>
                      </label>
                    </div>

                    {/* Montant */}
                    <div className="bg-gradient-to-r from-[#1a365d]/8 to-[#2b6cb0]/8 p-4 rounded-2xl flex items-center gap-3 border border-[#2b6cb0]/15">
                      <div className="bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] p-2.5 rounded-xl text-white flex-shrink-0">
                        <Wallet size={18}/>
                      </div>
                      <div>
                        <p className="text-xs text-[#2b6cb0] font-semibold">Montant à payer</p>
                        <p className="text-xl font-black text-[#1a365d]">{selectedSlot?.montant||"500"} <span className="text-sm font-semibold">MRU</span></p>
                      </div>
                    </div>

                    <button type="submit" disabled={loading}
                      className="w-full py-3.5 bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] text-white rounded-2xl font-bold hover:opacity-90 disabled:opacity-50 text-sm shadow-lg transition flex items-center justify-center gap-2">
                      {loading
                        ? <><div style={{ width:"16px", height:"16px", border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"white", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/> Traitement...</>
                        : "Confirmer la réservation"
                      }
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   PAGE PRINCIPALE
══════════════════════════════════════════════ */
export default function Consultation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { doctorName, filterDoctor } = location.state || {};

  const [consultations, setConsultations] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [searchTerm, setSearchTerm] = useState(
    (filterDoctor === true && doctorName) ? doctorName : ""
  );

  useEffect(() => {
    fetch(`${API_BASE_URL}/consultations/`)
      .then(res => res.json())
      .then(result => {
        const data = result.data || result;
        if (Array.isArray(data))
          setConsultations(data.sort((a, b) => new Date(a.date_fin) - new Date(b.date_fin)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const doctors = useMemo(() => {
    const map = new Map();
    consultations.forEach(c => {
      const match =
        c.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.doctor_specialite?.toLowerCase().includes(searchTerm.toLowerCase());
      if (match && !map.has(c.doctor_name)) {
        map.set(c.doctor_name, {
          doctor_name:       c.doctor_name,
          doctor_specialite: c.doctor_specialite,
          doctor_photo:      c.doctor_photo || c.photo,
        });
      }
    });
    return Array.from(map.values());
  }, [consultations, searchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6f0fa] to-white py-12 px-4">
      <div className="max-w-5xl mx-auto">

        <header className="mb-10 text-center">
          <h1 className="text-3xl font-light text-[#1a365d] tracking-tight">e-santé Mauritanie</h1>
          <p className="text-[#2b6cb0]/70 text-sm mt-2 max-w-xl mx-auto">
            Consultation médicale à distance. Choisissez votre spécialiste et réservez en ligne.
          </p>
        </header>

        {filterDoctor && doctorName && (
          <div className="flex items-center gap-3 bg-white border border-[#2b6cb0]/30 rounded-2xl px-5 py-3 mb-6 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-[#2b6cb0] animate-pulse flex-shrink-0"/>
            <p className="text-sm font-semibold text-[#1a365d] flex-1">
              Séances disponibles pour <span className="text-[#2b6cb0]">{doctorName}</span>
            </p>
            <button
              onClick={() => { setSearchTerm(""); navigate("/consultation", { replace:true, state:{} }); }}
              className="flex items-center gap-1.5 text-xs font-bold text-[#2b6cb0] hover:text-[#1a365d] transition-colors bg-[#e6f0fa] px-3 py-1.5 rounded-full"
            >
              <X size={12}/> Voir tous
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#2b6cb0]/30 border-t-[#1a365d] rounded-full animate-spin"/>
          </div>
        ) : (
          <div className="space-y-4">
            {doctors.length > 0 ? (
              doctors.map(doc => (
                <DoctorCard key={doc.doctor_name} doctor={doc} consultations={consultations} onBookingSuccess={() => {
  fetch(`${API_BASE_URL}/consultations/`)
    .then(res => res.json())
    .then(result => {
      const data = result.data || result;
      if (Array.isArray(data))
        setConsultations(data.sort((a, b) => new Date(a.date_fin) - new Date(b.date_fin)));
    });
}}/>
              ))
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-[#2b6cb0]/20">
                <p className="text-[#2b6cb0]/60 text-sm font-medium">Aucun médecin trouvé</p>
                <button onClick={() => setSearchTerm("")} className="mt-3 text-xs text-[#2b6cb0] font-bold underline">Effacer la recherche</button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(24px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes popIn   { from { transform: scale(0.5); opacity:0; } to { transform: scale(1); opacity:1; } }
        @keyframes spin    { to { transform: rotate(360deg); } }
        .custom-calendar-container .react-calendar { border:none; font-family:inherit; width:100%; background:transparent; }
        .custom-calendar-container .react-calendar__navigation button { font-size:0.75rem; color:#1a365d; }
        .custom-calendar-container .react-calendar__tile { padding:0.5rem; border-radius:0.5rem; font-size:0.75rem; color:#6b7280; }
        .custom-calendar-container .has-avail { background:#d4e4f5 !important; color:#1a365d !important; font-weight:500; }
        .custom-calendar-container .react-calendar__tile--active { background:#2b6cb0 !important; color:white !important; }
      `}</style>
    </div>
  );
}