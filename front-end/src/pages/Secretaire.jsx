import React, { useEffect, useState } from "react";
import { Hospital } from "lucide-react";
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

  const [consultForm, setConsultForm] = useState({
    doctorId: "",
    date: "",
    heure: "",
    places: "",
    montant: "",
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
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  };

  const fetchDoctors = async (headers) => {
    const res = await fetch(`${API_BASE_URL}/doctors/`, { headers });
    if (!res.ok) {
      console.error("Impossible de récupérer la liste des médecins :", res.status);
      setDoctors([]);
      return;
    }
    const data = await res.json().catch(() => ({}));
    setDoctors(parseArray(data));
  };

  const fetchConsultations = async (headers) => {
    const res = await fetch(`${API_BASE_URL}/consultations-temporaires/`, { headers });
    const data = await res.json().catch(() => ({}));
    setConsultations(parseArray(data));
  };

  const fetchReservations = async (headers) => {
    const res = await fetch(`${API_BASE_URL}/consultations-payees/`, { headers });
    const data = await res.json().catch(() => ({}));
    setReservations(parseArray(data));
  };

  // eslint rule in this project dislikes setState directly in effects
  useEffect(() => {
    const t = setTimeout(() => {
      const headers = getAuthHeaders();
      fetchDoctors(headers);
      fetchConsultations(headers);
      fetchReservations(headers);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const handleConsultChange = (e) => {
    setConsultForm({ ...consultForm, [e.target.name]: e.target.value });
  };

  const resetConsultForm = () => {
    setConsultForm({ doctorId: "", date: "", heure: "", places: "", montant: "" });
    setEditingConsult(null);
  };

  const submitConsultation = async (form, editing) => {
    // Convertir la date et heure en UTC ISO
    if (!form.date || !form.heure) {
      alert("Veuillez remplir la date et l'heure");
      return false;
    }

    // Parse: form.date = "2026-03-12", form.heure = "15:30"
    const dateStr = `${form.date}T${form.heure}:00`;
    const dateObj = new Date(dateStr);
    
    if (isNaN(dateObj.getTime())) {
      alert("Format de date invalide");
      return false;
    }

    // Convertir en UTC
    const dateUTC = dateObj.toISOString();

    const payload = {
      doctor: form.doctorId,
      date_fin: dateUTC,
      montant: parseInt(form.montant, 10),
      n_places: parseInt(form.places, 10),
    };

    console.log("📅 Date saisie:", form.date, form.heure);
    console.log("📤 Consultation envoyée:", payload);

    const url = editing
      ? `${API_BASE_URL}/consultations-temporaires/${editing.id}/`
      : `${API_BASE_URL}/consultations-temporaires/`;

    const method = editing ? "PUT" : "POST";
    const headers = getAuthHeaders();

    try {
      const res = await fetch(url, { method, headers, body: JSON.stringify(payload) });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert("Erreur : " + (err.detail || err.doctor?.[0] || err.date_fin?.[0] || JSON.stringify(err)));
        return false;
      }
      const resData = await res.json();
      console.log("✅ Réponse backend:", resData);
      await fetchConsultations(headers);
      return true;
    } catch (e) {
      console.error("❌ Erreur réseau:", e);
      alert("Erreur réseau. Vérifiez que le backend est démarré.");
      return false;
    }
  };

  const editConsult = (c) => {
    setEditingConsult(c);
    const dt = new Date(c.date_fin);
    const heure = dt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    const date = dt.toISOString().split("T")[0];
    const doctorId = c.doctor?.id ?? c.doctor ?? "";
    setConsultForm({
      doctorId: String(doctorId),
      date,
      heure,
      places: String(c.n_places ?? ""),
      montant: String(c.montant ?? ""),
    });
    setActive("form");
  };

  const deleteConsult = async (id) => {
    if (!window.confirm("Supprimer cette consultation ?")) return;
    const headers = getAuthHeaders();
    await fetch(`${API_BASE_URL}/consultations-temporaires/${id}/`, {
      method: "DELETE",
      headers,
    });
    fetchConsultations(headers);
  };

  const getDoctorName = (id) => {
    const d = doctors.find((doc) => (doc.id ?? doc.pk) === id);
    return d ? (d.user?.username ?? d.username ?? d.name) : "";
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userRole");
      window.location.href = "/login";
    }
  };

  return (
    <div className="secretaire-container">
      <header className="header">
        <div className="header-left">
          <Hospital size={44} color="#fff" />
          <div>
            <h1>Cabinet Médical</h1>
            <p>Dashboard Secrétaire</p>
          </div>
        </div>
        <nav className="menu">
          <button onClick={() => setActive("form")}>Ajouter / Modifier Consultation</button>
          <button onClick={() => setActive("consultations")}>Consultations</button>
          <button onClick={() => setActive("reservations")}>Réservations</button>
          <button onClick={handleLogout}>Déconnexion</button>
        </nav>
      </header>

      {active === "form" && (
        <section className="section card">
          <h2>{editingConsult ? "Modifier" : "Ajouter"} Consultation</h2>
          <form
            className="form-grid"
            onSubmit={async (e) => {
              e.preventDefault();
              const success = await submitConsultation(consultForm, editingConsult);
              if (success) {
                resetConsultForm();
                setActive("consultations");
              }
            }}
          >
            <select name="doctorId" value={consultForm.doctorId} onChange={handleConsultChange} required>
              <option value="">Choisir médecin</option>
              {(doctors || []).map((d) => {
                const id = d.id ?? d.pk;
                const name = d.user?.username ?? d.username ?? d.name ?? `Médecin #${id}`;
                if (id == null || id === "") return null;
                return (
                  <option key={id} value={id}>
                    {name} {d.specialite ? `(${d.specialite})` : ""}
                  </option>
                );
              })}
            </select>
            <input type="date" name="date" value={consultForm.date} onChange={handleConsultChange} required />
            <input type="time" name="heure" value={consultForm.heure} onChange={handleConsultChange} required />
            <input type="number" name="montant" placeholder="Montant" value={consultForm.montant} onChange={handleConsultChange} required />
            <input type="number" name="places" placeholder="Places" value={consultForm.places} onChange={handleConsultChange} required />
            <button type="submit" className="btn-submit">{editingConsult ? "Modifier" : "Ajouter"}</button>
          </form>
        </section>
      )}

      {active === "consultations" && (
        <section className="section card">
          <h2>Consultations temporaires</h2>
          <table className="reservation-table">
            <thead>
              <tr>
                <th>Médecin</th>
                <th>Date & heure</th>
                <th>Montant</th>
                <th>Places</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(consultations || []).map((c) => (
                <tr key={c.id}>
                  <td>{c.doctor_name || getDoctorName(c.doctor)}</td>
                  <td>{new Date(c.date_fin).toLocaleString()}</td>
                  <td>{c.montant}</td>
                  <td>{c.n_places}</td>
                  <td>
                    <button type="button" className="btn-action btn-green" onClick={() => editConsult(c)}>Modifier</button>
                    <button type="button" className="btn-action btn-red" onClick={() => deleteConsult(c.id)}>Supprimer</button>
                    <button type="button" className="btn-action btn-blue" onClick={() => setSelectedConsult(c)}>Réserver</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {active === "reservations" && (
        <section className="section card">
          <h2>Réservations</h2>
          <table className="reservation-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Téléphone</th>
                <th>Date</th>
                <th>Médecin</th>
                <th>Spécialité</th>
              </tr>
            </thead>
            <tbody>
              {(reservations || []).map((r) => (
                <tr key={r.id}>
                  <td>{r.nom_complet}</td>
                  <td>{r.numero_tel}</td>
                  <td>{new Date(r.date).toLocaleString()}</td>
                  <td>{r.doctor_name}</td>
                  <td>{r.specialite}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {selectedConsult && (
        <SecretaireReservationForm
          consultation={{ ...selectedConsult, doctor_name: selectedConsult.doctor_name || getDoctorName(selectedConsult.doctor) }}
          onClose={() => setSelectedConsult(null)}
          onSuccess={() => {
            const headers = getAuthHeaders();
            fetchConsultations(headers);
            fetchReservations(headers);
            setSelectedConsult(null);
          }}
        />
      )}
    </div>
  );
}