import React, { useEffect, useState } from "react";
import { 
  Hospital, 
  LayoutDashboard, 
  CalendarPlus, 
  ClipboardList, 
  LogOut, 
  Plus, 
  Edit3, 
  Trash2, 
  UserPlus, 
  Clock, 
  Search,
  CheckCircle2,
  Calendar
} from "lucide-react";
import SecretaireReservationForm from "./SecretaireReservationForm";
import { API_BASE_URL } from "../api/config";
import "./Secretaire.css";

export default function Secretaire({ onLogout }) {
  const [active, setActive] = useState("consultations");
  const [consultations, setConsultations] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [editingConsult, setEditingConsult] = useState(null);
  const [selectedConsult, setSelectedConsult] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [consultForm, setConsultForm] = useState({
    doctorId: "",
    date: "",
    heure: "",
    places: "",
    montant: "",
  });

  // --- HEADERS AUTHENTIFICATION ---
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const parseArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data?.ok && Array.isArray(data.data)) return data.data; // Ajout pour gérer ton format Django
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

  // --- CHARGEMENT DES DONNÉES ---
  const fetchAll = async () => {
    const headers = getAuthHeaders();
    try {
      const [docRes, consRes, resRes] = await Promise.all([
        fetch(`${API_BASE_URL}/doctors/`, { headers }),
        fetch(`${API_BASE_URL}/consultations-temporaires/`, { headers }),
        fetch(`${API_BASE_URL}/consultations-payees/`, { headers })
      ]);
      
      const docs = await docRes.json();
      const cons = await consRes.json();
      const ress = await resRes.json();
      
      setDoctors(parseArray(docs));
      
      // Séances : Tri par date (la plus proche en premier)
      setConsultations(parseArray(cons).sort((a, b) => new Date(a.date_fin) - new Date(b.date_fin)));
      
      // Réservations : Tri par ID décroissant (la plus récente tout en haut)
      const sortedReservations = parseArray(ress).sort((a, b) => b.id - a.id);
      setReservations(sortedReservations);
      
    } catch (e) { 
      console.error("Fetch error", e); 
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // --- GESTION FORMULAIRE SÉANCE ---
  const handleConsultChange = (e) => setConsultForm({ ...consultForm, [e.target.name]: e.target.value });

  const resetConsultForm = () => {
    setConsultForm({ doctorId: "", date: "", heure: "", places: "", montant: "" });
    setEditingConsult(null);
  };

  const submitConsultation = async (e) => {
  e.preventDefault();
  
  // 1. On vérifie si un docteur est sélectionné
  if (!consultForm.doctorId) {
    alert("Veuillez sélectionner un médecin.");
    return;
  }

  const payload = {
    // SUPPRIME LE parseInt ICI car ton modèle utilise une CharField
    doctor: String(consultForm.doctorId), 
    date_fin: `${consultForm.date}T${consultForm.heure}:00`,
    montant: parseInt(consultForm.montant, 10),
    n_places: parseInt(consultForm.places, 10),
  };

  try {
    const res = await fetch(`${API_BASE_URL}/consultations-temporaires/`, { 
      method: editingConsult ? "PUT" : "POST", 
      headers: getAuthHeaders(), 
      body: JSON.stringify(payload) 
    });

    if (res.ok) { 
      await fetchAll(); 
      resetConsultForm();
      setActive("consultations");
    } else {
      const errorData = await res.json();
      console.log("Détails erreur:", errorData);
      alert("Erreur : " + JSON.stringify(errorData));
    }
  } catch (e) { 
    alert("Erreur de connexion"); 
  }
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
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (res.ok) fetchAll();
    } catch (e) { alert("Erreur serveur"); }
  };

  const getDoctorName = (doctorInput) => {
  // Si c'est un objet (renvoyé par l'API)
  if (doctorInput && typeof doctorInput === 'object') {
    return doctorInput.user?.username || doctorInput.name || "Médecin";
  }
  // Si c'est un ID (string ou number), on cherche dans la liste chargée
  const found = doctors.find(d => String(d.id) === String(doctorInput));
  return found ? (found.user?.username || found.name) : "Médecin";
};

  return (
    <div className="secretaire-container">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon"><Hospital size={28} /></div>
          <div className="brand-text">
            <h2>Cabinet Pro</h2>
            <span>Espace Secrétaire</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          <button className={active === "consultations" ? "active" : ""} onClick={() => setActive("consultations")}>
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button className={active === "form" ? "active" : ""} onClick={() => { resetConsultForm(); setActive("form"); }}>
            <CalendarPlus size={20} /> Nouvelle Séance
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
        {/* HEADER */}
        <header className="main-header">
          <div className="header-search">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un patient..." 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
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
          {/* STATS RAPIDES */}
          {active === "consultations" && (
            <div className="stats-grid mb-8">
              <div className="stat-card">
                <div className="stat-icon bg-indigo-50 text-indigo-600"><Clock size={24} /></div>
                <div className="stat-data"><h3>{consultations.length}</h3><p>Séances actives</p></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon bg-emerald-50 text-emerald-600"><CheckCircle2 size={24} /></div>
                <div className="stat-data"><h3>{reservations.length}</h3><p>Réservations</p></div>
              </div>
            </div>
          )}

          {/* FORMULAIRE SÉANCE */}
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
                      {doctors.map(d => (
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

          {/* TABLEAU DES SÉANCES */}
          {active === "consultations" && (
            <div className="section-card animate-slide-up">
              <div className="card-header flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">Séances en cours</h2>
                <button className="btn-primary-sm" onClick={() => setActive("form")}>+ Nouvelle séance</button>
              </div>
              <div className="table-responsive">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Médecin</th>
                      <th>Date & Heure</th>
                      <th>Montant</th>
                      <th>Places</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  {/* Remplace le corps du tableau des réservations par celui-ci */}
<tbody>
  {consultations.map((c) => (
    <tr key={c.id}>
      <td>
        <p className="font-bold">
          {c.doctor_name || getDoctorName(c.doctor)}
        </p>
      </td>
      <td>
        <div className="flex flex-col">
          <span className="font-medium text-slate-700">
            {new Date(c.date_fin).toLocaleDateString('fr-FR')}
          </span>
          <span className="text-xs text-slate-400">
            à {new Date(c.date_fin).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
          </span>
        </div>
      </td>
      <td><span className="badge-price">{c.montant} MRU</span></td>
      <td><span className="badge-count">{c.n_places} dispo</span></td>
      
      {/* --- CETTE PARTIE GÈRE LES BOUTONS QUI AVAIENT DISPARU --- */}
      <td className="text-right">
        <div className="flex justify-end gap-2">
          <button 
            className="action-icon edit" 
            title="Modifier" 
            onClick={() => editConsult(c)}
          >
            <Edit3 size={16} />
          </button>
          <button 
            className="action-icon delete" 
            title="Supprimer" 
            onClick={() => deleteConsult(c.id)}
          >
            <Trash2 size={16} />
          </button>
          <button 
            className="action-icon reserve" 
            title="Inscrire un patient" 
            onClick={() => setSelectedConsult(c)}
          >
            <UserPlus size={16} />
          </button>
        </div>
      </td>
    </tr>
  ))}
</tbody>
                </table>
              </div>
            </div>
          )}

          {/* TABLEAU DES RÉSERVATIONS */}
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
                      <th>Patient</th>
                      <th>Contact</th>
                      <th>Médecin & Spécialité</th>
                      <th>Date d'enregistrement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations
                      .filter(r => r.nom_complet.toLowerCase().includes(searchTerm.toLowerCase()))
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
                        <td className="text-slate-600 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-slate-300"/>
                            {new Date(r.date).toLocaleString('fr-FR')}
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

      {/* MODAL RÉSERVATION */}
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