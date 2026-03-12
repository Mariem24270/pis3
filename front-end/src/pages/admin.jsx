import { Calendar, Clock, Users, CreditCard } from "lucide-react";
import ReservationForm from "./ReservationForm";
import React, { useEffect, useState } from "react";
import { 
  Hospital, 
  LogOut, 
  Edit, 
  Trash2,
  User,
  Mail,
  Phone,
  Image,
  Lock,
  UserCircle,
  Stethoscope
} from "lucide-react";
import "./Admin.css";

import { API_BASE_URL, MEDIA_BASE_URL } from "../api/config";

const API_DOCTORS = `${API_BASE_URL}/doctors/`;
const API_SECRETAIRES = `${API_BASE_URL}/secreteurs/`;
const API_ADMINS = `${API_BASE_URL}/administrations/`;
const API_CONS_PAYE = `${API_BASE_URL}/consultations-payees/`;
const API_CONS_TEMP = `${API_BASE_URL}/consultations-temporaires/`;




function AdminDashboard({ onLogout }) {
  const [section, setSection] = useState("doctors");
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [secretaires, setSecretaires] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [consultationsPayees, setConsultationsPayees] = useState([]);
  const [consultationsTemp, setConsultationsTemp] = useState([]);

  const [consultForm, setConsultForm] = useState({
  doctor: "",
  date_fin: "",
  montant: "",
  n_places: ""
});

  const [doctorForm, setDoctorForm] = useState({
  id: null,
  username: "",
  email: "",
  numero_tel: "",
  date_disponible: "",
  password: "",
  specialite: "",
  photo: null
});

  const [secretaireForm, setSecretaireForm] = useState({
  id: null,
  username: "",
  email: "",
  numero_tel: "",
  password: ""
});

  const [adminForm, setAdminForm] = useState({
  id: null,
  username: "",
  email: "",
  numero_tel: "",
  password: ""
});



  async function fetchAll() {
  const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
if (!token) {
  alert("Vous devez vous reconnecter !");
  return;
}

const headers = {
  "Content-Type": "application/json",
  Authorization: "Bearer " + token
};

  const safeJsonArray = (res) => res.json().then((data) => (Array.isArray(data) ? data : []));

  const parseDoctors = (res) =>
    res.json().then((data) => {
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.results)) return data.results;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    });

  const resD = await fetch(API_DOCTORS, { headers });
  setDoctors(await parseDoctors(resD));

  const resS = await fetch(API_SECRETAIRES, { headers });
  setSecretaires(await safeJsonArray(resS));

  const resA = await fetch(API_ADMINS, { headers });
  setAdmins(await safeJsonArray(resA));

  const resP = await fetch(API_CONS_PAYE, { headers });
  setConsultationsPayees(await safeJsonArray(resP));

  const resT = await fetch(API_CONS_TEMP, { headers });
  setConsultationsTemp(await safeJsonArray(resT));
}

  useEffect(() => {
    const t = setTimeout(() => {
      fetchAll();
    }, 0);
    return () => clearTimeout(t);
  }, []);



  const handleChange = (e, role) => {
  const { name, value } = e.target;
  if (role === "doctor") setDoctorForm({ ...doctorForm, [name]: value });
  if (role === "secretaire") setSecretaireForm({ ...secretaireForm, [name]: value });
  if (role === "admin") setAdminForm({ ...adminForm, [name]: value });
};

  const handlePhotoChange = (e) => {
  setDoctorForm({ ...doctorForm, photo: e.target.files[0] });
  };

