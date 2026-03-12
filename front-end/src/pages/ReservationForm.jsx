


import React, { useState } from "react";
import { apiUrl } from "../api/config";
import "./ReservationForm.css";

function ReservationForm({ consultation, onClose }) {
  const [formData, setFormData] = useState({
    nom_complet: "",
    numero_tel: "",
    NNI: "",
    montant: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nom_complet || !formData.numero_tel || !formData.NNI || !formData.montant) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    // Préparer les données pour le backend
    const dataToSend = {
      nomComplet_patient: formData.nom_complet,
      numero_tel_patient: formData.numero_tel,
      NNI: formData.NNI,
      montant: parseFloat(formData.montant),
      consultation_id: consultation.id,
    };

    try {
      const response = await fetch(apiUrl("reservations/"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur serveur");
      }

      alert("Réservation réussie !");
      onClose();
    } catch (err) {
      console.error("Erreur lors de la réservation :", err);
      alert("Erreur lors de la réservation : " + err.message);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Réserver une consultation avec {consultation.doctor_name}</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Nom complet:
            <input
              type="text"
              name="nom_complet"
              value={formData.nom_complet}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Téléphone:
            <input
              type="tel"
              name="numero_tel"
              value={formData.numero_tel}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            NNI:
            <input
              type="text"
              name="NNI"
              value={formData.NNI}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Montant:
            <input
              type="number"
              name="montant"
              value={formData.montant}
              onChange={handleChange}
              required
            />
          </label>

          <div className="buttons">
            <button type="submit">Réserver</button>
            <button type="button" onClick={onClose}>Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReservationForm;
export { ReservationForm };