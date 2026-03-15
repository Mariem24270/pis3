import React, { useState, useEffect } from "react";
import { X, User, Phone, ShieldCheck, AlertCircle, Calendar, ChevronRight, CheckCircle2 } from "lucide-react";
import { API_BASE_URL } from "../api/config";

function SecretaireReservationForm({ consultation, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    nomComplet_patient: "",
    numero_tel_patient: "",
    numero_reservation: "",
  });

  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError("");
  };
// Dans SecretaireReservationForm.jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
    
    // Aligné sur ton SecretaryReservationSerializer dans views.py
    const payload = {
      nomComplet_patient: formData.nomComplet_patient,
      numero_tel_patient: formData.numero_tel_patient,
      NNI: formData.numero_reservation // On envoie la valeur sous la clé "NNI"
    };

    const response = await fetch(`${API_BASE_URL}/secretary-reservation/${consultation.id}/`, {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok) {
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess(); // Rafraîchit Dashboard & Liste Réservations
        onClose();
      }, 1500);
    } else {
      // Si Django renvoie des erreurs de validation (ex: NNI trop long)
      if (data.details) {
        // Affiche la première erreur de validation trouvée
        const firstError = Object.values(data.details)[0][0];
        setError(firstError);
      } else {
        setError(data.error || "Une erreur est survenue");
      }
    }
  } catch (err) {
    setError("Erreur de connexion au serveur");
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
      <div className="w-full max-w-lg rounded-[2.5rem] bg-white shadow-2xl overflow-hidden min-h-[400px] flex flex-col justify-center transition-all duration-500">
        
        {!isSuccess ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="relative p-8 border-b border-slate-50 bg-slate-50/30">
              <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white hover:bg-red-50 hover:text-red-500 rounded-xl shadow-sm border border-slate-100 transition-all text-slate-400">
                <X size={20} />
              </button>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                  <User size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Nouvelle Réservation</h2>
                  <p className="text-sm text-slate-500 font-medium">Saisie secrétariat</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Calendar size={16}/></div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">{consultation.doctor_name}</p>
                    <p className="text-[11px] text-slate-400 font-medium">
                       {new Date(consultation.date_fin).toLocaleDateString("fr-FR", { weekday: 'short', day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-indigo-600">{consultation.montant} MRU</p>
                </div>
              </div>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              {error && (
                <div className="rounded-2xl bg-red-50 border border-red-100 p-4 flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <p className="text-xs font-bold text-red-600">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nom du patient</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                    <input type="text" name="nomComplet_patient" value={formData.nomComplet_patient} onChange={handleChange} required placeholder="Nom complet" className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none text-sm font-semibold focus:ring-2 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">WhatsApp</label>
                    <input type="tel" name="numero_tel_patient" value={formData.numero_tel_patient} onChange={handleChange} required placeholder="4x xx xx xx" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none text-sm font-semibold focus:ring-2 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">NNI</label>
                    <input type="text" name="numero_reservation" value={formData.numero_reservation} onChange={handleChange} required placeholder="13 chiffres" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none text-sm font-semibold focus:ring-2 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all" />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={onClose} className="flex-1 px-6 py-4 rounded-2xl bg-slate-50 text-slate-500 font-bold text-sm hover:bg-slate-100 transition-all">Annuler</button>
                <button type="submit" disabled={loading} className="flex-[2] px-6 py-4 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-indigo-600 shadow-xl transition-all flex items-center justify-center gap-2">
                  {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : "Valider"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* --- ÉCRAN DE SUCCÈS ANIMÉ --- */
          <div className="p-12 text-center animate-in zoom-in-95 duration-500">
            <div className="relative mx-auto w-24 h-24 mb-6">
               <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-25"></div>
               <div className="relative bg-emerald-500 text-white w-24 h-24 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
                  <CheckCircle2 size={48} strokeWidth={3} />
               </div>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Réservation Confirmée !</h2>
            <p className="text-slate-500 font-medium">Le patient a été ajouté avec succès à la liste de reservation.</p>
            <div className="mt-8 flex justify-center">
               <div className="px-4 py-2 bg-slate-50 rounded-full border border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Fermeture automatique...
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SecretaireReservationForm;