import React, { useEffect, useState } from "react";
import {
  Hospital, LogOut, Edit3, Trash2, Phone, Image as ImageIcon,
  Stethoscope, Plus, Calendar, CreditCard, User,
  ShieldCheck, Users, TrendingUp, Search, X, Save, Eye, EyeOff,
  Mail, Lock, ChevronRight, LayoutDashboard, CheckCircle,
  AlertTriangle, Info, Menu,
} from "lucide-react";
import { API_BASE_URL, MEDIA_BASE_URL } from "../api/config";

const API_DOCTORS     = `${API_BASE_URL}/doctors/`;
const API_SECRETAIRES = `${API_BASE_URL}/secreteurs/`;
const API_ADMINS      = `${API_BASE_URL}/administrations/`;
const API_CONS_PAYE   = `${API_BASE_URL}/consultations-payees/`;
const API_CONS_TEMP   = `${API_BASE_URL}/consultations-temporaires/`;

const C = {
  dark:  "#111827", navy: "#1e293b", blue: "#6366f1", blue2: "#4f46e5",
  light: "#eef2ff", border: "#e2e8f0", muted: "#64748b", bg: "#f8fafc",
  success: "#10b981", danger: "#ef4444", warn: "#f59e0b",
};

const INIT = {
  doctor:     { id: null, username: "", email: "", numero_tel: "", specialite: "", date_disponible: "", password: "", photo: null },
  secretaire: { id: null, username: "", email: "", numero_tel: "", password: "" },
  admin:      { id: null, username: "", email: "", numero_tel: "", password: "" },
};

const statutCfg = {
  valide:     { bg: "#d1fae5", color: "#065f46", label: "Validé",     dot: "#10b981" },
  rejete:     { bg: "#fee2e2", color: "#991b1b", label: "Rejeté",     dot: "#ef4444" },
  en_attente: { bg: "#fef3c7", color: "#92400e", label: "En attente", dot: "#f59e0b" },
  en_especes: { bg: "#ede9fe", color: "#5b21b6", label: "En espèces", dot: "#8b5cf6" },
};

