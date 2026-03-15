import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, MEDIA_BASE_URL } from "../api/config";
import {
  LogOut, LayoutDashboard, Search, History,
  CheckCircle2, Clock, X, User, Users, Menu,
  Stethoscope, FileText, ShieldCheck, Edit3, Trash2, Eye,
} from "lucide-react";

function EspaceDocteurLocal() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [patients, setPatients] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [recherche, setRecherche] = useState("");
  const [patientSelectionne, setPatientSelectionne] = useState(null);
  const [notesTemp, setNotesTemp] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" | "edit" | "view"
  const [confirmDelete, setConfirmDelete] = useState(null); // patient à supprimer diagnostic

  const navigate = useNavigate();
  const token = localStorage.getItem("token") || localStorage.getItem("accessToken");

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    const loadData = async () => {
      try {
        const profRes = await fetch(`${API_BASE_URL}/me/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profData = await profRes.json();
        setDoctorProfile(profData.profile || null);

        const patRes = await fetch(`${API_BASE_URL}/consultations-payees/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const patData = await patRes.json();
        const liste = Array.isArray(patData) ? patData : patData.results || [];
        if (profData.profile?.id) {
          setPatients(liste.filter((p) => String(p.doctor) === String(profData.profile.id)));
        }
      } catch (err) {
        console.error("Erreur", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token, navigate]);

  const handleSave = async () => {
    if (!notesTemp.trim()) { alert("Veuillez saisir un diagnostic."); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/consultations-payees/${patientSelectionne.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ diagnostic: notesTemp }),
      });
      if (res.ok) {
        setPatients((prev) =>
          prev.map((p) => p.id === patientSelectionne.id ? { ...p, diagnostic: notesTemp } : p)
        );
        setPatientSelectionne(null);
      }
    } catch (e) {
      alert("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDiagnostic = async (patient) => {
    try {
      const res = await fetch(`${API_BASE_URL}/consultations-payees/${patient.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ diagnostic: "" }),
      });
      if (res.ok) {
        setPatients((prev) =>
          prev.map((p) => p.id === patient.id ? { ...p, diagnostic: "" } : p)
        );
        setConfirmDelete(null);
      }
    } catch (e) {
      alert("Erreur lors de la suppression");
    }
  };

  const openCreate = (patient) => {
    setPatientSelectionne(patient);
    setNotesTemp("");
    setModalMode("create");
  };

  const openEdit = (patient) => {
    setPatientSelectionne(patient);
    setNotesTemp(patient.diagnostic || "");
    setModalMode("edit");
  };

  const openView = (patient) => {
    setPatientSelectionne(patient);
    setNotesTemp(patient.diagnostic || "");
    setModalMode("view");
  };

  if (loading) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#e6f0fa" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: "48px", height: "48px", border: "3px solid #2b6cb0",
          borderTopColor: "transparent", borderRadius: "50%",
          animation: "spin 0.8s linear infinite", margin: "0 auto 16px"
        }} />
        <p style={{ color: "#2b6cb0", fontSize: "12px", fontWeight: "700", letterSpacing: "3px" }}>CHARGEMENT...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  const enAttente = patients.filter((p) => !p.diagnostic);
  const termines = patients.filter((p) => p.diagnostic);
  const filteredAttente = enAttente.filter((p) => p.nom_complet?.toLowerCase().includes(recherche.toLowerCase()));
  const filteredTermines = termines.filter((p) => p.nom_complet?.toLowerCase().includes(recherche.toLowerCase()));

  const modalTitle = {
    create: "Nouvelle consultation",
    edit: "Modifier le diagnostic",
    view: "Diagnostic complet",
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#e6f0fa", fontFamily: "inherit", overflow: "hidden" }}>

      {/* OVERLAY MOBILE */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          zIndex: 40, backdropFilter: "blur(4px)"
        }} />
      )}

      {/* ===== SIDEBAR NOIRE ===== */}
      <aside style={{
        width: "256px", minWidth: "256px",
        background: "#0f172a",
        display: "flex", flexDirection: "column",
        position: typeof window !== "undefined" && window.innerWidth < 1024 ? "fixed" : "relative",
        left: 0, top: 0, height: "100vh", zIndex: 50,
        boxShadow: "4px 0 24px rgba(0,0,0,0.3)",
      }}>
        {/* Logo */}
        <div style={{ padding: "28px 24px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "42px", height: "42px",
              background: "linear-gradient(135deg, #1a365d, #2b6cb0)",
              borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Stethoscope size={20} color="white" />
            </div>
            <div>
              <p style={{ color: "white", fontWeight: "700", fontSize: "15px", margin: 0 }}>e-santé</p>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", margin: 0 }}>Espace Médecin</p>
            </div>
          </div>
        </div>

        {/* Profil */}
        <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "46px", height: "46px", borderRadius: "12px", overflow: "hidden",
              background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center",
              border: "2px solid rgba(255,255,255,0.15)", flexShrink: 0
            }}>
              {doctorProfile?.photo
                ? <img src={`${MEDIA_BASE_URL}${doctorProfile.photo}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                : <User size={20} color="rgba(255,255,255,0.6)" />
              }
            </div>
            <div style={{ overflow: "hidden" }}>
              <p style={{ color: "white", fontWeight: "700", fontSize: "13px", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                Dr. {doctorProfile?.user?.username || "Médecin"}
              </p>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", margin: 0 }}>
                {doctorProfile?.specialite || "Spécialiste"}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 12px" }}>
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "10px", fontWeight: "700", letterSpacing: "2px", padding: "0 10px", marginBottom: "6px" }}>
            NAVIGATION
          </p>
          {[
            { id: "dashboard", icon: <LayoutDashboard size={17} />, label: "Dashboard", count: enAttente.length },
            { id: "historique", icon: <History size={17} />, label: "Historique", count: termines.length },
          ].map((item) => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "11px 14px", borderRadius: "10px", border: "none", cursor: "pointer",
                marginBottom: "2px", transition: "all 0.2s",
                background: activeTab === item.id ? "rgba(255,255,255,0.1)" : "transparent",
                color: activeTab === item.id ? "white" : "rgba(255,255,255,0.4)",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", fontWeight: "600" }}>
                {item.icon} {item.label}
              </span>
              {item.count > 0 && (
                <span style={{
                  background: activeTab === item.id ? "#2b6cb0" : "rgba(255,255,255,0.1)",
                  color: "white", borderRadius: "999px", fontSize: "10px", padding: "2px 8px", fontWeight: "700"
                }}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Déconnexion */}
        <div style={{ padding: "14px 12px" }}>
          <button onClick={() => { localStorage.clear(); navigate("/login"); }}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: "10px",
              padding: "11px 14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)",
              background: "transparent", color: "rgba(248,113,113,0.8)", cursor: "pointer",
              fontSize: "13px", fontWeight: "600"
            }}
          >
            <LogOut size={17} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* ===== CONTENU PRINCIPAL ===== */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

        {/* HEADER */}
        <header style={{
          height: "68px", background: "white", borderBottom: "1px solid #e2e8f0",
          padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0, boxShadow: "0 1px 8px rgba(0,0,0,0.05)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <button onClick={() => setSidebarOpen(true)} style={{ padding: "8px", background: "#f1f5f9", border: "none", borderRadius: "8px", cursor: "pointer" }}>
              <Menu size={18} color="#64748b" />
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#1a365d" }}>
                {activeTab === "dashboard" ? "File d'attente" : "Historique médical"}
              </h1>
              <p style={{ margin: 0, fontSize: "11px", color: "#2b6cb0" }}>
                {activeTab === "dashboard"
                  ? `${enAttente.length} patient${enAttente.length !== 1 ? "s" : ""} en attente`
                  : `${termines.length} consultation${termines.length !== 1 ? "s" : ""} terminée${termines.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
          <div style={{ position: "relative", width: "260px" }}>
            <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input type="text" placeholder="Rechercher un patient..."
              onChange={(e) => setRecherche(e.target.value)}
              style={{
                width: "100%", paddingLeft: "34px", paddingRight: "12px",
                paddingTop: "9px", paddingBottom: "9px",
                background: "#f1f5f9", border: "none", borderRadius: "10px",
                fontSize: "12px", outline: "none", boxSizing: "border-box", color: "#1e293b"
              }}
            />
          </div>
        </header>

        {/* CONTENU */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px" }}>

          {/* ===== DASHBOARD ===== */}
          {activeTab === "dashboard" && (
            <div>
              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "14px", marginBottom: "28px" }}>
                {[
                  { icon: <Clock size={20} color="#2b6cb0" />, value: enAttente.length, label: "En attente", bg: "#e6f0fa" },
                  { icon: <CheckCircle2 size={20} color="#059669" />, value: termines.length, label: "Terminés", bg: "#d1fae5" },
                  { icon: <Users size={20} color="#7c3aed" />, value: patients.length, label: "Total patients", bg: "#ede9fe" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "white", borderRadius: "14px", padding: "18px 20px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "14px", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                    <div style={{ width: "44px", height: "44px", background: s.bg, borderRadius: "11px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {s.icon}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: "22px", fontWeight: "700", color: "#1a365d" }}>{s.value}</p>
                      <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cards patients */}
              {filteredAttente.length === 0 ? (
                <div style={{ textAlign: "center", padding: "72px 0", background: "white", borderRadius: "18px", border: "1px solid #e2e8f0" }}>
                  <CheckCircle2 size={52} color="#10b981" style={{ marginBottom: "14px" }} />
                  <p style={{ color: "#64748b", fontSize: "15px", fontWeight: "600" }}>Aucun patient en attente</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))", gap: "18px" }}>
                  {filteredAttente.map((p) => (
                    <div key={p.id} style={{ background: "white", borderRadius: "18px", border: "1px solid #e2e8f0", padding: "22px", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
                        <div style={{ width: "48px", height: "48px", borderRadius: "13px", background: "linear-gradient(135deg,#1a365d,#2b6cb0)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "19px", flexShrink: 0 }}>
                          {p.nom_complet?.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ overflow: "hidden" }}>
                          <p style={{ margin: 0, fontWeight: "700", fontSize: "14px", color: "#1a365d", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.nom_complet}</p>
                          <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>{p.numero_tel}</p>
                        </div>
                        <span style={{ marginLeft: "auto", background: "#fef3c7", color: "#92400e", borderRadius: "999px", fontSize: "10px", padding: "3px 9px", fontWeight: "700", flexShrink: 0 }}>
                          Attente
                        </span>
                      </div>
                      <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "10px 14px", marginBottom: "14px" }}>
                        {[["NNI", p.NNI || "—"], ["Spécialité", p.specialite], ["Montant", `${p.montant} MRU`]].map(([k, v]) => (
                          <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                            <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600" }}>{k}</span>
                            <span style={{ fontSize: "12px", color: "#1a365d", fontWeight: "700" }}>{v}</span>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => openCreate(p)} style={{
                        width: "100%", padding: "11px",
                        background: "linear-gradient(135deg,#1a365d,#2b6cb0)",
                        color: "white", border: "none", borderRadius: "11px",
                        fontWeight: "700", fontSize: "13px", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "7px"
                      }}>
                        <Stethoscope size={15} /> Démarrer la consultation
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== HISTORIQUE ===== */}
          {activeTab === "historique" && (
            <div>
              {filteredTermines.length === 0 ? (
                <div style={{ textAlign: "center", padding: "72px 0", background: "white", borderRadius: "18px", border: "1px solid #e2e8f0" }}>
                  <FileText size={52} color="#94a3b8" style={{ marginBottom: "14px" }} />
                  <p style={{ color: "#64748b", fontSize: "15px", fontWeight: "600" }}>Aucune consultation terminée</p>
                </div>
              ) : (
                <div style={{ background: "white", borderRadius: "18px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                        {["Patient", "NNI", "Spécialité", "Diagnostic", "Actions"].map((h) => (
                          <th key={h} style={{ padding: "13px 18px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#64748b", letterSpacing: "1px", textTransform: "uppercase" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTermines.map((p, i) => (
                        <tr key={p.id} style={{ borderBottom: i < filteredTermines.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                          <td style={{ padding: "14px 18px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
                              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg,#1a365d,#2b6cb0)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "14px", flexShrink: 0 }}>
                                {p.nom_complet?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p style={{ margin: 0, fontWeight: "700", fontSize: "13px", color: "#1a365d" }}>{p.nom_complet}</p>
                                <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>{p.numero_tel}</p>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "14px 18px", fontSize: "12px", color: "#475569", fontWeight: "600" }}>{p.NNI || "—"}</td>
                          <td style={{ padding: "14px 18px", fontSize: "12px", color: "#475569" }}>{p.specialite}</td>
                          <td style={{ padding: "14px 18px", maxWidth: "200px" }}>
                            <p style={{ margin: 0, fontSize: "12px", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {p.diagnostic}
                            </p>
                          </td>
                          <td style={{ padding: "14px 18px" }}>
                            <div style={{ display: "flex", gap: "6px" }}>
                              {/* Voir */}
                              <button onClick={() => openView(p)} title="Voir diagnostic complet"
                                style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#f1f5f9", color: "#475569", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Eye size={15} />
                              </button>
                              {/* Modifier */}
                              <button onClick={() => openEdit(p)} title="Modifier le diagnostic"
                                style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #bfdbfe", background: "#eff6ff", color: "#1d4ed8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Edit3 size={15} />
                              </button>
                              {/* Supprimer */}
                              <button onClick={() => setConfirmDelete(p)} title="Supprimer le diagnostic"
                                style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #fecaca", background: "#fff5f5", color: "#dc2626", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ===== MODAL CONSULTATION / EDIT / VIEW ===== */}
      {patientSelectionne && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ background: "white", width: "100%", maxWidth: "520px", borderRadius: "22px", overflow: "hidden", boxShadow: "0 25px 60px rgba(0,0,0,0.25)" }}>
            {/* Header */}
            <div style={{ padding: "22px 26px", background: "linear-gradient(135deg,#1a365d,#2b6cb0)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "13px" }}>
                <div style={{ width: "44px", height: "44px", background: "rgba(255,255,255,0.2)", borderRadius: "11px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "18px" }}>
                  {patientSelectionne.nom_complet?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ margin: 0, color: "white", fontWeight: "700", fontSize: "14px" }}>{patientSelectionne.nom_complet}</p>
                  <p style={{ margin: 0, color: "rgba(255,255,255,0.6)", fontSize: "11px" }}>{modalTitle[modalMode]}</p>
                </div>
              </div>
              <button onClick={() => setPatientSelectionne(null)} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "white", width: "34px", height: "34px", borderRadius: "9px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={17} />
              </button>
            </div>

            {/* Infos patient */}
            <div style={{ padding: "18px 26px 0" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                {[["NNI", patientSelectionne.NNI || "—"], ["Téléphone", patientSelectionne.numero_tel], ["Montant", `${patientSelectionne.montant} MRU`]].map(([k, v]) => (
                  <div key={k} style={{ background: "#f8fafc", borderRadius: "9px", padding: "9px 12px" }}>
                    <p style={{ margin: 0, fontSize: "10px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" }}>{k}</p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#1a365d", fontWeight: "700" }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Zone diagnostic */}
            <div style={{ padding: "16px 26px 24px" }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "7px" }}>
                Diagnostic
              </label>

              {/* MODE VIEW : texte complet scrollable */}
              {modalMode === "view" ? (
                <div style={{
                  width: "100%", minHeight: "140px", maxHeight: "260px", overflowY: "auto",
                  padding: "14px 16px", background: "#f8fafc",
                  border: "1px solid #e2e8f0", borderRadius: "12px",
                  fontSize: "13px", color: "#1e293b", lineHeight: "1.7",
                  whiteSpace: "pre-wrap", boxSizing: "border-box"
                }}>
                  {patientSelectionne.diagnostic || "Aucun diagnostic saisi."}
                </div>
              ) : (
                <textarea
                  value={notesTemp}
                  onChange={(e) => setNotesTemp(e.target.value)}
                  placeholder="Rédigez votre diagnostic ici..."
                  style={{
                    width: "100%", height: "140px", padding: "14px 16px",
                    background: "#f8fafc", border: "1px solid #e2e8f0",
                    borderRadius: "12px", fontSize: "13px", color: "#1e293b",
                    outline: "none", resize: "vertical", fontFamily: "inherit",
                    boxSizing: "border-box", lineHeight: "1.6"
                  }}
                />
              )}

              <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
                <button onClick={() => setPatientSelectionne(null)} style={{ flex: 1, padding: "11px", background: "#f1f5f9", border: "none", borderRadius: "11px", color: "#475569", fontWeight: "600", fontSize: "13px", cursor: "pointer" }}>
                  {modalMode === "view" ? "Fermer" : "Annuler"}
                </button>
                {modalMode !== "view" && (
                  <button onClick={handleSave} disabled={saving} style={{
                    flex: 2, padding: "11px",
                    background: saving ? "#94a3b8" : "linear-gradient(135deg,#1a365d,#2b6cb0)",
                    border: "none", borderRadius: "11px", color: "white",
                    fontWeight: "700", fontSize: "13px", cursor: saving ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "7px"
                  }}>
                    {saving ? (
                      <><div style={{ width: "15px", height: "15px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> Enregistrement...</>
                    ) : (
                      <><ShieldCheck size={15} /> {modalMode === "edit" ? "Mettre à jour" : "Valider le diagnostic"}</>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL CONFIRMATION SUPPRESSION ===== */}
      {confirmDelete && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ background: "white", width: "100%", maxWidth: "400px", borderRadius: "20px", overflow: "hidden", boxShadow: "0 25px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ padding: "28px", textAlign: "center" }}>
              <div style={{ width: "56px", height: "56px", background: "#fff5f5", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Trash2 size={24} color="#dc2626" />
              </div>
              <h3 style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: "700", color: "#1a365d" }}>Supprimer le diagnostic ?</h3>
              <p style={{ margin: "0 0 24px", fontSize: "13px", color: "#64748b" }}>
                Le diagnostic de <strong>{confirmDelete.nom_complet}</strong> sera supprimé. Cette action est irréversible.
              </p>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: "12px", background: "#f1f5f9", border: "none", borderRadius: "11px", color: "#475569", fontWeight: "600", fontSize: "13px", cursor: "pointer" }}>
                  Annuler
                </button>
                <button onClick={() => handleDeleteDiagnostic(confirmDelete)} style={{ flex: 1, padding: "12px", background: "#dc2626", border: "none", borderRadius: "11px", color: "white", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}>
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default EspaceDocteurLocal;