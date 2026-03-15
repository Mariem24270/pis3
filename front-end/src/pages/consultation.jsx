import React, { useState, useEffect, useMemo } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  Camera, FileText, Calendar as CalIcon,
  Clock, X, Users, ShieldCheck, Wallet
} from "lucide-react";
import { useLocation } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:8000/api";
const MEDIA_BASE_URL = "http://127.0.0.1:8000";

// --- TIMER assorti ---
const CountdownTimer = ({ initialMinutes, onExpire }) => {
  const [seconds, setSeconds] = useState(initialMinutes * 60);

  useEffect(() => {
    if (seconds <= 0) {
      onExpire();
      return;
    }
    const timer = setInterval(() => setSeconds(s => s - 1), 1000);
    return () => clearInterval(timer);
  }, [seconds, onExpire]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-[#1a365d] rounded-full text-xs font-medium border border-[#2b6cb0]/20">
      <div className="w-1.5 h-1.5 bg-[#1a365d] rounded-full animate-pulse" />
      {mins}:{secs < 10 ? `0${secs}` : secs}
    </div>
  );
};

// --- DOCTOR CARD aux couleurs du header ---
function DoctorCard({ doctor, consultations, onBookingSuccess }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [nomComplet, setNomComplet] = useState("");
  const [phone, setPhone] = useState("");
  const [fileNNI, setFileNNI] = useState(null);
  const [filePaiement, setFilePaiement] = useState(null);

  const dailySlots = useMemo(() => {
    if (!selectedDate) return [];
    return consultations.filter(c =>
      c.doctor_name === doctor.doctor_name &&
      new Date(c.date_fin).toDateString() === selectedDate.toDateString()
    );
  }, [selectedDate, consultations, doctor.doctor_name]);

  const handleOpenBooking = () => {
    if (selectedSlot) setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fileNNI || !filePaiement) {
      alert("Veuillez charger les deux documents requis.");
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append("nomComplet_patient", nomComplet);
    data.append("numero_tel_patient", phone);
    data.append("photo_nni", fileNNI);
    data.append("capture_paiement", filePaiement);

    try {
      const res = await fetch(`${API_BASE_URL}/pay-consultation/${selectedSlot.id}/`, {
        method: "POST",
        body: data
      });
      const result = await res.json();

      if (res.ok && (result.ok || result.status === "success")) {
        alert("✅ Réservation réussie ! Votre dossier est en cours d'analyse.");
        setIsModalOpen(false);
        onBookingSuccess();
      } else {
        alert("❌ " + (result.message || "Erreur lors de la validation du paiement."));
      }
    } catch (err) {
      alert("❌ Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#2b6cb0]/20 shadow-lg p-6 mb-6 transition hover:shadow-xl">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Infos docteur */}
        <div className="lg:w-1/4 text-center lg:text-left">
          <div className="relative inline-block mb-4">
            <img
              src={doctor.doctor_photo ? (doctor.doctor_photo.startsWith('http') ? doctor.doctor_photo : `${MEDIA_BASE_URL}${doctor.doctor_photo}`) : "https://via.placeholder.com/150"}
              className="w-24 h-24 rounded-2xl object-cover ring-4 ring-[#2b6cb0]/20"
              alt={doctor.doctor_name}
            />
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1.5 rounded-xl border-2 border-white shadow">
              <ShieldCheck size={16} />
            </div>
          </div>
          <h2 className="text-lg font-semibold text-[#1a365d]">{doctor.doctor_name}</h2>
          <p className="text-[#2b6cb0] text-xs uppercase tracking-wide mt-1">{doctor.doctor_specialite}</p>

          <div className="mt-6 space-y-2 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <Wallet size={14} className="text-[#2b6cb0]" /> Bankily / Masrivi
            </div>
            <div className="flex items-center gap-2">
              <Users size={14} className="text-[#2b6cb0]" /> Places limitées
            </div>
          </div>
        </div>

        {/* Calendrier et créneaux */}
        <div className="lg:flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="custom-calendar-container">
            <p className="text-xs font-medium text-[#1a365d] uppercase tracking-wide mb-3 flex items-center gap-1">
              <CalIcon size={14} /> 1. Date
            </p>
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileClassName={({ date }) =>
                consultations.some(c => c.doctor_name === doctor.doctor_name && new Date(c.date_fin).toDateString() === date.toDateString())
                  ? "has-avail" : null
              }
            />
          </div>

          <div className="flex flex-col">
            <p className="text-xs font-medium text-[#1a365d] uppercase tracking-wide mb-3 flex items-center gap-1">
              <Clock size={14} /> 2. Créneaux
            </p>
            <div className="space-y-2 overflow-y-auto max-h-[240px] pr-1">
              {dailySlots.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSlot(s)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition ${
                    selectedSlot?.id === s.id
                      ? 'bg-[#1a365d] border-[#1a365d] text-white'
                      : 'bg-[#e6f0fa] border-[#2b6cb0]/20 hover:bg-[#d4e4f5]'
                  }`}
                >
                  <span className="font-medium text-sm">
                    {new Date(s.date_fin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-lg ${
                    selectedSlot?.id === s.id ? 'bg-[#2b6cb0]' : 'bg-white text-[#1a365d] border border-[#2b6cb0]/30'
                  }`}>
                    {s.places_restantes || "5"} pl.
                  </span>
                </button>
              ))}
              {dailySlots.length === 0 && (
                <p className="text-center py-6 text-gray-400 text-sm">Aucun créneau</p>
              )}
            </div>
            <button
              disabled={!selectedSlot}
              onClick={handleOpenBooking}
              className="mt-4 w-full bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] text-white py-3 rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-30 transition shadow-sm"
            >
              Réserver
            </button>
          </div>
        </div>
      </div>

      {/* MODAL COMPACTE aux couleurs du header */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="relative p-5 bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <CountdownTimer initialMinutes={5} onExpire={() => setIsModalOpen(false)} />
                <span className="text-xs text-blue-200">Sécurisé</span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg">
                <X size={18} className="text-white" />
              </button>
            </div>

            <div className="p-5">
              <p className="text-sm text-gray-500 mb-4">
                {new Date(selectedSlot?.date_fin).toLocaleString()}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <input
                    type="text" placeholder="Nom complet" required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#2b6cb0]"
                    onChange={e => setNomComplet(e.target.value)}
                  />
                  <input
                    type="tel" placeholder="Téléphone (WhatsApp)" required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#2b6cb0]"
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex flex-col items-center p-3 border border-dashed rounded-lg cursor-pointer transition ${
                    fileNNI ? 'bg-blue-50 border-[#2b6cb0]' : 'border-gray-300 hover:bg-blue-50'
                  }`}>
                    <Camera size={20} className={fileNNI ? 'text-[#1a365d]' : 'text-gray-400'} />
                    <span className="text-[10px] font-medium mt-1">{fileNNI ? "NNI" : "Photo NNI"}</span>
                    <input type="file" className="hidden" accept="image/*" required onChange={e => setFileNNI(e.target.files[0])} />
                  </label>
                  <label className={`flex flex-col items-center p-3 border border-dashed rounded-lg cursor-pointer transition ${
                    filePaiement ? 'bg-blue-50 border-[#2b6cb0]' : 'border-gray-300 hover:bg-blue-50'
                  }`}>
                    <FileText size={20} className={filePaiement ? 'text-[#1a365d]' : 'text-gray-400'} />
                    <span className="text-[10px] font-medium mt-1">{filePaiement ? "Reçu" : "Reçu Bankily"}</span>
                    <input type="file" className="hidden" accept="image/*" required onChange={e => setFilePaiement(e.target.files[0])} />
                  </label>
                </div>

                <div className="bg-gradient-to-r from-[#1a365d]/10 to-[#2b6cb0]/10 p-4 rounded-lg flex items-center gap-3 border border-[#2b6cb0]/20">
                  <div className="bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] p-2 rounded-lg text-white">
                    <Wallet size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-[#1a365d]">Montant à payer</p>
                    <p className="text-lg font-semibold text-gray-800">{selectedSlot?.montant || "500"} MRU</p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 text-sm shadow-sm"
                >
                  {loading ? "Traitement..." : "Confirmer la réservation"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- PAGE PRINCIPALE ---
export default function Consultation() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/consultations/`)
      .then(res => res.json())
      .then(result => {
        const data = result.data || result;
        if (Array.isArray(data)) {
          setConsultations(data.sort((a, b) => new Date(a.date_fin) - new Date(b.date_fin)));
        }
      })
      .catch(() => alert("Erreur lors de la récupération des données"))
      .finally(() => setLoading(false));
  }, []);

  const doctors = useMemo(() => {
    const doctorsMap = new Map();
    consultations.forEach(c => {
      if (!doctorsMap.has(c.doctor_name)) {
        doctorsMap.set(c.doctor_name, {
          doctor_name: c.doctor_name,
          doctor_specialite: c.doctor_specialite,
          doctor_photo: c.doctor_photo || c.photo
        });
      }
    });
    return Array.from(doctorsMap.values());
  }, [consultations]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6f0fa] to-white py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-light text-[#1a365d] tracking-tight">
            e-santé Mauritanie
          </h1>
          <p className="text-[#2b6cb0]/70 text-sm mt-2 max-w-xl mx-auto">
            Consultation médicale à distance. Choisissez votre spécialiste et réservez en ligne.
          </p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#2b6cb0]/30 border-t-[#1a365d] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {doctors.length > 0 ? (
              doctors.map(doc => (
                <DoctorCard
                  key={doc.doctor_name}
                  doctor={doc}
                  consultations={consultations}
                  onBookingSuccess={() => window.location.reload()}
                />
              ))
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-[#2b6cb0]/20">
                <p className="text-[#2b6cb0]/60 text-sm">Aucun spécialiste disponible</p>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .custom-calendar-container .react-calendar {
          border: none;
          font-family: inherit;
          width: 100%;
          background: transparent;
        }
        .custom-calendar-container .react-calendar__navigation button {
          font-size: 0.75rem;
          color: #1a365d;
        }
        .custom-calendar-container .react-calendar__tile {
          padding: 0.5rem;
          border-radius: 0.5rem;
          font-size: 0.75rem;
          color: #6b7280;
        }
        .custom-calendar-container .has-avail {
          background: #d4e4f5 !important;
          color: #1a365d !important;
          font-weight: 500;
        }
        .custom-calendar-container .react-calendar__tile--active {
          background: #2b6cb0 !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
}