const saveUser = async (role) => {
  let form, api;
  if (role === "doctor") { form = doctorForm; api = API_DOCTORS; }
  if (role === "secretaire") { form = secretaireForm; api = API_SECRETAIRES; }
  if (role === "admin") { form = adminForm; api = API_ADMINS; }

  if (!form.username || !form.email || !form.numero_tel) return alert("Champs obligatoires !");

  const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
 if (!token) {
  alert("Vous devez vous reconnecter !");
  return;
}

let headers = {
  "Content-Type": "application/json",
  Authorization: "Bearer " + token
};
  let body;

  if (role === "doctor" && form.photo) {
    body = new FormData();
    const payload = { ...form, id: form.id || form.username };
    for (let key in payload) {
      const v = payload[key];
      if (v != null && v !== "" && key !== "user") body.append(key, v);
    }
    delete headers["Content-Type"];
  } else {
    const payload = { ...form };
    if (role === "doctor" && !form.id) payload.id = form.username;
    body = JSON.stringify(payload);
    headers["Content-Type"] = "application/json";
  }

  const method = form.id ? "PUT" : "POST";
  const url = form.id ? `${api}${form.id}/` : api;

  const res = await fetch(url, { method, headers, body });
  if (!res.ok) {
    const err = await res.json();
    return alert("Erreur: " + JSON.stringify(err));
  }

  alert(role + " enregistré avec succès !");
  
  // Reset formulaire
  if (role === "doctor") setDoctorForm({ id: null, username: "", email: "", numero_tel: "", password: "", specialite: "", photo: null });
  if (role === "secretaire") setSecretaireForm({ id: null, username: "", email: "", numero_tel: "", password: "" });
  if (role === "admin") setAdminForm({ id: null, username: "", email: "", numero_tel: "", password: "" });

  fetchAll();
};

  


  const editUser = (u, role) => {
    if (role === "doctor") setDoctorForm({
      ...u,
      username: u.user?.username ?? u.username ?? "",
      email: u.user?.email ?? u.email ?? "",
      date_disponible: u.date_disponible ? (u.date_disponible.slice ? u.date_disponible.slice(0, 10) : u.date_disponible) : "",
      password: ""
    });
    if (role === "secretaire") setSecretaireForm({ ...u, password: "" });
    if (role === "admin") setAdminForm({ ...u, password: "" });
  };

  const deleteUser = async (id, role) => {
  if (!window.confirm("Supprimer cet utilisateur ?")) return;

  const api = role === "doctor" ? API_DOCTORS : role === "secretaire" ? API_SECRETAIRES : API_ADMINS;
  const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
  if (!token) {
    alert("Vous devez vous reconnecter !");
    return;
  }

  const res = await fetch(`${api}${id}/`, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + token }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    alert("Erreur suppression : " + (err.detail || JSON.stringify(err)));
    return;
  }
  fetchAll();
};


  const handleConsultChange = (e) => {
  setConsultForm({
    ...consultForm,
    [e.target.name]: e.target.value
  });
};



