import React, { useState, useEffect, useMemo } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const API_BASE_URL = "http://127.0.0.1:8000/api"; 

function DoctorConsultationBlock({ doctorData, consultationsTemp, onBookingSuccess }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);

  const [formData, setFormData] = useState({
    nomComplet_patient: "",
    numero_tel_patient: "",
    photo_nni: null,
    capture_paiement: null,
  });

  const availableConsultations = useMemo(() => {
    if (!selectedDate) return [];
    return consultationsTemp.filter((c) => {
      const cDate = new Date(c.date_fin);
      return c.doctor_name === doctorData.doctor_name && cDate.toDateString() === selectedDate.toDateString();
    });
  }, [selectedDate, consultationsTemp, doctorData.doctor_name]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({ ...formData, [name]: type === "file" ? files[0] : value });
  };

  const handleOpenBooking = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/open-window/${selectedConsultation.id}/`, { method: "POST" });
      const result = await res.json();
      if (result.ok) {
        setPaymentInfo(result.data);
        setIsModalOpen(true);
      } else { alert(result.error); }
    } catch { alert("Erreur serveur"); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    data.append("nomComplet_patient", formData.nomComplet_patient);
    data.append("numero_tel_patient", formData.numero_tel_patient);
    data.append("photo_nni", formData.photo_nni);
    data.append("capture_paiement", formData.capture_paiement);

    try {
      const res = await fetch(`${API_BASE_URL}/pay-consultation/${selectedConsultation.id}/`, { method: "POST", body: data });
      const result = await res.json();
      if (result.ok) {
        alert("Réservation réussie !");
        setIsModalOpen(false);
        onBookingSuccess();
      } else { alert(result.error); }
    } catch { alert("Erreur d'envoi"); } finally { setLoading(false); }
  };

  return (
    <article className="relative grid grid-cols-1 lg:grid-cols-[0.8fr_2fr] gap-2 mb-6 overflow-hidden bg-white rounded-2xl shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300">
      {/* Badge disponibilité - Plus petit sur mobile */}
      <span className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold text-white shadow-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
        En ligne
      </span>

      {/* Bloc médecin - Compact */}
      <div className="flex flex-col items-center justify-center p-5 text-center bg-slate-50/50 border-b lg:border-b-0 lg:border-r border-slate-100">
        <div className="relative mb-3">
          <img
            src={doctorData.doctor_photo || "https://via.placeholder.com/150"}
            alt={doctorData.doctor_name}
            className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl object-cover ring-2 ring-white shadow-md"
          />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 leading-tight">{doctorData.doctor_name}</h2>
          <p className="mt-1 text-[11px] font-semibold text-sky-600 bg-sky-50 px-3 py-0.5 rounded-full inline-block ring-1 ring-sky-100">
            {doctorData.doctor_specialite}
          </p>
        </div>
        
        <div className="mt-4 w-full grid grid-cols-2 lg:grid-cols-1 gap-2">
            <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-100">
                <span className="text-[10px] text-slate-500 uppercase">Vidéo</span>
                <svg className="w-3 h-3 text-sky-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" /></svg>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-100">
                <span className="text-[10px] text-emerald-600 font-bold uppercase">Bankily</span>
                <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10v2a2 2 0 002 2h2a2 2 0 002-2V6a2 2 0 00-2-2h-2V3a1 1 0 10-2 0v1h-3V3a1 1 0 10-2 0v1H7V3a1 1 0 00-2 0v1H4z" clipRule="evenodd" /></svg>
            </div>
        </div>
      </div>

      {/* Calendrier + créneaux - Grid Responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 lg:p-6">
        {/* Partie Calendrier */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">1. Choisir la date</p>
          <div className="calendar-container rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-white">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileClassName={({ date }) => {
                const hasSlots = consultationsTemp.some(
                  (c) =>
                    c.doctor_name === doctorData.doctor_name &&
                    new Date(c.date_fin).toDateString() === date.toDateString() &&
                    c.n_places > 0
                );
                return hasSlots ? "react-calendar__tile--available" : "";
              }}
            />
          </div>
        </div>

        {/* Partie Créneaux */}
        <div className="flex flex-col h-full space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">2. Créneaux</p>
            {selectedDate && (
                <span className="text-[10px] font-bold text-sky-600">
                    {selectedDate.toLocaleDateString('fr-FR', {day:'numeric', month:'short'})}
                </span>
            )}
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto max-h-[220px] md:max-h-full pr-1 custom-scrollbar">
            {!selectedDate ? (
              <div className="h-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-100 py-8 px-4 text-center">
                <p className="text-xs text-slate-400">Sélectionnez une date</p>
              </div>
            ) : availableConsultations.length === 0 ? (
              <div className="h-full flex items-center justify-center p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                Aucun créneau disponible.
              </div>
            ) : (
              availableConsultations.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  disabled={c.n_places <= 0}
                  onClick={() => setSelectedConsultation(c)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                    selectedConsultation?.id === c.id
                      ? "border-sky-500 bg-sky-50 shadow-sm"
                      : "border-slate-50 bg-white hover:border-slate-200"
                  } ${c.n_places <= 0 ? "opacity-40" : "active:scale-95"}`}
                >
                  <span className="font-black text-slate-800 text-sm">
                    {new Date(c.date_fin).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className="text-xs font-bold text-sky-600">{c.montant} MRU</span>
                </button>
              ))
            )}
          </div>

          <button
            disabled={!selectedConsultation || loading}
            onClick={handleOpenBooking}
            className="w-full bg-slate-900 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-sky-600 disabled:opacity-20 transition-all active:scale-95 shadow-lg shadow-slate-200"
          >
            {loading ? "Chargement..." : "Réserver"}
          </button>
        </div>
      </div>

      {/* Modal Responsive */}
      {isModalOpen && paymentInfo && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-t-[2rem] sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
            <div className="bg-emerald-600 p-5 text-white flex justify-between items-center">
                <div>
                    <p className="text-[10px] uppercase font-bold opacity-80">Paiement Bankily</p>
                    <h3 className="text-lg font-bold leading-tight">{paymentInfo.receiver}</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="bg-white/10 p-2 rounded-full hover:bg-white/20">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 gap-4 text-left">
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Patient</label>
                    <input type="text" name="nomComplet_patient" required onChange={handleChange}
                        className="w-full mt-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">WhatsApp</label>
                    <input type="tel" name="numero_tel_patient" required onChange={handleChange}
                        className="w-full mt-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col items-center p-3 border-2 border-dashed border-slate-200 rounded-xl hover:border-emerald-500 cursor-pointer transition">
                  <span className="text-[10px] font-bold text-slate-500">NNI</span>
                  <input type="file" name="photo_nni" required onChange={handleChange} className="hidden" />
                </label>
                <label className="flex flex-col items-center p-3 border-2 border-dashed border-slate-200 rounded-xl hover:border-emerald-500 cursor-pointer transition">
                  <span className="text-[10px] font-bold text-slate-500">Reçu</span>
                  <input type="file" name="capture_paiement" required onChange={handleChange} className="hidden" />
                </label>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-sm hover:bg-emerald-700 transition shadow-lg shadow-emerald-100">
                Confirmer {selectedConsultation?.montant} MRU
              </button>
            </form>
          </div>
        </div>
      )}
    </article>
  );
}

