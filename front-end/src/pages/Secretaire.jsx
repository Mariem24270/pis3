import React, { useEffect, useState } from "react";
import {
  Hospital, LayoutDashboard, CalendarPlus, ClipboardList, LogOut,
  Edit3, Trash2, UserPlus, Clock, Search, CheckCircle2, Calendar,
  AlertCircle, XCircle,
} from "lucide-react";
import SecretaireReservationForm from "./SecretaireReservationForm";
import { API_BASE_URL } from "../api/config";
import "./Secretaire.css";

const MEDIA_BASE_URL = "http://127.0.0.1:8000";

export default function Secretaire({ onLogout }) {
  const [active, setActive] = useState("consultations");
  const [consultations, setConsultations] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [editingConsult, setEditingConsult] = useState(null);
  const [selectedConsult, setSelectedConsult] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingAction, setLoadingAction] = useState(null);
  const [imageModal, setImageModal] = useState(null);

  const [consultForm, setConsultForm] = useState({
    doctorId: "", date: "", heure: "", places: "", montant: "",
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const parseArray = (data) => {
    if (Array.isArray(data)) return data;
    if (data?.ok && Array.isArray(data.data)) return data.data;
    if (Array.isArray(data?.results)) return data.results;
    return [];
  };

  const fetchAll = async () => {
    const headers = getAuthHeaders();
    try {
      const [docRes, consRes, resRes] = await Promise.all([
        fetch(`${API_BASE_URL}/doctors/`, { headers }),
        fetch(`${API_BASE_URL}/consultations-temporaires/`, { headers }),
        fetch(`${API_BASE_URL}/consultations-payees/`, { headers }),
      ]);
      const docs = await docRes.json();
      const cons = await consRes.json();
      const ress = await resRes.json();
      setDoctors(parseArray(docs));
      setConsultations(parseArray(cons).sort((a, b) => new Date(a.date_fin) - new Date(b.date_fin)));
      setReservations(parseArray(ress).sort((a, b) => b.id - a.id));
    } catch (e) {
      console.error("Fetch error", e);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleConsultChange = (e) => setConsultForm({ ...consultForm, [e.target.name]: e.target.value });

  const resetConsultForm = () => {
    setConsultForm({ doctorId: "", date: "", heure: "", places: "", montant: "" });
    setEditingConsult(null);
  };

  const submitConsultation = async (e) => {
    e.preventDefault();
    if (!consultForm.doctorId) { alert("Veuillez sélectionner un médecin."); return; }
    const payload = {
      doctor: String(consultForm.doctorId),
      date_fin: `${consultForm.date}T${consultForm.heure}:00`,
      montant: parseInt(consultForm.montant, 10),
      n_places: parseInt(consultForm.places, 10),
    };
    try {
      const res = await fetch(`${API_BASE_URL}/consultations-temporaires/`, {
        method: editingConsult ? "PUT" : "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      if (res.ok) { await fetchAll(); resetConsultForm(); setActive("consultations"); }
      else { const err = await res.json(); alert("Erreur : " + JSON.stringify(err)); }
    } catch (e) { alert("Erreur de connexion"); }
  };

  const editConsult = (c) => {
    setEditingConsult(c);
    const dt = new Date(c.date_fin);
    setConsultForm({
      doctorId: String(c.doctor?.id ?? c.doctor ?? ""),
      date: dt.toISOString().split("T")[0],
      heure: dt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      places: String(c.n_places ?? ""),
      montant: String(c.montant ?? ""),
    });
    setActive("form");
  };

  const deleteConsult = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette séance ?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/consultations-temporaires/${id}/`, {
        method: "DELETE", headers: getAuthHeaders(),
      });
      if (res.ok) fetchAll();
    } catch (e) { alert("Erreur serveur"); }
  };

  const getDoctorName = (doctorInput) => {
    if (doctorInput && typeof doctorInput === "object") {
      return doctorInput.user?.username || doctorInput.name || "Médecin";
    }
    const found = doctors.find((d) => String(d.id) === String(doctorInput));
    return found ? found.user?.username || found.name : "Médecin";
  };

  const validerReservation = async (id, action) => {
    setLoadingAction(id + action);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE_URL}/valider-reservation/${id}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        alert(action === "valide" ? "✅ Validée ! WhatsApp envoyé au patient." : "❌ Réservation rejetée.");
        fetchAll();
      } else {
        const err = await res.json();
        alert("Erreur : " + (err.error || JSON.stringify(err)));
      }
    } catch (e) {
      alert("Erreur de connexion.");
    } finally {
      setLoadingAction(null);
    }
  };

  const enAttenteList = reservations.filter((r) => r.statut === "en_attente");
  const enAttenteCount = enAttenteList.length;

  const statutBadge = (statut) => {
    const cfg = {
      valide:     { bg: "#d1fae5", color: "#065f46", label: "Validé" },
      rejete:     { bg: "#fee2e2", color: "#991b1b", label: "Rejeté" },
      en_attente: { bg: "#fef3c7", color: "#92400e", label: "En attente" },
      en_especes: { bg: "#ede9fe", color: "#5b21b6", label: "En espèces" },
    };
    const c = cfg[statut] || cfg.en_attente;
    return (
      <span style={{ background: c.bg, color: c.color, borderRadius: "999px", fontSize: "11px", padding: "3px 10px", fontWeight: "700" }}>
        {c.label}
      </span>
    );
  };

  const ImageModal = () => {
    if (!imageModal) return null;
    return (
      <div
        onClick={() => setImageModal(null)}
        style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.88)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "zoom-out",
        }}
      >
        <img
          src={imageModal}
          alt="Aperçu"
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: "12px" }}
        />
        <button
          onClick={() => setImageModal(null)}
          style={{
            position: "absolute", top: "20px", right: "28px",
            background: "rgba(255,255,255,0.15)", border: "none",
            color: "white", fontSize: "24px", width: "44px", height: "44px",
            borderRadius: "50%", cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}
        >✕</button>
      </div>
    );
  };

  return (
    <div className="secretaire-container">
      <ImageModal />

      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon"><Hospital size={28} /></div>
          <div className="brand-text"><h2>Hopital local</h2><span>Espace Secrétaire</span></div>
        </div>
        <nav className="sidebar-nav">
          <button className={active === "consultations" ? "active" : ""} onClick={() => setActive("consultations")}>
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button className={active === "form" ? "active" : ""} onClick={() => { resetConsultForm(); setActive("form"); }}>
            <CalendarPlus size={20} /> Nouvelle Séance
          </button>
          <button
            className={active === "attente" ? "active" : ""}
            onClick={() => setActive("attente")}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertCircle size={20} /> File d'attente
            </span>
            {enAttenteCount > 0 && (
              <span style={{ background: "#ef4444", color: "white", borderRadius: "999px", fontSize: "10px", padding: "2px 8px", fontWeight: "700" }}>
                {enAttenteCount}
              </span>
            )}
          </button>
          <button className={active === "reservations" ? "active" : ""} onClick={() => setActive("reservations")}>
            <ClipboardList size={20} /> Liste Réservations
          </button>
        </nav>
        <button onClick={onLogout} className="logout-btn mt-auto">
          <LogOut size={20} /> Déconnexion
        </button>
      </aside>

      <main className="admin-main">
        <header className="main-header">
          <div className="header-search">
            <Search size={18} />
            <input type="text" placeholder="Rechercher un patient..." onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="user-profile">
            <div className="user-info text-right mr-4">
              <p className="font-bold text-slate-900">Session Secrétaire</p>
              <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">Connecté</span>
            </div>
            <div className="user-avatar">S</div>
          </div>
        </header>

        <div className="content-wrapper">

          {/* ===== DASHBOARD ===== */}
          {active === "consultations" && (
            <>
              <div className="stats-grid mb-8">
                <div className="stat-card">
                  <div className="stat-icon bg-indigo-50 text-indigo-600"><Clock size={24} /></div>
                  <div className="stat-data"><h3>{consultations.length}</h3><p>Séances actives</p></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon bg-emerald-50 text-emerald-600"><CheckCircle2 size={24} /></div>
                  <div className="stat-data"><h3>{reservations.length}</h3><p>Réservations</p></div>
                </div>
                <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setActive("attente")}>
                  <div className="stat-icon bg-orange-50 text-orange-500"><AlertCircle size={24} /></div>
                  <div className="stat-data"><h3>{enAttenteCount}</h3><p>En attente</p></div>
                </div>
              </div>

              <div className="section-card animate-slide-up">
                <div className="card-header flex justify-between items-center">
                  <h2 className="text-xl font-bold text-slate-800">Séances en cours</h2>
                  <button className="btn-primary-sm" onClick={() => setActive("form")}>+ Nouvelle séance</button>
                </div>
                <div className="table-responsive">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Médecin</th><th>Date & Heure</th><th>Montant</th><th>Places</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consultations.map((c) => (
                        <tr key={c.id}>
                          <td><p className="font-bold">{c.doctor_name || getDoctorName(c.doctor)}</p></td>
                          <td>
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-700">{new Date(c.date_fin).toLocaleDateString("fr-FR")}</span>
                              <span className="text-xs text-slate-400">à {new Date(c.date_fin).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                            </div>
                          </td>
                          <td><span className="badge-price">{c.montant} MRU</span></td>
                          <td><span className="badge-count">{c.n_places} dispo</span></td>
                          <td className="text-right">
                            <div className="flex justify-end gap-2">
                              <button className="action-icon edit" title="Modifier" onClick={() => editConsult(c)}><Edit3 size={16} /></button>
                              <button className="action-icon delete" title="Supprimer" onClick={() => deleteConsult(c.id)}><Trash2 size={16} /></button>
                              <button className="action-icon reserve" title="Inscrire" onClick={() => setSelectedConsult(c)}><UserPlus size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ===== FORMULAIRE SÉANCE ===== */}
          {active === "form" && (
            <div className="form-container-premium animate-slide-up">
              <div className="form-header-minimal">
                <h2 className="text-2xl font-bold text-slate-800">
                  {editingConsult ? "Modifier la Séance" : "Programmer une Consultation"}
                </h2>
              </div>
              <form onSubmit={submitConsultation} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="input-custom-group">
                    <label>Médecin Référent</label>
                    <select name="doctorId" value={consultForm.doctorId} onChange={handleConsultChange} className="input-field" required>
                      <option value="">Choisir un médecin...</option>
                      {doctors.map((d) => (
                        <option key={d.id ?? d.pk} value={d.id ?? d.pk}>
                          Dr. {d.user?.username ?? d.username ?? d.name} ({d.specialite})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="input-custom-group">
                    <label>Date</label>
                    <input type="date" name="date" value={consultForm.date} onChange={handleConsultChange} className="input-field" required />
                  </div>
                  <div className="input-custom-group">
                    <label>Heure</label>
                    <input type="time" name="heure" value={consultForm.heure} onChange={handleConsultChange} className="input-field" required />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="input-custom-group">
                    <label>Tarif (MRU)</label>
                    <input type="number" name="montant" value={consultForm.montant} onChange={handleConsultChange} className="input-field" required />
                  </div>
                  <div className="input-custom-group">
                    <label>Nombre de places</label>
                    <input type="number" name="places" value={consultForm.places} onChange={handleConsultChange} className="input-field" required />
                  </div>
                </div>
                <div className="flex justify-end gap-4 border-t pt-6">
                  <button type="button" onClick={() => setActive("consultations")}>Annuler</button>
                  <button type="submit" className="btn-submit-premium">
                    {editingConsult ? "Mettre à jour" : "Valider la séance"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ===== FILE D'ATTENTE ===== */}
          {active === "attente" && (
            <div className="section-card animate-slide-up">
              <div className="card-header flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">File d'attente</h2>
                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                  {enAttenteCount} en attente
                </span>
              </div>
              <div className="table-responsive">
                {enAttenteCount === 0 ? (
                  <div style={{ textAlign: "center", padding: "64px 0" }}>
                    <CheckCircle2 size={48} style={{ margin: "0 auto 16px", color: "#10b981" }} />
                    <p className="text-slate-400 text-sm">Aucune réservation en attente</p>
                  </div>
                ) : (
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Patient</th><th>Médecin</th><th>Montant</th>
                        <th>Photo NNI</th><th>Reçu Bankily</th><th>Date</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enAttenteList.map((r) => (
                        <tr key={r.id}>
                          <td>
                            <p className="font-bold text-slate-900">{r.nom_complet}</p>
                            <p className="text-xs text-slate-400">{r.numero_tel}</p>
                          </td>
                          <td>
                            <p className="font-bold text-indigo-600">Dr. {r.doctor_name || "Médecin"}</p>
                            <span className="text-[10px] text-slate-400 uppercase font-black">{r.specialite}</span>
                          </td>
                          <td><span className="badge-price">{r.montant} MRU</span></td>
                          <td>
                            {r.photo_nni ? (
                              <img src={`${MEDIA_BASE_URL}${r.photo_nni}`} alt="NNI"
                                onClick={() => setImageModal(`${MEDIA_BASE_URL}${r.photo_nni}`)}
                                style={{ width: "60px", height: "44px", objectFit: "cover", borderRadius: "6px", border: "1px solid #e2e8f0", cursor: "zoom-in" }} />
                            ) : <span className="text-xs text-red-400">Manquant</span>}
                          </td>
                          <td>
                            {r.capture_paiement ? (
                              <img src={`${MEDIA_BASE_URL}${r.capture_paiement}`} alt="Paiement"
                                onClick={() => setImageModal(`${MEDIA_BASE_URL}${r.capture_paiement}`)}
                                style={{ width: "60px", height: "44px", objectFit: "cover", borderRadius: "6px", border: "1px solid #e2e8f0", cursor: "zoom-in" }} />
                            ) : <span className="text-xs text-red-400">Manquant</span>}
                          </td>
                          <td className="text-slate-600 text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar size={13} className="text-slate-300" />
                              {new Date(r.date).toLocaleString("fr-FR")}
                            </div>
                          </td>
                          <td className="text-right">
                            <div className="flex justify-end gap-2">
                              <button className="action-icon" title="Valider" disabled={!!loadingAction}
                                onClick={() => validerReservation(r.id, "valide")}
                                style={{ background: "#d1fae5", color: "#065f46", border: "1px solid #6ee7b7" }}>
                                <CheckCircle2 size={16} />
                              </button>
                              <button className="action-icon" title="Rejeter" disabled={!!loadingAction}
                                onClick={() => validerReservation(r.id, "rejete")}
                                style={{ background: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5" }}>
                                <XCircle size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ===== LISTE RÉSERVATIONS ===== */}
          {active === "reservations" && (
            <div className="section-card animate-slide-up">
              <div className="card-header flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">Historique des Réservations</h2>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                  {reservations.length} total
                </span>
              </div>
              <div className="table-responsive">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Patient</th><th>Contact</th><th>Médecin & Spécialité</th>
                      <th>Statut</th><th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations
                      .filter((r) => r.nom_complet?.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                          <td>
                            <p className="font-bold text-slate-900">{r.nom_complet}</p>
                            <p className="text-[10px] text-slate-400">ID: #{r.id}</p>
                          </td>
                          <td className="text-slate-500 font-medium">{r.numero_tel}</td>
                          <td>
                            <p className="font-bold text-indigo-600">Dr. {r.doctor_name || "Médecin"}</p>
                            <span className="text-[10px] text-slate-400 uppercase font-black">{r.specialite}</span>
                          </td>
                          <td>{statutBadge(r.statut)}</td>
                          <td className="text-slate-600 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-slate-300" />
                              {new Date(r.date).toLocaleString("fr-FR")}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>

      {selectedConsult && (
        <SecretaireReservationForm
          consultation={{ ...selectedConsult, doctor_name: selectedConsult.doctor_name || getDoctorName(selectedConsult.doctor) }}
          onClose={() => setSelectedConsult(null)}
          onSuccess={() => { fetchAll(); setSelectedConsult(null); }}
        />
      )}
    </div>
  );
}