const saveConsultation = async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("token") || localStorage.getItem("accessToken");

  // Créer payload compatible DRF
  const payload = {
    doctor: consultForm.doctor, // l'ID du doctor
    date_fin: consultForm.date_fin,
    montant: parseInt(consultForm.montant),
    n_places: parseInt(consultForm.n_places),
  };

  const res = await fetch(API_CONS_TEMP, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errData = await res.json();
    return alert("Erreur: " + JSON.stringify(errData));
  }

  const data = await res.json();
  console.log(data);

  alert("Consultation ajoutée");

  setConsultForm({
    doctor: "",
    date_fin: "",
    montant: "",
    n_places: ""
  });

  fetchAll();
};







  return (
    <div className="admin-container">
      {/* HEADER */}
      <header className="header">
        <div className="header-left">
          <Hospital size={50} color="#fff" />
          <div>
            <h1>Cabinet Médical</h1>
            <p>Dashboard Admin</p>
          </div>
        </div>
        <nav className="menu">
          <button onClick={() => setSection("doctors")}>Doctors</button>
          <button onClick={() => setSection("secretaires")}>Secrétaires</button>
          <button onClick={() => setSection("admins")}>Admins</button>
          <button onClick={() => setSection("consultations")}>Consultations payées</button>
          <button onClick={() => setSection("addConsultation")}> Consultation Temporaire</button>
          <button onClick={onLogout}><LogOut size={16} /> Déconnexion</button>
        </nav>
      </header>

      {/* FORMULAIRES */}
      {section === "doctors" && (
  <FormDoctor
    form={doctorForm}
    handleChange={handleChange}
    handlePhotoChange={handlePhotoChange} // ← ajout
    saveUser={() => saveUser("doctor")}
  />
)}
      {section === "secretaires" && (
        <FormSecretaire form={secretaireForm} handleChange={handleChange} saveUser={() => saveUser("secretaire")} />
      )}
      {section === "admins" && (
        <FormAdmin form={adminForm} handleChange={handleChange} saveUser={() => saveUser("admin")} />
      )}

      {/* TABLEAUX */}
      {section === "doctors" && <UserTable users={doctors} role="doctor" onEdit={editUser} onDelete={deleteUser} />}
      {section === "secretaires" && <UserTable users={secretaires} role="secretaire" onEdit={editUser} onDelete={deleteUser} />}
      {section === "admins" && <UserTable users={admins} role="admin" onEdit={editUser} onDelete={deleteUser} />}

      {section === "consultations" && (
        <section className="section card">
          <h2>Consultations Payées</h2>
<table className="reservation-table">
  <thead>
    <tr>
      <th>Patient</th>
      <th>Téléphone</th>
      <th>Date</th>
      <th>Doctor</th>
      <th>Spécialité</th>
      <th>Actions</th> {/* Nouvelle colonne pour actions */}
    </tr>
  </thead>
  <tbody>
{(consultationsPayees || []).map((c) => (
<tr key={c.id}>
<td>{c.nom_complet}</td>
<td>{c.numero_tel}</td>
<td>{new Date(c.date).toLocaleString()}</td>
<td>{c.doctor_name}</td>
<td>{c.specialite}</td>
<td>
<button
className="btn-action btn-red"
onClick={async () => {
const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
if (!token) {
  alert("Vous devez vous reconnecter !");
  return;
}
const res = await fetch(`${API_CONS_PAYE}${c.id}/`, {
  method: "DELETE",
  headers: { Authorization: "Bearer " + token }
});
if (res.ok) setConsultationsPayees(consultationsPayees.filter(x => x.id !== c.id));
else alert("Erreur lors de la suppression.");
}}
>
Supprimer
</button>
</td>
</tr>
))}
</tbody>
  
</table>

        </section>
 )}

      


{section === "addConsultation" && (
  <section className="section card">

    <h3>Ajouter Nouvelle Consultation</h3>
    <form className="form-grid" onSubmit={saveConsultation}>

<select
  name="doctor"
  value={consultForm.doctor}
  onChange={handleConsultChange}
  required
>
  <option value="">Choisir médecin</option>
  {(doctors || []).map((d) => {
    const id = d.id ?? d.pk;
    const name = d.user?.username ?? d.username ?? `Médecin #${id}`;
    const spec = d.specialite ?? "";
    if (id == null || id === "") return null;
    return (
      <option key={id} value={id}>
        {name}{spec ? ` (${spec})` : ""}
      </option>
    );
  })}
</select>

<input
  type="datetime-local"
  name="date_fin"
  value={consultForm.date_fin}
  onChange={handleConsultChange}
  required
/>

<input
  type="number"
  name="montant"
  placeholder="Montant"
  value={consultForm.montant}
  onChange={handleConsultChange}
  required
/>

<input
  type="number"
  name="n_places"
  placeholder="Places"
  value={consultForm.n_places}
  onChange={handleConsultChange}
  required
/>

<button type="submit" className="btn-submit">
Ajouter Consultation
</button>

</form>

    <br>
    </br>
    <h2>Consultations Temporaire </h2>

<table className="reservation-table">
        <thead>
          <tr>
            <th>doctor</th>
            <th>Date</th>
            <th>Spécialité</th>
            <th>Montant</th>
            <th>Places</th>
            <th>Actions</th>
          </tr>
        </thead>
       <tbody>
{(consultationsTemp || []).map((c) => (
<tr key={c.id}>
<td>
{c.doctor_photo && (
<img
src={c.doctor_photo}
alt={c.doctor_name}
style={{ width: 50, borderRadius: "50%" }}
/>
)}
{c.doctor_name}
</td>

<td>{new Date(c.date_fin).toLocaleString()}</td>
<td>{c.doctor_specialite}</td>
<td>{c.montant}</td>
<td>{c.n_places}</td>

<td>
<button
className="btn-action btn-red"
onClick={async () => {
const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
if (!token) {
  alert("Vous devez vous reconnecter !");
  return;
}
const res = await fetch(`${API_CONS_TEMP}${c.id}/`, {
  method: "DELETE",
  headers: { Authorization: "Bearer " + token }
});
if (res.ok) setConsultationsTemp(consultationsTemp.filter(x => x.id !== c.id));
else alert("Erreur lors de la suppression.");
}}
>
Supprimer
</button>
</td>
</tr>
))}
</tbody>

      {selectedConsultation && (
        <ReservationForm
          consultation={selectedConsultation}
          onClose={() => setSelectedConsultation(null)}
        />
  )}
    </table>
    
  </section>
)}

    </div>
  );

}



/* =========================
   FORMULAIRES PAR RÔLE
========================= */
const FormDoctor = ({ form, handleChange, saveUser , handlePhotoChange }) => (
  <section className="section card">
    <h2>{form.id ? "Modifier" : "Ajouter"} Doctor</h2>
    <div className="form-grid">

  <div className="input-group">
    
    <div className="input-icon">
      <User size={18} />
     <input
  type="text"
  name="username"
  placeholder="Nom complet"
  value={form.username}
  onChange={(e) => handleChange(e, "doctor")}
  />
    </div>
  </div>

  <div className="input-group">
   
    <div className="input-icon">
      <Mail size={18} />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => handleChange(e, "doctor")}
      />
    </div>
  </div>

  <div className="input-group">
    
    <div className="input-icon">
      <Phone size={18} />
      <input
        type="text"
        name="numero_tel"
        placeholder="Téléphone"
        value={form.numero_tel}
        onChange={(e) => handleChange(e, "doctor")}
      />
    </div>
  </div>

    <div className="input-group">
    
    <div className="input-icon">
      <Phone size={18} />
      <input
        type="date"
        name="date_disponible"
        placeholder="date-disponible"
        value={form.date_disponible}
        onChange={(e) => handleChange(e, "doctor")}
      />
    </div>
  </div>

  <div className="input-group">
    
    <div className="input-icon">
      <Image size={18} />
      <input
  type="file"
  name="photo"
  accept="image/*"
  onChange={handlePhotoChange}