export default function Consultation() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/consultations/`)
      .then(res => res.json())
      .then(result => {
        const data = result.data || result; 
        if (Array.isArray(data)) setConsultations(data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const uniqueDoctors = useMemo(() => {
    return Array.from(new Set(consultations.map(c => c.doctor_name)))
      .map(name => {
        const info = consultations.find(c => c.doctor_name === name);
        return {
          doctor_name: name,
          doctor_specialite: info.doctor_specialite,
          doctor_photo: info.doctor_photo
        };
      });
  }, [consultations]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
        <header className="mb-8 text-center space-y-3">
          <span className="inline-block px-4 py-1 bg-white rounded-full text-[10px] font-black uppercase tracking-tighter text-sky-600 shadow-sm border border-slate-100">Booking Santé</span>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">Consultation Rapide</h1>
          <p className="max-w-md mx-auto text-xs sm:text-sm text-slate-500">Réservez votre créneau vidéo en quelques secondes.</p>
        </header>

        {loading ? (
          <div className="mt-20 flex flex-col items-center"><div className="w-8 h-8 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin"></div></div>
        ) : uniqueDoctors.length > 0 ? (
          <div className="space-y-4">
            {uniqueDoctors.map((doc) => (
              <DoctorConsultationBlock
                key={doc.doctor_name}
                doctorData={doc}
                consultationsTemp={consultations}
                onBookingSuccess={() => window.location.reload()}
              />
            ))}
          </div>
        ) : (
          <div className="text-center p-12 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 text-sm font-medium">
            Aucun médecin disponible.
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .react-calendar { width: 100% !important; border: none !important; font-family: inherit !important; font-size: 0.75rem !important; }
        .react-calendar__tile--available { background: #f0fdf4 !important; color: #16a34a !important; font-weight: bold !important; border-radius: 8px !important; }
        .react-calendar__tile--active { background: #0ea5e9 !important; border-radius: 8px !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}} />
    </div>
  );
}