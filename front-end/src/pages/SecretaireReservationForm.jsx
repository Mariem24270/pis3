import React, { useState } from "react";
import { X, User, Phone, FileText, DollarSign, AlertCircle, Calendar, Clock } from "lucide-react";
import { API_BASE_URL } from "../api/config";

function SecretaireReservationForm({ consultation, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    nomComplet_patient: "",
    numero_tel_patient: "",
    numero_reservation: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateNNI = (nni) => {
    // NNI Mauritanie: 13 chiffres
    const nniRegex = /^\d{13}$/;
    return nniRegex.test(nni);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.nomComplet_patient || !formData.numero_tel_patient || !formData.numero_reservation) {
      setError("Veuillez remplir tous les champs requis.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      const data = new FormData();
      data.append("nomComplet_patient", formData.nomComplet_patient);
      data.append("numero_tel_patient", formData.numero_tel_patient);
      data.append("NNI", formData.numero_reservation);

      const response = await fetch(
        `${API_BASE_URL}/secretary-reservation/${consultation.id}/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: data,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || result.detail || "Erreur lors de la réservation");
        return;
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      setError("Erreur serveur. Vérifiez que le backend est démarré.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200/70 overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] px-6 py-6">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-4 w-4 text-white" />
          </button>
          <h2 className="text-xl font-bold text-white mb-4">
            Nouvelle réservation
          </h2>
          <div className="text-sm text-blue-100 space-y-1">
            <p><span className="font-semibold">{consultation.doctor_name}</span></p>
            <p>{new Date(consultation.date_fin).toLocaleDateString("fr-FR", {
              weekday: "short",
              day: "2-digit",
              month: "short",
            })} à {new Date(consultation.date_fin).toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}</p>
            <p className="font-semibold">{consultation.montant} MRU</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Nom complet */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              Nom complet du patient
            </label>
            <input
              type="text"
              name="nomComplet_patient"
              value={formData.nomComplet_patient}
              onChange={handleChange}
              placeholder="Ahmed Mohamed Ali"
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              required
            />
          </div>

          {/* Téléphone */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Phone className="h-4 w-4 text-blue-600" />
              Numéro WhatsApp
            </label>
            <input
              type="tel"
              name="numero_tel_patient"
              value={formData.numero_tel_patient}
              onChange={handleChange}
              placeholder="+22226123456"
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              required
            />
          </div>

          {/* NNI */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              Numéro NNI
            </label>
            <input
              type="text"
              name="numero_reservation"
              value={formData.numero_reservation}
              onChange={handleChange}
              placeholder="Entrez le numéro NNI"
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              required
            />
          </div>

          {/* Info */}
          <div className="rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 p-3 flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-900">Places: {consultation.n_places}</p>
              <p className="text-xs text-blue-700">Réservation automatique</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] text-white font-semibold hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25"
            >
              {loading ? "En cours..." : "Réserver"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SecretaireReservationForm;
