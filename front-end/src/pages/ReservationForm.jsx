


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
  setLoading(true);
  setError(""); 

  try {
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
    
    // On envoie EXACTEMENT ce que ton SecretaryReservationSerializer attend
    const payload = {
      nomComplet_patient: formData.nomComplet_patient,
      numero_tel_patient: formData.numero_tel_patient,
      NNI: formData.numero_reservation 
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
        onSuccess(); // Rafraîchit la liste des réservations
        onClose();
      }, 2000);
    } else {
      // Gestion intelligente des erreurs sans planter l'appli
      if (data.NNI) {
        setError("Erreur NNI: 10 chiffres maximum attendus.");
      } else if (data.nomComplet_patient) {
        setError("Nom du patient invalide.");
      } else {
        setError(data.error || "Données invalides. Vérifiez les champs.");
      }
    }
  } catch (err) {
    setError("Erreur de connexion au serveur");
  } finally {
    setLoading(false);
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