/* ── Toast ── */
function Toast({ toasts, removeToast }) {
  return (
    <div style={{ position:"fixed", bottom:"20px", right:"16px", zIndex:99999, display:"flex", flexDirection:"column", gap:"10px", pointerEvents:"none", maxWidth:"calc(100vw - 32px)" }}>
      {toasts.map(t => {
        const cfg = {
          success: { bg:"#0d1f0d", icon:<CheckCircle size={18} color="#10b981"/>, bar:"#10b981" },
          error:   { bg:"#1a0808", icon:<X size={18} color="#ef4444"/>,           bar:"#ef4444" },
          warn:    { bg:"#1a1200", icon:<AlertTriangle size={18} color="#f59e0b"/>,bar:"#f59e0b" },
          info:    { bg:"#0a0f1e", icon:<Info size={18} color="#38bdf8"/>,         bar:"#38bdf8" },
        }[t.type] || { bg:"#0a0f1e", icon:<Info size={18} color="#38bdf8"/>, bar:"#38bdf8" };
        return (
          <div key={t.id} style={{ background:cfg.bg, color:"white", borderRadius:"14px", padding:"12px 16px", display:"flex", alignItems:"flex-start", gap:"10px", width:"min(340px,calc(100vw-32px))", boxShadow:"0 8px 32px rgba(0,0,0,0.45)", pointerEvents:"all", animation:"toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1)", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", left:0, top:0, bottom:0, width:"4px", background:cfg.bar, borderRadius:"14px 0 0 14px" }}/>
            <div style={{ width:"32px", height:"32px", borderRadius:"9px", flexShrink:0, background:"rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"center" }}>{cfg.icon}</div>
            <div style={{ flex:1 }}>
              <p style={{ margin:0, fontWeight:"700", fontSize:"13px" }}>{t.title}</p>
              {t.msg && <p style={{ margin:"2px 0 0", fontSize:"11px", color:"rgba(255,255,255,0.5)", lineHeight:1.4 }}>{t.msg}</p>}
            </div>
            <button onClick={() => removeToast(t.id)} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.3)", cursor:"pointer", padding:"2px", display:"flex", flexShrink:0 }}><X size={13}/></button>
          </div>
        );
      })}
    </div>
  );
}
function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = (type, title, msg) => {
    const id = Date.now();
    setToasts(p => [...p, { id, type, title, msg }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4500);
  };
  const remove = id => setToasts(p => p.filter(t => t.id !== id));
  return { toasts, remove, success:(t,m)=>add("success",t,m), error:(t,m)=>add("error",t,m), warn:(t,m)=>add("warn",t,m), info:(t,m)=>add("info",t,m) };
}

/* ── Field ── */
function Field({ label, icon, type="text", placeholder, value, onChange, hint }) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  const isPwd = type === "password";
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"5px" }}>
      <label style={{ fontSize:"10px", fontWeight:"700", color:C.muted, textTransform:"uppercase", letterSpacing:"1px", display:"flex", alignItems:"center", gap:"4px" }}>
        {icon && React.cloneElement(icon, { size:11, color:C.blue })} {label}
      </label>
      <div style={{ position:"relative" }}>
        <input type={isPwd?(show?"text":"password"):type} placeholder={placeholder} value={value} onChange={onChange}
          onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
          autoComplete={isPwd?"new-password":"off"}
          style={{ width:"100%", padding:isPwd?"10px 40px 10px 13px":"10px 13px", background:focused?"#fff":"#f6f9fd", border:`2px solid ${focused?"#6366f1":C.border}`, borderRadius:"11px", fontSize:"13px", outline:"none", color:"#1e293b", boxSizing:"border-box", transition:"all 0.2s", boxShadow:focused?"0 0 0 4px rgba(99,102,241,0.1)":"none", fontFamily:"inherit" }}/>
        {isPwd && <button type="button" onClick={()=>setShow(s=>!s)} style={{ position:"absolute", right:"11px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.muted, display:"flex" }}>{show?<EyeOff size={14}/>:<Eye size={14}/>}</button>}
      </div>
      {hint && <p style={{ margin:0, fontSize:"10px", color:"#94a3b8" }}>{hint}</p>}
    </div>
  );
}

/* ── FormModal ── */
function FormModal({ formModal, setFormModal, doctorForm, setDoctorForm, secretaireForm, setSecretaireForm, adminForm, setAdminForm, photoPreview, setPhotoPreview, saving, handleSave }) {
  if (!formModal) return null;
  const { role, isEdit } = formModal;
  const labels = { doctor:"Médecin", secretaire:"Secrétaire", admin:"Administrateur" };
  const form = role==="doctor"?doctorForm:role==="secretaire"?secretaireForm:adminForm;
  const upd = (k,v) => {
    if (role==="doctor") setDoctorForm(p=>({...p,[k]:v}));
    else if (role==="secretaire") setSecretaireForm(p=>({...p,[k]:v}));
    else setAdminForm(p=>({...p,[k]:v}));
  };
  const cfgs = {
    doctor:     { icon:<Stethoscope size={19} color="white"/>, grad:"linear-gradient(135deg,#4f46e5,#6366f1)" },
    secretaire: { icon:<User size={19} color="white"/>,        grad:"linear-gradient(135deg,#134e4a,#0d9488)" },
    admin:      { icon:<ShieldCheck size={19} color="white"/>, grad:"linear-gradient(135deg,#312e81,#6366f1)" },
  };
  const cfg = cfgs[role];
  return (
    <div style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(10,15,30,0.65)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"12px" }}>
      <div style={{ background:"white", width:"100%", maxWidth:"580px", borderRadius:"20px", overflow:"hidden", boxShadow:"0 40px 100px rgba(0,0,0,0.3)", animation:"slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)", maxHeight:"95vh", display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"20px 24px", background:cfg.grad, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
            <div style={{ width:"42px", height:"42px", background:"rgba(255,255,255,0.18)", borderRadius:"11px", display:"flex", alignItems:"center", justifyContent:"center" }}>{cfg.icon}</div>
            <div>
              <p style={{ margin:0, color:"white", fontWeight:"800", fontSize:"15px" }}>{isEdit?"Modifier":"Ajouter"} — {labels[role]}</p>
              <p style={{ margin:0, color:"rgba(255,255,255,0.55)", fontSize:"11px" }}>{isEdit?"Modifiez les informations ci-dessous":"Remplissez tous les champs requis"}</p>
            </div>
          </div>
          <button onClick={()=>setFormModal(null)} style={{ background:"rgba(255,255,255,0.15)", border:"none", color:"white", width:"34px", height:"34px", borderRadius:"9px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><X size={16}/></button>
        </div>
        <div style={{ padding:"22px 24px 24px", overflowY:"auto", flex:1 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:"14px" }}>
            <Field label="Nom d'utilisateur" icon={<User/>} placeholder="ex: ahmed_doc" value={form.username} onChange={e=>upd("username",e.target.value)}/>
            <Field label="Email" icon={<Mail/>} type="email" placeholder="email@exemple.com" value={form.email} onChange={e=>upd("email",e.target.value)}/>
            <Field label="Téléphone" icon={<Phone/>} type="tel" placeholder="4x xx xx xx" value={form.numero_tel} onChange={e=>upd("numero_tel",e.target.value)}/>
            <Field label={isEdit?"Nouveau mot de passe (optionnel)":"Mot de passe"} icon={<Lock/>} type="password" placeholder={isEdit?"Laisser vide = inchangé":"Minimum 8 caractères"} hint={isEdit?"Laissez vide pour ne pas modifier":""} value={form.password} onChange={e=>upd("password",e.target.value)}/>
            {role==="doctor" && <>
              <Field label="Spécialité" icon={<Stethoscope/>} placeholder="Cardiologie..." value={form.specialite} onChange={e=>upd("specialite",e.target.value)}/>
              <div style={{ display:"flex", flexDirection:"column", gap:"5px" }}>
                <label style={{ fontSize:"10px", fontWeight:"700", color:C.muted, textTransform:"uppercase", letterSpacing:"1px", display:"flex", alignItems:"center", gap:"4px" }}><Calendar size={11} color={C.blue}/> Date disponible</label>
                <input type="date" value={form.date_disponible} onChange={e=>upd("date_disponible",e.target.value)} style={{ padding:"10px 13px", background:"#f6f9fd", border:`2px solid ${C.border}`, borderRadius:"11px", fontSize:"13px", outline:"none", color:"#1e293b", fontFamily:"inherit", boxSizing:"border-box", width:"100%" }}/>
              </div>
            </>}
          </div>
          {role==="doctor" && (
            <div style={{ marginTop:"16px" }}>
              <label style={{ fontSize:"10px", fontWeight:"700", color:C.muted, textTransform:"uppercase", letterSpacing:"1px", display:"flex", alignItems:"center", gap:"4px", marginBottom:"8px" }}><ImageIcon size={11} color={C.blue}/> Photo de profil</label>
              <div style={{ display:"flex", alignItems:"center", gap:"12px", flexWrap:"wrap" }}>
                <label style={{ cursor:"pointer", display:"flex", alignItems:"center", gap:"8px", padding:"10px 18px", background:"#f6f9fd", border:`2px dashed ${C.border}`, borderRadius:"11px", fontSize:"13px", color:C.muted, fontWeight:"600" }}>
                  <ImageIcon size={14} color={C.blue}/> Choisir une photo
                  <input type="file" accept="image/*" style={{ display:"none" }} onChange={e=>{ const f=e.target.files[0]; if(f){upd("photo",f);setPhotoPreview(URL.createObjectURL(f));} }}/>
                </label>
                {photoPreview && <div style={{ position:"relative" }}>
                  <img src={photoPreview} alt="" style={{ width:"50px", height:"50px", borderRadius:"12px", objectFit:"cover", border:`2px solid ${C.border}` }}/>
                  <button onClick={()=>{setPhotoPreview(null);upd("photo",null);}} style={{ position:"absolute", top:"-6px", right:"-6px", width:"18px", height:"18px", background:C.danger, border:"2px solid white", borderRadius:"50%", color:"white", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"9px" }}>✕</button>
                </div>}
              </div>
            </div>
          )}
          <div style={{ height:"1px", background:C.border, margin:"20px 0" }}/>
          <div style={{ display:"flex", gap:"10px" }}>
            <button onClick={()=>setFormModal(null)} style={{ flex:1, padding:"12px", background:"#f1f5f9", border:"none", borderRadius:"11px", color:C.muted, fontWeight:"700", fontSize:"13px", cursor:"pointer" }}>Annuler</button>
            <button onClick={()=>handleSave(role)} disabled={saving} style={{ flex:2, padding:"12px", background:saving?"#94a3b8":cfg.grad, border:"none", borderRadius:"11px", color:"white", fontWeight:"800", fontSize:"13px", cursor:saving?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", boxShadow:saving?"none":"0 4px 14px rgba(99,102,241,0.3)" }}>
              {saving?<><div style={{ width:"15px", height:"15px", border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"white", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/> Enregistrement...</>:<><Save size={14}/> {isEdit?"Enregistrer les modifications":"Créer le compte"}</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── DeleteModal ── */
function DeleteModal({ deleteModal, setDeleteModal, handleDelete }) {
  if (!deleteModal) return null;
  return (
    <div style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(10,15,30,0.65)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"12px" }}>
      <div style={{ background:"white", width:"100%", maxWidth:"360px", borderRadius:"20px", padding:"28px", textAlign:"center", boxShadow:"0 30px 70px rgba(0,0,0,0.25)", animation:"slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)" }}>
        <div style={{ width:"58px", height:"58px", background:"linear-gradient(135deg,#fee2e2,#fecaca)", borderRadius:"16px", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", boxShadow:"0 4px 14px rgba(239,68,68,0.2)" }}><Trash2 size={26} color={C.danger}/></div>
        <h3 style={{ margin:"0 0 8px", fontSize:"17px", fontWeight:"800", color:C.navy }}>Confirmer la suppression</h3>
        <p style={{ margin:"0 0 22px", fontSize:"13px", color:C.muted, lineHeight:1.5 }}>Cette action est irréversible.</p>
        <div style={{ display:"flex", gap:"10px" }}>
          <button onClick={()=>setDeleteModal(null)} style={{ flex:1, padding:"12px", background:"#f1f5f9", border:"none", borderRadius:"11px", color:C.muted, fontWeight:"700", fontSize:"13px", cursor:"pointer" }}>Annuler</button>
          <button onClick={()=>handleDelete(deleteModal.id,deleteModal.api)} style={{ flex:1, padding:"12px", background:"linear-gradient(135deg,#dc2626,#ef4444)", border:"none", borderRadius:"11px", color:"white", fontWeight:"800", fontSize:"13px", cursor:"pointer", boxShadow:"0 4px 14px rgba(239,68,68,0.35)" }}>Supprimer</button>
        </div>
      </div>
    </div>
  );
}

/* ── UserCard ── */
function UserCard({ user, role, onEdit, onDelete }) {
  const name     = user.user?.username || user.username || "Sans nom";
  const email    = user.user?.email || user.email || "";
  const photoUrl = user.photo?(user.photo.startsWith("http")?user.photo:`${MEDIA_BASE_URL}${user.photo}`):null;
  const initials = name.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2);
  const rs = { "Médecin":{bg:"#eef2ff",color:"#4f46e5",grad:"linear-gradient(135deg,#4f46e5,#6366f1)"},"Secrétaire":{bg:"#ccfbf1",color:"#0f766e",grad:"linear-gradient(135deg,#134e4a,#0d9488)"},"Admin":{bg:"#e0e7ff",color:"#3730a3",grad:"linear-gradient(135deg,#312e81,#6366f1)"} }[role]||{bg:"#f1f5f9",color:"#475569",grad:"linear-gradient(135deg,#334155,#64748b)"};
  return (
    <div className="user-card" style={{ background:"white", borderRadius:"16px", padding:"18px", border:`1px solid ${C.border}`, boxShadow:"0 2px 10px rgba(0,0,0,0.06)", display:"flex", flexDirection:"column", gap:"12px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"11px" }}>
        {photoUrl?<img src={photoUrl} style={{ width:"46px", height:"46px", borderRadius:"12px", objectFit:"cover", border:`2px solid ${C.border}`, flexShrink:0 }} alt=""/>
          :<div style={{ width:"46px", height:"46px", background:rs.grad, borderRadius:"12px", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:"800", fontSize:"15px", flexShrink:0, boxShadow:"0 4px 10px rgba(0,0,0,0.2)" }}>{initials}</div>}
        <div style={{ overflow:"hidden", flex:1 }}>
          <p style={{ margin:"0 0 3px", fontWeight:"800", fontSize:"14px", color:C.navy, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{name}</p>
          <span style={{ background:rs.bg, color:rs.color, borderRadius:"999px", fontSize:"10px", padding:"2px 9px", fontWeight:"700" }}>{role}</span>
        </div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:"5px" }}>
        {role==="Médecin" && email && <div style={{ display:"flex", alignItems:"center", gap:"7px", padding:"6px 10px", background:"#f8fafc", borderRadius:"9px" }}><Mail size={11} color="#94a3b8"/><span style={{ fontSize:"11px", color:"#475569", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>{email}</span></div>}
        <div style={{ display:"flex", alignItems:"center", gap:"7px", padding:"6px 10px", background:"#f8fafc", borderRadius:"9px" }}><Phone size={11} color="#94a3b8"/><span style={{ fontSize:"11px", color:"#475569" }}>{user.numero_tel||"N/A"}</span></div>
        {user.specialite && <div style={{ display:"flex", alignItems:"center", gap:"7px", padding:"6px 10px", background:C.light, borderRadius:"9px" }}><Stethoscope size={11} color={C.blue}/><span style={{ fontSize:"11px", color:"#4f46e5", fontWeight:"700" }}>{user.specialite}</span></div>}
        <div style={{ display:"flex", alignItems:"center", gap:"7px", padding:"6px 10px", background:"#f8fafc", borderRadius:"9px" }}><Lock size={11} color="#94a3b8"/><span style={{ fontSize:"11px", color:"#94a3b8", letterSpacing:"3px" }}>••••••••</span></div>
      </div>
      <div style={{ display:"flex", gap:"7px" }}>
        <button onClick={onEdit} style={{ flex:1, padding:"9px", background:"linear-gradient(135deg,#38bdf8,#0ea5e9)", border:"none", borderRadius:"9px", color:"white", fontWeight:"700", fontSize:"12px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"5px", boxShadow:"0 2px 8px rgba(14,165,233,0.35)" }}><Edit3 size={12}/> Modifier</button>
        <button onClick={onDelete} style={{ width:"34px", height:"34px", background:"#fff5f5", border:"1px solid #fecaca", borderRadius:"9px", color:C.danger, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }} onMouseOver={e=>e.currentTarget.style.background="#fee2e2"} onMouseOut={e=>e.currentTarget.style.background="#fff5f5"}><Trash2 size={13}/></button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   ADMIN DASHBOARD
══════════════════════════════════════════════════════ */
export default function AdminDashboard({ onLogout }) {
  const [section,      setSection]      = useState("dashboard");
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [searchTerm,   setSearchTerm]   = useState("");
  const [formModal,    setFormModal]    = useState(null);
  const [deleteModal,  setDeleteModal]  = useState(null);
  const [planningEdit, setPlanningEdit] = useState(null);

  const [doctors,             setDoctors]             = useState([]);
  const [secretaires,         setSecretaires]         = useState([]);
  const [admins,              setAdmins]              = useState([]);
  const [consultationsPayees, setConsultationsPayees] = useState([]);
  const [consultationsTemp,   setConsultationsTemp]   = useState([]);

  const [doctorForm,     setDoctorForm]     = useState({...INIT.doctor});
  const [secretaireForm, setSecretaireForm] = useState({...INIT.secretaire});
  const [adminForm,      setAdminForm]      = useState({...INIT.admin});
  const [consultForm,    setConsultForm]    = useState({ doctor:"", date_fin:"", montant:"", n_places:"" });
  const [saving, setSaving] = useState(false);

  const toast = useToast();
  const token = () => localStorage.getItem("token")||localStorage.getItem("accessToken");

  const getSafe = async url => {
    try {
      const res = await fetch(url,{headers:{Authorization:"Bearer "+token()}});
      if (!res.ok) return [];
      const d = await res.json();
      return Array.isArray(d)?d:d.results||[];
    } catch { return []; }
  };

  const fetchAll = async () => {
    const [doc,sec,adm,pay,tmp] = await Promise.all([getSafe(API_DOCTORS),getSafe(API_SECRETAIRES),getSafe(API_ADMINS),getSafe(API_CONS_PAYE),getSafe(API_CONS_TEMP)]);
    setDoctors(doc); setSecretaires(sec); setAdmins(adm); setConsultationsPayees(pay); setConsultationsTemp(tmp);
  };

  useEffect(()=>{ fetchAll(); },[]);

  const getForm = r => r==="doctor"?doctorForm:r==="secretaire"?secretaireForm:adminForm;
  const setForm = r => r==="doctor"?setDoctorForm:r==="secretaire"?setSecretaireForm:setAdminForm;

  const handleSave = async role => {
    const form = getForm(role);
    const isNew = !form.id;
    const hdrs = {Authorization:"Bearer "+token()};
    setSaving(true);
    let body;
    if (role==="doctor") {
      body = new FormData();
      if (isNew) body.append("id","DOC-"+Date.now());
      Object.keys(form).forEach(k=>{
        if (k==="photo"&&(typeof form[k]==="string"||form[k]===null)) return;
        if (k==="password"&&!form[k]) return;
        if (form[k]!==null&&form[k]!=="") body.append(k,form[k]);
      });
    } else {
      if (!form.email||form.email.trim()==="") { toast.warn("Email requis","Veuillez saisir une adresse email valide."); setSaving(false); return; }
      const d = { username:form.username, email:form.email.trim(), numero_tel:form.numero_tel };
      if (form.password) d.password = form.password;
      hdrs["Content-Type"]="application/json";
      body = JSON.stringify(d);
    }
    const api = role==="doctor"?API_DOCTORS:role==="secretaire"?API_SECRETAIRES:API_ADMINS;
    try {
      const res = await fetch(isNew?api:`${api}${form.id}/`,{method:isNew?"POST":"PUT",headers:hdrs,body});
      if (res.ok) {
        setPhotoPreview(null); setForm(role)({...INIT[role]}); setFormModal(null); fetchAll();
        toast.success(isNew?"Compte créé avec succès":"Modifications enregistrées",`Le compte ${form.username} a été ${isNew?"créé":"mis à jour"}.`);
      } else {
        let msgs="Une erreur est survenue.";
        try { const text=await res.text(); if(text){const err=JSON.parse(text); msgs=Object.entries(err).flatMap(([k,v])=>Array.isArray(v)?v.map(m=>`${k}: ${m}`):[`${k}: ${v}`]).join(" | ");} } catch(e){msgs=`Erreur ${res.status}`;}
        toast.error("Erreur lors de l'enregistrement",msgs);
      }
    } finally { setSaving(false); }
  };

  const handleEdit = (u, role) => {
    const ud = u.user||{};
    const common = { id:u.id, username:ud.username||u.username||"", email:ud.email||u.email||"", numero_tel:u.numero_tel||"", password:"" };
    if (role==="doctor") { setDoctorForm({...common,specialite:u.specialite||"",date_disponible:u.date_disponible||"",photo:null}); setPhotoPreview(u.photo?(u.photo.startsWith("http")?u.photo:`${MEDIA_BASE_URL}${u.photo}`):null); }
    else if (role==="secretaire") setSecretaireForm({...common});
    else setAdminForm({...common});
    setFormModal({role,isEdit:true});
  };

  const openCreate = role => { setForm(role)({...INIT[role]}); setPhotoPreview(null); setFormModal({role,isEdit:false}); };
  const handleDelete = async (id,api) => { await fetch(`${api}${id}/`,{method:"DELETE",headers:{Authorization:"Bearer "+token()}}); setDeleteModal(null); fetchAll(); toast.success("Supprimé avec succès","L'élément a été retiré définitivement."); };

  const saveConsultation = async e => {
    e.preventDefault();
    const res = await fetch(API_CONS_TEMP,{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+token()},body:JSON.stringify({...consultForm,montant:parseInt(consultForm.montant),n_places:parseInt(consultForm.n_places)})});
    if (res.ok) { setConsultForm({doctor:"",date_fin:"",montant:"",n_places:""}); fetchAll(); toast.success("Séance publiée","La séance a été planifiée avec succès."); }
    else toast.error("Erreur","Impossible de créer la séance.");
  };

  const savePlanningEdit = async () => {
    if (!planningEdit) return;
    const res = await fetch(`${API_CONS_TEMP}${planningEdit.id}/`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:"Bearer "+token()},body:JSON.stringify({doctor:planningEdit.doctor,date_fin:planningEdit.date_fin,montant:parseInt(planningEdit.montant),n_places:parseInt(planningEdit.n_places)})});
    if (res.ok) { setPlanningEdit(null); fetchAll(); toast.success("Séance modifiée","Les modifications ont été enregistrées."); }
    else toast.error("Erreur","Impossible de modifier la séance.");
  };

  const totalRevenu = consultationsPayees.reduce((a,c)=>a+(Number(c.montant)||0),0);
  const filterList  = list => list.filter(u=>(u.user?.username||u.username||"").toLowerCase().includes(searchTerm.toLowerCase()));

  const NAV = [
    {id:"dashboard",  label:"Dashboard",   icon:<LayoutDashboard size={17}/>},
    {id:"doctors",    label:"Médecins",    icon:<Stethoscope size={17}/>},
    {id:"secretaires",label:"Secrétaires", icon:<User size={17}/>},
    {id:"admins",     label:"Admins",      icon:<ShieldCheck size={17}/>},
    {id:"paiements",  label:"Paiements",   icon:<CreditCard size={17}/>},
    {id:"planning",   label:"Planning",    icon:<Calendar size={17}/>},
  ];

  const STATS = [
    {icon:<Stethoscope size={20}/>,value:doctors.length,           label:"Médecins",    grad:"linear-gradient(135deg,#4f46e5,#6366f1)",shadow:"rgba(99,102,241,0.3)"},
    {icon:<User size={20}/>,       value:secretaires.length,        label:"Secrétaires", grad:"linear-gradient(135deg,#134e4a,#0d9488)",shadow:"rgba(13,148,136,0.3)"},
    {icon:<Users size={20}/>,      value:consultationsPayees.length,label:"Réservations",grad:"linear-gradient(135deg,#1e3a5f,#3b82f6)",shadow:"rgba(59,130,246,0.3)"},
    {icon:<TrendingUp size={20}/>, value:`${totalRevenu} MRU`,      label:"Revenus",     grad:"linear-gradient(135deg,#78350f,#d97706)",shadow:"rgba(217,119,6,0.3)"},
  ];

  const IS = { padding:"10px 13px", background:"#f6f9fd", border:`2px solid ${C.border}`, borderRadius:"11px", fontSize:"13px", outline:"none", color:"#1e293b", fontFamily:"inherit", boxSizing:"border-box", width:"100%" };
  const LS = { fontSize:"10px", fontWeight:"700", color:C.muted, textTransform:"uppercase", letterSpacing:"1px", display:"flex", alignItems:"center", gap:"4px" };

  const navigate = id => { setSection(id); setSidebarOpen(false); };

  return (
    <div style={{ display:"flex", height:"100vh", background:C.bg, fontFamily:"'Segoe UI',system-ui,sans-serif", overflow:"hidden", position:"relative" }}>
      <Toast toasts={toast.toasts} removeToast={toast.remove}/>

      {/* ── OVERLAY mobile ── */}
      {sidebarOpen && <div onClick={()=>setSidebarOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:19, backdropFilter:"blur(2px)" }}/>}

      {/* ── PLANNING EDIT MODAL ── */}
      {planningEdit && (
        <div style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(10,15,30,0.65)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"12px" }}>
          <div style={{ background:"white", width:"100%", maxWidth:"500px", borderRadius:"20px", overflow:"hidden", boxShadow:"0 40px 100px rgba(0,0,0,0.3)", animation:"slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)" }}>
            <div style={{ padding:"20px 24px", background:"linear-gradient(135deg,#4f46e5,#6366f1)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                <div style={{ width:"40px", height:"40px", background:"rgba(255,255,255,0.18)", borderRadius:"11px", display:"flex", alignItems:"center", justifyContent:"center" }}><Calendar size={18} color="white"/></div>
                <div>
                  <p style={{ margin:0, color:"white", fontWeight:"800", fontSize:"15px" }}>Modifier la séance</p>
                  <p style={{ margin:0, color:"rgba(255,255,255,0.55)", fontSize:"11px" }}>Modifiez les informations</p>
                </div>
              </div>
              <button onClick={()=>setPlanningEdit(null)} style={{ background:"rgba(255,255,255,0.15)", border:"none", color:"white", width:"32px", height:"32px", borderRadius:"9px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><X size={15}/></button>
            </div>
            <div style={{ padding:"22px 24px 24px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:"14px", marginBottom:"18px" }}>
                {[{label:"Médecin",icon:<Stethoscope size={11}/>,isSelect:true},{label:"Date & Heure",icon:<Calendar size={11}/>,key:"date_fin",type:"datetime-local"},{label:"Tarif (MRU)",icon:<CreditCard size={11}/>,key:"montant",type:"number"},{label:"Places",icon:<Users size={11}/>,key:"n_places",type:"number"}].map((f,i)=>(
                  <div key={i} style={{ display:"flex", flexDirection:"column", gap:"5px" }}>
                    <label style={{ ...LS }}>{React.cloneElement(f.icon,{color:"#6366f1"})} {f.label}</label>
                    {f.isSelect
                      ? <select value={planningEdit.doctor} onChange={e=>setPlanningEdit(p=>({...p,doctor:e.target.value}))} style={IS}>{doctors.map(d=><option key={d.id} value={d.id}>{d.user?.username||d.username}</option>)}</select>
                      : <input type={f.type} value={planningEdit[f.key]} onChange={e=>setPlanningEdit(p=>({...p,[f.key]:e.target.value}))} style={IS}/>}
                  </div>
                ))}
              </div>
              <div style={{ height:"1px", background:C.border, marginBottom:"18px" }}/>
              <div style={{ display:"flex", gap:"10px" }}>
                <button onClick={()=>setPlanningEdit(null)} style={{ flex:1, padding:"12px", background:"#f1f5f9", border:"none", borderRadius:"11px", color:C.muted, fontWeight:"700", fontSize:"13px", cursor:"pointer" }}>Annuler</button>
                <button onClick={savePlanningEdit} style={{ flex:2, padding:"12px", background:"linear-gradient(135deg,#4f46e5,#6366f1)", border:"none", borderRadius:"11px", color:"white", fontWeight:"800", fontSize:"13px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", boxShadow:"0 4px 14px rgba(99,102,241,0.35)" }}><Save size={14}/> Enregistrer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <FormModal formModal={formModal} setFormModal={setFormModal} doctorForm={doctorForm} setDoctorForm={setDoctorForm} secretaireForm={secretaireForm} setSecretaireForm={setSecretaireForm} adminForm={adminForm} setAdminForm={setAdminForm} photoPreview={photoPreview} setPhotoPreview={setPhotoPreview} saving={saving} handleSave={handleSave}/>
      <DeleteModal deleteModal={deleteModal} setDeleteModal={setDeleteModal} handleDelete={handleDelete}/>

      {/* ══ SIDEBAR ══ */}
      <aside style={{ width:"240px", minWidth:"240px", height:"100vh", background:C.dark, display:"flex", flexDirection:"column", boxShadow:"4px 0 20px rgba(0,0,0,0.25)", position:"fixed", left:0, top:0, bottom:0, zIndex:20, transform:sidebarOpen?"translateX(0)":"translateX(-100%)", transition:"transform 0.28s cubic-bezier(0.4,0,0.2,1)" }} className="sidebar">
        <div style={{ padding:"24px 20px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
            <div style={{ width:"42px", height:"42px", background:"linear-gradient(135deg,#6366f1,#818cf8)", borderRadius:"12px", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 14px rgba(99,102,241,0.5)", flexShrink:0 }}><Hospital size={20} color="white"/></div>
            <div>
              <p style={{ color:"white", fontWeight:"800", fontSize:"15px", margin:0 }}>e-santé</p>
              <p style={{ color:"rgba(255,255,255,0.28)", fontSize:"9px", margin:0, letterSpacing:"1.5px", textTransform:"uppercase" }}>Administration</p>
            </div>
          </div>
        </div>
        <div style={{ padding:"14px 20px 4px", flexShrink:0 }}>
          <p style={{ margin:0, fontSize:"9px", fontWeight:"700", color:"rgba(255,255,255,0.18)", textTransform:"uppercase", letterSpacing:"2px" }}>Navigation</p>
        </div>
        <nav style={{ flex:1, padding:"4px 10px 10px", overflowY:"auto" }}>
          {NAV.map(item=>{
            const active = section===item.id;
            return (
              <button key={item.id} onClick={()=>navigate(item.id)} style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 13px", borderRadius:"11px", border:"none", cursor:"pointer", marginBottom:"2px", background:active?"linear-gradient(135deg,rgba(99,102,241,0.2),rgba(129,140,248,0.08))":"transparent", color:active?"white":"rgba(255,255,255,0.36)", fontSize:"13px", fontWeight:active?"700":"500", transition:"all 0.15s", borderLeft:active?"3px solid #818cf8":"3px solid transparent" }}
                onMouseOver={e=>{ if(!active){e.currentTarget.style.background="rgba(255,255,255,0.05)";e.currentTarget.style.color="rgba(255,255,255,0.7)";} }}
                onMouseOut={e=>{ if(!active){e.currentTarget.style.background="transparent";e.currentTarget.style.color="rgba(255,255,255,0.36)";} }}>
                <span style={{ display:"flex", alignItems:"center", gap:"9px" }}>{item.icon} {item.label}</span>
                {active&&<ChevronRight size={12}/>}
              </button>
            );
          })}
        </nav>
        <div style={{ padding:"12px 10px 16px", borderTop:"1px solid rgba(255,255,255,0.06)", flexShrink:0 }}>
          <button onClick={onLogout} style={{ width:"100%", display:"flex", alignItems:"center", gap:"9px", padding:"11px 13px", borderRadius:"11px", border:"1px solid rgba(239,68,68,0.18)", background:"rgba(239,68,68,0.07)", color:"rgba(252,165,165,0.9)", cursor:"pointer", fontSize:"13px", fontWeight:"700", transition:"all 0.15s" }}
            onMouseOver={e=>{e.currentTarget.style.background="rgba(239,68,68,0.14)";}}
            onMouseOut={e=>{e.currentTarget.style.background="rgba(239,68,68,0.07)";}}>
            <LogOut size={16}/> Déconnexion
          </button>
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <main style={{ flex:1, overflowY:"auto", padding:"0", marginLeft:"0", width:"100%" }} className="main-content">

        {/* ── TOPBAR (visible sur tous les écrans) ── */}
        <div style={{ position:"sticky", top:0, zIndex:15, background:"rgba(248,250,252,0.95)", backdropFilter:"blur(8px)", borderBottom:`1px solid ${C.border}`, padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"10px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
            <button onClick={()=>setSidebarOpen(o=>!o)} style={{ width:"38px", height:"38px", background:"white", border:`1px solid ${C.border}`, borderRadius:"10px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 1px 4px rgba(0,0,0,0.06)", flexShrink:0 }}><Menu size={18} color={C.navy}/></button>
            <div>
              <h1 style={{ margin:0, fontSize:"17px", fontWeight:"800", color:C.navy, letterSpacing:"-0.3px" }}>{NAV.find(n=>n.id===section)?.label}</h1>
              <p style={{ margin:0, fontSize:"11px", color:C.muted, display:"none" }} className="subtitle">e-santé Administration</p>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
            {["doctors","secretaires","admins","paiements"].includes(section) && (
              <div style={{ position:"relative" }}>
                <Search size={12} style={{ position:"absolute", left:"10px", top:"50%", transform:"translateY(-50%)", color:"#94a3b8" }}/>
                <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}
                  style={{ paddingLeft:"30px", paddingRight:"12px", paddingTop:"9px", paddingBottom:"9px", background:"white", border:`2px solid ${C.border}`, borderRadius:"10px", fontSize:"12px", outline:"none", width:"160px", transition:"border-color 0.2s" }}
                  onFocus={e=>e.target.style.borderColor="#6366f1"} onBlur={e=>e.target.style.borderColor=C.border}/>
              </div>
            )}
            {["doctors","secretaires","admins"].includes(section) && (
              <button onClick={()=>openCreate(section==="secretaires"?"secretaire":section==="admins"?"admin":"doctor")}
                style={{ display:"flex", alignItems:"center", gap:"6px", padding:"9px 16px", background:"linear-gradient(135deg,#4f46e5,#6366f1)", border:"none", borderRadius:"10px", color:"white", fontWeight:"700", fontSize:"12px", cursor:"pointer", boxShadow:"0 4px 14px rgba(99,102,241,0.35)", whiteSpace:"nowrap" }}>
                <Plus size={14}/> <span>Ajouter</span>
              </button>
            )}
            {section==="paiements" && (
              <div style={{ background:"linear-gradient(135deg,#1e3a5f,#3b82f6)", color:"white", padding:"9px 14px", borderRadius:"10px", fontSize:"13px", fontWeight:"800", display:"flex", alignItems:"center", gap:"6px", boxShadow:"0 4px 14px rgba(59,130,246,0.35)", whiteSpace:"nowrap" }}>
                <TrendingUp size={14}/> {totalRevenu} MRU
              </div>
            )}
          </div>
        </div>

        {/* ── CONTENU ── */}
        <div style={{ padding:"20px 16px" }}>

          {/* DASHBOARD */}
          {section==="dashboard" && (
            <div>
              <div className="stats-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:"14px", marginBottom:"20px" }}>
                {STATS.map((s,i)=>(
                  <div key={i} className="stat-card" style={{ background:"white", borderRadius:"16px", padding:"18px", border:`1px solid ${C.border}`, boxShadow:"0 2px 10px rgba(0,0,0,0.06)", display:"flex", alignItems:"center", gap:"14px" }}>
                    <div style={{ width:"48px", height:"48px", background:s.grad, borderRadius:"13px", display:"flex", alignItems:"center", justifyContent:"center", color:"white", flexShrink:0, boxShadow:`0 5px 14px ${s.shadow}` }}>{s.icon}</div>
                    <div>
                      <p style={{ margin:0, fontSize:"22px", fontWeight:"800", color:C.navy, letterSpacing:"-0.5px" }}>{s.value}</p>
                      <p style={{ margin:0, fontSize:"11px", color:C.muted }}>{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background:"white", borderRadius:"16px", border:`1px solid ${C.border}`, overflow:"hidden", boxShadow:"0 2px 10px rgba(0,0,0,0.06)" }}>
                <div style={{ padding:"14px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <h2 style={{ margin:0, fontSize:"15px", fontWeight:"800", color:C.navy }}>Dernières réservations</h2>
                  <button onClick={()=>setSection("paiements")} style={{ fontSize:"12px", color:"#4f46e5", background:C.light, border:"none", cursor:"pointer", fontWeight:"700", padding:"6px 12px", borderRadius:"8px" }}>Voir tout →</button>
                </div>
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse", minWidth:"480px" }}>
                    <thead><tr style={{ background:"#f8fafc" }}>{["Patient","Médecin","Date","Montant","Statut"].map(h=><th key={h} style={{ padding:"10px 16px", textAlign:"left", fontSize:"10px", fontWeight:"700", color:C.muted, textTransform:"uppercase", letterSpacing:"1px", whiteSpace:"nowrap" }}>{h}</th>)}</tr></thead>
                    <tbody>
                      {[...consultationsPayees].reverse().slice(0,6).map(c=>{
                        const doc=doctors.find(d=>String(d.id)===String(c.doctor));
                        const sc=statutCfg[c.statut]||statutCfg.en_attente;
                        return <tr key={c.id} style={{ borderTop:`1px solid ${C.border}` }}>
                          <td style={{ padding:"12px 16px", fontSize:"13px", fontWeight:"700", color:C.navy, whiteSpace:"nowrap" }}>{c.nom_complet}</td>
                          <td style={{ padding:"12px 16px", fontSize:"12px", color:C.blue, fontWeight:"600", whiteSpace:"nowrap" }}>Dr. {doc?.user?.username||"Médecin"}</td>
                          <td style={{ padding:"12px 16px", fontSize:"12px", color:C.muted, whiteSpace:"nowrap" }}>{new Date(c.date).toLocaleDateString("fr-FR")}</td>
                          <td style={{ padding:"12px 16px", fontSize:"13px", fontWeight:"800", color:C.navy, whiteSpace:"nowrap" }}>{c.montant} MRU</td>
                          <td style={{ padding:"12px 16px" }}><span style={{ display:"inline-flex", alignItems:"center", gap:"4px", background:sc.bg, color:sc.color, borderRadius:"999px", fontSize:"10px", padding:"3px 10px", fontWeight:"700", whiteSpace:"nowrap" }}><span style={{ width:"5px", height:"5px", borderRadius:"50%", background:sc.dot, display:"inline-block" }}/>{sc.label}</span></td>
                        </tr>;
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* LISTES */}
          {["doctors","secretaires","admins"].includes(section) && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:"14px" }}>
              {filterList(section==="doctors"?doctors:section==="secretaires"?secretaires:admins).map(u=>(
                <UserCard key={u.id} user={u}
                  role={section==="doctors"?"Médecin":section==="secretaires"?"Secrétaire":"Admin"}
                  onEdit={()=>handleEdit(u,section==="secretaires"?"secretaire":section==="admins"?"admin":"doctor")}
                  onDelete={()=>setDeleteModal({id:u.id,api:section==="doctors"?API_DOCTORS:section==="secretaires"?API_SECRETAIRES:API_ADMINS})}/>
              ))}
            </div>
          )}

          {/* PAIEMENTS */}
          {section==="paiements" && (
            <div style={{ background:"white", borderRadius:"16px", border:`1px solid ${C.border}`, overflow:"hidden", boxShadow:"0 2px 10px rgba(0,0,0,0.06)" }}>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", minWidth:"560px" }}>
                  <thead><tr style={{ background:"#f8fafc", borderBottom:`1px solid ${C.border}` }}>{["Patient","Médecin","Date","NNI","Montant","Statut"].map(h=><th key={h} style={{ padding:"11px 16px", textAlign:"left", fontSize:"10px", fontWeight:"700", color:C.muted, textTransform:"uppercase", letterSpacing:"1px", whiteSpace:"nowrap" }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {[...consultationsPayees].reverse().filter(c=>c.nom_complet?.toLowerCase().includes(searchTerm.toLowerCase())).map(c=>{
                      const doc=doctors.find(d=>String(d.id)===String(c.doctor));
                      const sc=statutCfg[c.statut]||statutCfg.en_attente;
                      return <tr key={c.id} style={{ borderTop:`1px solid ${C.border}` }}>
                        <td style={{ padding:"11px 16px" }}><p style={{ margin:0, fontWeight:"700", fontSize:"13px", color:C.navy, whiteSpace:"nowrap" }}>{c.nom_complet}</p><p style={{ margin:0, fontSize:"11px", color:C.muted }}>{c.numero_tel}</p></td>
                        <td style={{ padding:"11px 16px", fontSize:"12px", color:C.blue, fontWeight:"600", whiteSpace:"nowrap" }}>Dr. {doc?.user?.username||"Médecin"}</td>
                        <td style={{ padding:"11px 16px", fontSize:"12px", color:C.muted, whiteSpace:"nowrap" }}>{new Date(c.date).toLocaleDateString("fr-FR")}</td>
                        <td style={{ padding:"11px 16px", fontSize:"12px", color:C.muted, fontFamily:"monospace", whiteSpace:"nowrap" }}>{c.NNI||"—"}</td>
                        <td style={{ padding:"11px 16px", fontSize:"13px", fontWeight:"800", color:C.navy, whiteSpace:"nowrap" }}>{c.montant} MRU</td>
                        <td style={{ padding:"11px 16px" }}><span style={{ display:"inline-flex", alignItems:"center", gap:"4px", background:sc.bg, color:sc.color, borderRadius:"999px", fontSize:"10px", padding:"3px 10px", fontWeight:"700", whiteSpace:"nowrap" }}><span style={{ width:"5px", height:"5px", borderRadius:"50%", background:sc.dot }}/>{sc.label}</span></td>
                      </tr>;
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PLANNING */}
          {section==="planning" && (
            <div>
              <div style={{ background:"white", borderRadius:"16px", padding:"22px", border:`1px solid ${C.border}`, boxShadow:"0 2px 10px rgba(0,0,0,0.06)", marginBottom:"18px" }}>
                <h3 style={{ margin:"0 0 18px", fontSize:"15px", fontWeight:"800", color:C.navy, display:"flex", alignItems:"center", gap:"9px" }}>
                  <div style={{ width:"32px", height:"32px", background:"linear-gradient(135deg,#4f46e5,#6366f1)", borderRadius:"9px", display:"flex", alignItems:"center", justifyContent:"center" }}><Plus size={15} color="white"/></div>
                  Planifier une nouvelle séance
                </h3>
                <form onSubmit={saveConsultation}>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:"14px", alignItems:"end" }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:"5px" }}>
                      <label style={LS}><Stethoscope size={11} color={C.blue}/> Médecin</label>
                      <select value={consultForm.doctor} onChange={e=>setConsultForm({...consultForm,doctor:e.target.value})} required style={IS}>
                        <option value="">Choisir un médecin...</option>
                        {doctors.map(d=><option key={d.id} value={d.id}>{d.user?.username||d.username}</option>)}
                      </select>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", gap:"5px" }}>
                      <label style={LS}><Calendar size={11} color={C.blue}/> Date & Heure</label>
                      <input type="datetime-local" value={consultForm.date_fin} onChange={e=>setConsultForm({...consultForm,date_fin:e.target.value})} required style={IS}/>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", gap:"5px" }}>
                      <label style={LS}><CreditCard size={11} color={C.blue}/> Tarif (MRU)</label>
                      <input type="number" placeholder="500" value={consultForm.montant} onChange={e=>setConsultForm({...consultForm,montant:e.target.value})} required style={IS}/>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", gap:"5px" }}>
                      <label style={LS}><Users size={11} color={C.blue}/> Places</label>
                      <input type="number" placeholder="10" value={consultForm.n_places} onChange={e=>setConsultForm({...consultForm,n_places:e.target.value})} required style={IS}/>
                    </div>
                  </div>
                  <div style={{ marginTop:"16px", display:"flex", justifyContent:"flex-end" }}>
                    <button type="submit" style={{ padding:"11px 24px", background:"linear-gradient(135deg,#4f46e5,#6366f1)", border:"none", borderRadius:"11px", color:"white", fontWeight:"800", fontSize:"13px", cursor:"pointer", display:"flex", alignItems:"center", gap:"7px", boxShadow:"0 4px 14px rgba(99,102,241,0.35)" }}>
                      <Plus size={14}/> Publier la séance
                    </button>
                  </div>
                </form>
              </div>

              {consultationsTemp.length===0?(
                <div style={{ textAlign:"center", padding:"50px 20px", background:"white", borderRadius:"16px", border:`1px solid ${C.border}` }}>
                  <div style={{ width:"60px", height:"60px", background:"#f1f5f9", borderRadius:"16px", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}><Calendar size={28} color="#94a3b8"/></div>
                  <p style={{ color:C.muted, fontSize:"14px", fontWeight:"700", margin:0 }}>Aucune séance planifiée</p>
                  <p style={{ color:"#94a3b8", fontSize:"12px", margin:"5px 0 0" }}>Utilisez le formulaire ci-dessus</p>
                </div>
              ):(
                <div style={{ background:"white", borderRadius:"16px", border:`1px solid ${C.border}`, overflow:"hidden", boxShadow:"0 2px 10px rgba(0,0,0,0.06)" }}>
                  <div style={{ padding:"14px 20px", borderBottom:`1px solid ${C.border}` }}>
                    <h3 style={{ margin:0, fontSize:"14px", fontWeight:"800", color:C.navy }}>
                      Séances planifiées <span style={{ marginLeft:"8px", background:C.light, color:C.blue, borderRadius:"999px", fontSize:"11px", padding:"2px 9px", fontWeight:"700" }}>{consultationsTemp.length}</span>
                    </h3>
                  </div>
                  <div style={{ overflowX:"auto" }}>
                    <table style={{ width:"100%", borderCollapse:"collapse", minWidth:"520px" }}>
                      <thead><tr style={{ background:"#f8fafc" }}>{["Médecin","Date & Heure","Tarif","Places","Actions"].map(h=><th key={h} style={{ padding:"10px 16px", textAlign:"left", fontSize:"10px", fontWeight:"700", color:C.muted, textTransform:"uppercase", letterSpacing:"1px", whiteSpace:"nowrap" }}>{h}</th>)}</tr></thead>
                      <tbody>
                        {consultationsTemp.map(c=>{
                          const doc=doctors.find(d=>String(d.id)===String(c.doctor));
                          const docName=doc?.user?.username||"Médecin";
                          const isPast=new Date(c.date_fin)<new Date();
                          return <tr key={c.id} style={{ borderTop:`1px solid ${C.border}`, background:isPast?"#fafbfc":"white" }}>
                            <td style={{ padding:"13px 16px" }}>
                              <div style={{ display:"flex", alignItems:"center", gap:"9px" }}>
                                <div style={{ width:"34px", height:"34px", background:isPast?"#94a3b8":"linear-gradient(135deg,#4f46e5,#6366f1)", borderRadius:"9px", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:"800", fontSize:"13px", flexShrink:0 }}>{docName.charAt(0).toUpperCase()}</div>
                                <p style={{ margin:0, fontWeight:"700", fontSize:"12px", color:isPast?C.muted:C.navy, whiteSpace:"nowrap" }}>Dr. {docName}</p>
                              </div>
                            </td>
                            <td style={{ padding:"13px 16px" }}>
                              <p style={{ margin:0, fontSize:"12px", fontWeight:"700", color:isPast?"#94a3b8":C.navy, whiteSpace:"nowrap" }}>{new Date(c.date_fin).toLocaleDateString("fr-FR")}</p>
                              <p style={{ margin:0, fontSize:"11px", color:"#94a3b8" }}>{new Date(c.date_fin).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</p>
                            </td>
                            <td style={{ padding:"13px 16px" }}><span style={{ background:C.light, color:C.navy, borderRadius:"999px", fontSize:"11px", padding:"4px 12px", fontWeight:"800", whiteSpace:"nowrap" }}>{c.montant} MRU</span></td>
                            <td style={{ padding:"13px 16px" }}><div style={{ display:"flex", alignItems:"center", gap:"5px" }}><Users size={12} color={C.muted}/><span style={{ fontSize:"13px", fontWeight:"800", color:C.navy }}>{c.n_places}</span></div></td>
                            <td style={{ padding:"13px 16px" }}>
                              <div style={{ display:"flex", gap:"6px" }}>
                                <button onClick={()=>setPlanningEdit(c)} style={{ display:"flex", alignItems:"center", gap:"5px", padding:"7px 11px", background:C.light, border:"1px solid #c7d2fe", borderRadius:"8px", color:"#4f46e5", cursor:"pointer", fontSize:"11px", fontWeight:"700", whiteSpace:"nowrap" }} onMouseOver={e=>e.currentTarget.style.background="#e0e7ff"} onMouseOut={e=>e.currentTarget.style.background=C.light}><Edit3 size={12}/> Modifier</button>
                                <button onClick={()=>setDeleteModal({id:c.id,api:API_CONS_TEMP})} style={{ display:"flex", alignItems:"center", gap:"5px", padding:"7px 11px", background:"#fff5f5", border:"1px solid #fecaca", borderRadius:"8px", color:C.danger, cursor:"pointer", fontSize:"11px", fontWeight:"700", whiteSpace:"nowrap" }} onMouseOver={e=>e.currentTarget.style.background="#fee2e2"} onMouseOut={e=>e.currentTarget.style.background="#fff5f5"}><Trash2 size={12}/> Sup.</button>
                              </div>
                            </td>
                          </tr>;
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(20px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes toastIn { from { opacity:0; transform:translateX(24px); } to { opacity:1; transform:translateX(0); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
        .user-card { transition: box-shadow 0.2s, transform 0.2s; }
        .user-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important; transform: translateY(-2px); }

        /* ── Desktop : sidebar always visible ── */
        @media (min-width: 768px) {
          .sidebar { transform: translateX(0) !important; position: fixed !important; }
          .main-content { margin-left: 240px !important; }
          .subtitle { display: block !important; }
        }

        /* ── Mobile : padding réduit ── */
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}