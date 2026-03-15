import React, { useEffect, useState } from "react";
import { 
  Hospital, LogOut, Edit, Trash2, Phone, Image as ImageIcon, 
  Stethoscope, Plus, Calendar, Clock, CreditCard, User, Activity
} from "lucide-react";
import { API_BASE_URL, MEDIA_BASE_URL } from "../api/config";
import "./Admin.css";

const API_DOCTORS = `${API_BASE_URL}/doctors/`;
const API_SECRETAIRES = `${API_BASE_URL}/secreteurs/`;
const API_ADMINS = `${API_BASE_URL}/administrations/`;
const API_CONS_PAYE = `${API_BASE_URL}/consultations-payees/`;
const API_CONS_TEMP = `${API_BASE_URL}/consultations-temporaires/`;

export default function AdminDashboard({ onLogout }) {
  const [section, setSection] = useState("doctors");
  const [photoPreview, setPhotoPreview] = useState(null);
  
  const [doctors, setDoctors] = useState([]);
  const [secretaires, setSecretaires] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [consultationsPayees, setConsultationsPayees] = useState([]);
  const [consultationsTemp, setConsultationsTemp] = useState([]);

  const [doctorForm, setDoctorForm] = useState({ id: null, username: "", email: "", numero_tel: "", specialite: "", date_disponible: "", password: "", photo: null });
  const [secretaireForm, setSecretaireForm] = useState({ id: null, username: "", email: "", numero_tel: "", password: "" });
  const [adminForm, setAdminForm] = useState({ id: null, username: "", email: "", numero_tel: "", password: "" });
  const [consultForm, setConsultForm] = useState({ doctor: "", date_fin: "", montant: "", n_places: "" });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDoctorForm({ ...doctorForm, photo: file });
      setPhotoPreview(URL.createObjectURL(file)); 
    }
  };

  const fetchAll = async () => {
  const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
  if (!token) return;
  
  const headers = { Authorization: "Bearer " + token };
  
  const getSafeData = async (url) => {
    try {
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
      const data = await res.json();
      // On gère le format DRF pagination (data.results) ou liste simple
      return Array.isArray(data) ? data : (data.results || []);
    } catch (e) { 
      console.error("Erreur lors de la récupération sur :", url, e);
      return []; 
    }
  };

  const docs = await getSafeData(API_DOCTORS);
  const secr = await getSafeData(API_SECRETAIRES);
  const adms = await getSafeData(API_ADMINS);
  const paye = await getSafeData(API_CONS_PAYE);
  const temp = await getSafeData(API_CONS_TEMP);

  setDoctors(docs);
  setSecretaires(secr);
  setAdmins(adms);
  setConsultationsPayees(paye);
  setConsultationsTemp(temp);
};
  

  useEffect(() => { fetchAll(); }, []);

  const handleSave = async (role) => {
    let config = {
      doctor: { form: doctorForm, api: API_DOCTORS, reset: setDoctorForm, init: { id: null, username: "", email: "", numero_tel: "", specialite: "", date_disponible: "", password: "", photo: null } },
      secretaire: { form: secretaireForm, api: API_SECRETAIRES, reset: setSecretaireForm, init: { id: null, username: "", email: "", numero_tel: "", password: "" } },
      admin: { form: adminForm, api: API_ADMINS, reset: setAdminForm, init: { id: null, username: "", email: "", numero_tel: "", password: "" } }
    }[role];

    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
    let headers = { Authorization: "Bearer " + token };
    const isNew = !config.form.id;
    const dataToSend = { ...config.form };

    if (isNew && role === "doctor") {
      dataToSend.id = "DOC-" + Date.now();
    }

    let body;
    if (role === "doctor") {
      body = new FormData();
      Object.keys(dataToSend).forEach(key => {
        if (key === 'photo' && (typeof dataToSend[key] === 'string' || dataToSend[key] === null)) return;
        if (key === 'password' && !dataToSend[key]) return; // Ne pas envoyer le password s'il est vide en modification
        if (dataToSend[key] !== null && dataToSend[key] !== "") body.append(key, dataToSend[key]);
      });
    } else {
      if (isNew) delete dataToSend.id; 
      if (!dataToSend.password) delete dataToSend.password; // Ne pas envoyer password vide
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(dataToSend);
    }

    try {
      const res = await fetch(isNew ? config.api : `${config.api}${config.form.id}/`, {
        method: isNew ? "POST" : "PUT", headers, body
      });
      if (res.ok) {
        alert("Enregistré !");
        setPhotoPreview(null);
        config.reset(config.init);
        fetchAll();
      } else {
        const err = await res.json();
        alert("Erreur: " + JSON.stringify(err));
      }
    } catch (e) { alert("Erreur de connexion"); }
  };

  const handleEdit = (u, role) => {
    // On extrait les données de l'objet imbriqué 'user' envoyé par le Serializer
    const userData = u.user || {};

    const common = { 
        id: u.id, 
        username: userData.username || u.username || "", 
        email: userData.email || u.email || "", 
        numero_tel: u.numero_tel || "", 
        password: "" // On laisse vide pour ne pas écraser l'ancien
    };
    
    if (role === "doctor") {
      setDoctorForm({ 
        ...common, 
        specialite: u.specialite || "", 
        date_disponible: u.date_disponible || "" 
      });
      // Gestion de la photo
      setPhotoPreview(u.photo ? (u.photo.startsWith('http') ? u.photo : `${MEDIA_BASE_URL}${u.photo}`) : null);
      setSection("doctors");
    } 
    else if (role === "secretaire") {
      setSecretaireForm(common);
      setSection("secretaires");
    }
    else if (role === "admin") {
      setAdminForm(common);
      setSection("admins");
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
};
  const handleDelete = async (id, roleApi) => {
    if (!window.confirm("Supprimer ?")) return;
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
    await fetch(`${roleApi}${id}/`, { method: "DELETE", headers: { Authorization: "Bearer " + token } });
    fetchAll();
  };

  const saveConsultation = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
    const res = await fetch(API_CONS_TEMP, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ ...consultForm, montant: parseInt(consultForm.montant), n_places: parseInt(consultForm.n_places) })
    });
    if (res.ok) { alert("Planning ajouté !"); setConsultForm({ doctor: "", date_fin: "", montant: "", n_places: "" }); fetchAll(); }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <aside className="w-64 bg-[#0f172a] text-white p-5 flex flex-col shadow-2xl">
        <div className="flex items-center gap-3 text-blue-400 font-black text-xl mb-10 px-2">
          <div className="bg-blue-500/20 p-2 rounded-lg"><Hospital size={24}/></div>
          <span className="tracking-tight uppercase">CABINET</span>
        </div>
        <nav className="flex-1 space-y-1">
          {[{id:"doctors",label:"Médecins",icon:<Stethoscope size={18}/>},{id:"secretaires",label:"Secrétaires",icon:<User size={18}/>},{id:"admins",label:"Admins",icon:<Activity size={18}/>},{id:"paiements",label:"Paiements",icon:<CreditCard size={18}/>},{id:"planning",label:"Planning",icon:<Calendar size={18}/>}].map((item) => (
            <button key={item.id} onClick={() => setSection(item.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-xs font-bold ${section === item.id ? 'bg-blue-600 shadow-lg' : 'hover:bg-white/5 opacity-60'}`}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <button onClick={onLogout} className="flex items-center gap-3 text-red-400 p-3 w-full hover:bg-red-500/10 rounded-xl mt-auto font-bold text-xs"><LogOut size={18}/> Déconnexion</button>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase">{section}</h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Administration du cabinet</p>
          </div>
          {section === "paiements" && (
            <div className="bg-blue-600 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
              <CreditCard size={16} />
              <span className="font-black text-md">
                {consultationsPayees.reduce((acc, curr) => acc + (Number(curr.montant) || 0), 0)} MRU
              </span>
            </div>
          )}
        </header>

        {["doctors", "secretaires", "admins"].includes(section) && (
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 mb-8 flex gap-6 items-start">
             <div className="flex-1 grid grid-cols-3 gap-4">
               <input className="bg-slate-50 p-3 rounded-xl text-xs border-0" placeholder="Nom d'utilisateur" value={section === "doctors" ? doctorForm.username : section === "secretaires" ? secretaireForm.username : adminForm.username} onChange={(e) => section === "doctors" ? setDoctorForm({...doctorForm, username: e.target.value}) : section === "secretaires" ? setSecretaireForm({...secretaireForm, username: e.target.value}) : setAdminForm({...adminForm, username: e.target.value})} />
               <input className="bg-slate-50 p-3 rounded-xl text-xs border-0" placeholder="Email" value={section === "doctors" ? doctorForm.email : section === "secretaires" ? secretaireForm.email : adminForm.email} onChange={(e) => section === "doctors" ? setDoctorForm({...doctorForm, email: e.target.value}) : section === "secretaires" ? setSecretaireForm({...secretaireForm, email: e.target.value}) : setAdminForm({...adminForm, email: e.target.value})} />
               <input className="bg-slate-50 p-3 rounded-xl text-xs border-0" placeholder="Téléphone" value={section === "doctors" ? doctorForm.numero_tel : section === "secretaires" ? secretaireForm.numero_tel : adminForm.numero_tel} onChange={(e) => section === "doctors" ? setDoctorForm({...doctorForm, numero_tel: e.target.value}) : section === "secretaires" ? setSecretaireForm({...secretaireForm, numero_tel: e.target.value}) : setAdminForm({...adminForm, numero_tel: e.target.value})} />
               {section === "doctors" && (
                 <>
                  <input className="bg-slate-50 p-3 rounded-xl text-xs border-0" placeholder="Spécialité" value={doctorForm.specialite} onChange={(e) => setDoctorForm({...doctorForm, specialite: e.target.value})} />
                  <input className="bg-slate-50 p-3 rounded-xl text-xs border-0" type="date" value={doctorForm.date_disponible} onChange={(e) => setDoctorForm({...doctorForm, date_disponible: e.target.value})} />
                  <input className="text-[10px] mt-1" type="file" accept="image/*" onChange={handlePhotoChange} />
                 </>
               )}
               <input className="bg-slate-50 p-3 rounded-xl text-xs border-0" type="password" placeholder="Nouveau mot de passe (optionnel)" value={section === "doctors" ? doctorForm.password : section === "secretaires" ? secretaireForm.password : adminForm.password} onChange={(e) => section === "doctors" ? setDoctorForm({...doctorForm, password: e.target.value}) : section === "secretaires" ? setSecretaireForm({...secretaireForm, password: e.target.value}) : setAdminForm({...adminForm, password: e.target.value})} />
               <button onClick={() => handleSave(section === "secretaires" ? "secretaire" : section.slice(0,-1))} className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md hover:bg-blue-700">Enregistrer</button>
             </div>
             {section === "doctors" && (
               <div className="w-28 h-28 border-2 border-white shadow-md rounded-2xl flex items-center justify-center overflow-hidden bg-slate-100 shrink-0">
                 {photoPreview ? <img src={photoPreview} className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-300" size={30} />}
               </div>
             )}
          </div>
        )}

        {/* SECTION PAIEMENTS */}
        {section === "paiements" && (
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-slate-100">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-[9px] uppercase font-black text-slate-400">
                    <th className="p-4 pl-8">Patient & Docteur</th>
                    <th className="p-4 text-center">Date</th>
                    <th className="p-4 text-center">NNI</th>
                    <th className="p-4 text-right pr-8">Montant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {consultationsPayees.map((c) => {
                    const doc = doctors.find(d => String(d.id) === String(c.doctor));
                    const docName = doc?.user?.username || doc?.username || "Médecin";
                    return (
                      <tr key={c.id} className="hover:bg-blue-50/30 transition-all">
                        <td className="p-4 pl-8">
                          <p className="font-bold text-slate-800">{c.nom_complet}</p>
                          <p className="text-[9px] text-blue-500 font-bold italic uppercase">avec Dr. {docName}</p>
                        </td>
                        <td className="p-4 text-center text-slate-500">
                          {new Date(c.date).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-center font-mono text-slate-400">#{c.NNI}</td>
                        <td className="p-4 text-right pr-8 font-black">{c.montant} MRU</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
          </div>
        )}

        {/* SECTION PLANNING */}
        {section === "planning" && (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-lg h-fit">
              <h2 className="font-black text-lg mb-4 flex items-center gap-2"><Plus size={18} className="text-blue-500"/> Planning</h2>
              <form onSubmit={saveConsultation} className="space-y-4 text-xs">
                <select className="w-full bg-slate-50 p-3 rounded-xl border-0" value={consultForm.doctor} onChange={e => setConsultForm({...consultForm, doctor: e.target.value})} required>
                  <option value="">Médecin</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.user?.username || d.username}</option>)}
                </select>
                <input type="datetime-local" className="w-full bg-slate-50 p-3 rounded-xl border-0" value={consultForm.date_fin} onChange={e => setConsultForm({...consultForm, date_fin: e.target.value})} required />
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Prix" className="bg-slate-50 p-3 rounded-xl border-0" value={consultForm.montant} onChange={e => setConsultForm({...consultForm, montant: e.target.value})} required />
                  <input type="number" placeholder="Places" className="bg-slate-50 p-3 rounded-xl border-0" value={consultForm.n_places} onChange={e => setConsultForm({...consultForm, n_places: e.target.value})} required />
                </div>
                <button className="w-full bg-slate-900 text-white p-3 rounded-xl font-bold hover:bg-black transition-all">Publier</button>
              </form>
            </div>
            <div className="col-span-8 space-y-3">
              {consultationsTemp.map(c => (
                <div key={c.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
                   <div className="flex items-center gap-3">
                      <div className="bg-blue-50 p-2 rounded-xl text-blue-600"><Calendar size={18}/></div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">Dr. {doctors.find(d => d.id === c.doctor)?.user?.username || "Médecin"}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{new Date(c.date_fin).toLocaleString()}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-blue-600 font-black text-lg">{c.montant} MRU</p>
                      <p className="text-[9px] uppercase font-bold text-slate-400">{c.n_places} places</p>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LISTES CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
          {section === "doctors" && doctors.map(u => <UserCard key={u.id} user={u} role="Médecin" onEdit={() => handleEdit(u, "doctor")} onDelete={() => handleDelete(u.id, API_DOCTORS)} />)}
          {section === "secretaires" && secretaires.map(u => <UserCard key={u.id} user={u} role="Secrétaire" onEdit={() => handleEdit(u, "secretaire")} onDelete={() => handleDelete(u.id, API_SECRETAIRES)} />)}
          {section === "admins" && admins.map(u => <UserCard key={u.id} user={u} role="Admin" onEdit={() => handleEdit(u, "admin")} onDelete={() => handleDelete(u.id, API_ADMINS)} />)}
        </div>
      </main>
    </div>
  );
}

function UserCard({ user, role, onEdit, onDelete }) {
  const name = user.user?.username || user.username || "Sans nom";
  const photoUrl = user.photo ? (user.photo.startsWith('http') ? user.photo : `${MEDIA_BASE_URL}${user.photo}`) : null;

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-3 mb-4">
        {photoUrl ? <img src={photoUrl} className="w-10 h-10 rounded-xl object-cover" /> : <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-black text-xs uppercase">{name.charAt(0)}</div>}
        <div>
          <h3 className="font-bold text-slate-800 text-xs truncate w-24">{name}</h3>
          <span className="text-[8px] text-blue-500 font-black uppercase tracking-widest">{role}</span>
        </div>
      </div>
      <div className="space-y-2 mb-4 text-[10px]">
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg"><Phone size={12} className="text-slate-400"/> {user.numero_tel || "N/A"}</div>
        {user.specialite && <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg font-bold text-blue-600 uppercase"><Stethoscope size={12}/> {user.specialite}</div>}
      </div>
      <div className="flex gap-2">
        <button onClick={onEdit} className="flex-1 bg-slate-900 text-white py-2 rounded-xl text-[10px] font-bold">Modifier</button>
        <button onClick={() => onDelete(user.id)} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14}/></button>
      </div>
    </div>
  );
}