/>
    </div>
  </div>

  <div className="input-group">
    
    <div className="input-icon">
      <Stethoscope size={18} />
      <input
        type="text"
        name="specialite"
        placeholder="Spécialité"
        value={form.specialite}
        onChange={(e) => handleChange(e, "doctor")}
      />
    </div>
  </div>

  

  <div className="input-group">
    
    <div className="input-icon">
      <Lock size={18} />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) => handleChange(e, "doctor")}
      />
    </div>
  </div>

  <button className="btn-submit" onClick={saveUser}>
    {form.id ? "Modifier" : "Créer"}
  </button>

</div>
  </section>
);

const FormSecretaire = ({ form, handleChange, saveUser }) => (
  <section className="section card">
    <h2>{form.id ? "Modifier" : "Ajouter"} Secrétaire</h2>
   <div className="form-grid">

  <div className="input-group">
    <div className="input-icon">
      <User size={18} />
      <input
  type="text"
  name="username"
  placeholder="Nom complet"
  value={form.username}
  onChange={(e) => handleChange(e, "secretaire")}
/>
    </div>
  </div>

  <div className="input-group">
   
    <div className="input-icon">
      <Mail size={18} />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => handleChange(e, "secretaire")}
      />
    </div>
  </div>

  <div className="input-group">
    <div className="input-icon">
      <Phone size={18} />
      <input
  type="text"
  name="numero_tel"
  placeholder="Téléphone"
  value={form.numero_tel}
  onChange={(e) => handleChange(e, "secretaire")}
/>
    </div>
  </div>

  
 

  <div className="input-group">
    <div className="input-icon">
      <Lock size={18} />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) => handleChange(e, "secretaire")}
      />
    </div>
  </div>

  <button className="btn-submit" onClick={saveUser}>
    {form.id ? "Modifier" : "Créer"}
  </button>

</div>
  </section>
);




const FormAdmin = ({ form, handleChange, saveUser }) => (
  <section className="section card">
    <h2>{form.id ? "Modifier" : "Ajouter"} Admin</h2>
    <div className="form-grid">

  <div className="input-group">

    <div className="input-icon">
      <User size={18} />
      <input
  type="text"
  name="username"
  placeholder="Nom complet"
  value={form.username}
  onChange={(e) => handleChange(e, "admin")}
/>
    </div>
  </div>

  <div className="input-group">
    <div className="input-icon">
      <Mail size={18} />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => handleChange(e, "admin")}
      />
    </div>
  </div>

  <div className="input-group">
    <div className="input-icon">
      <Phone size={18} />
      <input
  type="text"
  name="numero_tel"
  placeholder="Téléphone"
  value={form.numero_tel}
  onChange={(e) => handleChange(e, "admin")}
/>
    </div>
  </div>

 

  <div className="input-group">
    <div className="input-icon">
      <Lock size={18} />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) => handleChange(e, "admin")}
      />
    </div>
  </div>

  <button className="btn-submit" onClick={saveUser}>
    {form.id ? "Modifier" : "Créer"}
  </button>

</div>
  </section>
);

/* =========================
   TABLEAU UTILISATEURS
========================= */
function UserTable({ users, role, onEdit, onDelete }) {
  return (
    <section className="section cards-grid">
      {(users || []).map((u) => {
        const id = u.id ?? u.pk;
        const name = u.user?.username ?? u.username ?? "";
        const email = u.user?.email ?? u.email ?? "";
        return (
          <div className="card" key={id}>
            {role === "doctor" && (u.photo || u.user?.photo) && (
              <img
                src={u.photo ? `${MEDIA_BASE_URL}${u.photo}` : (u.user?.photo ? `${MEDIA_BASE_URL}${u.user.photo}` : "")}
                alt=""
                className="user-photo"
              />
            )}
            {role === "doctor" && !u.photo && !u.user?.photo && (
              <div className="user-photo user-photo-placeholder" />
            )}
            <h3>{name || "Sans nom"}</h3>
            <div>Email: {email}</div>
            <div>Téléphone: {u.numero_tel}</div>
            {role === "doctor" && <div>Spécialité: {u.specialite}</div>}
            <div className="card-buttons">
              <button type="button" className="btn-action btn-green" onClick={() => onEdit(u, role)}><Edit size={16} /> Modifier</button>
              {role !== "admin" && (
                <button type="button" className="btn-action btn-red" onClick={() => onDelete(id, role)}><Trash2 size={16} /> Supprimer</button>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}

export default AdminDashboard;
