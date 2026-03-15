import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User, ShieldCheck, ArrowRight, Loader2, ArrowLeft, Stethoscope, HelpCircle } from "lucide-react";
// Importez API_BASE_URL directement comme dans votre ancien code qui marchait
import { API_BASE_URL } from "../api/config"; 

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // On utilise le format exact de votre ancien code qui fonctionnait
      const res = await fetch(`${API_BASE_URL}/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoading(false); // On arrête le chargement immédiatement si erreur
        setError(data.detail || "Identifiants incorrects");
        return;
      }

      if (data.access) {
        localStorage.setItem("token", data.access);
        if (data.refresh) localStorage.setItem("refreshToken", data.refresh);

        const meRes = await fetch(`${API_BASE_URL}/me/`, {
          headers: { Authorization: `Bearer ${data.access}` },
        });
        
        const me = await meRes.json();
        let backendRole = me?.role;

        if (backendRole === "secretaire") backendRole = "secretary";

        if (!backendRole || backendRole === "unknown") {
          setLoading(false);
          setError("Rôle utilisateur introuvable.");
          return;
        }

        localStorage.setItem("userRole", backendRole);
        onLoginSuccess?.(me);

        // Redirection
        if (backendRole === "admin") navigate("/admin");
        else if (backendRole === "secretary") navigate("/secretaire");
        else navigate("/docteur");
      }
    } catch (err) {
      setLoading(false); // On arrête le chargement en cas de crash réseau
      setError("Le serveur ne répond pas. Vérifiez que le backend est lancé.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 relative">
      
      {/* Bouton retour */}
      <button 
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 flex items-center gap-2 text-slate-500 hover:text-[#1a365d] transition-colors font-semibold text-sm group"
      >
        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
        Retour
      </button>

      <div className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row">
        
        {/* Panneau Bleu */}
        <div className="md:w-[40%] bg-gradient-to-br from-[#1a365d] to-[#2b6cb0] p-10 text-white flex flex-col justify-between">
          <div>
            <div className="bg-white/10 w-fit p-3 rounded-2xl backdrop-blur-md mb-8">
              <ShieldCheck className="h-7 w-7 text-blue-200" />
            </div>
            <h2 className="text-4xl font-bold leading-tight">Portail <br/> Administratif</h2>
            <p className="mt-4 text-blue-100/70">Espace réservé au personnel autorisé.</p>
          </div>
          
          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl mt-8">
            <p className="text-xs text-blue-100/60 leading-relaxed">
              En cas d'oubli, contactez <strong>l'administrateur principal</strong> pour réinitialiser vos accès.
            </p>
          </div>
        </div>

        {/* Panneau Formulaire */}
        <div className="md:w-[60%] p-10 lg:p-16 bg-white">
          <div className="max-w-[360px] mx-auto">
            <div className="mb-10">
              <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center mb-6 border border-blue-100">
                <Stethoscope className="h-6 w-6 text-[#2b6cb0]" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900">Connexion</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium animate-pulse">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Utilisateur</label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 focus-within:border-[#2b6cb0] focus-within:bg-white transition-all">
                  <User className="h-5 w-5 text-slate-400" />
                  <input
                    className="w-full bg-transparent outline-none text-sm font-medium"
                    type="text"
                    placeholder="Identifiant"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Mot de passe</label>
                  <button type="button" onClick={() => setShowHelp(!showHelp)} className="text-[11px] font-bold text-blue-600 hover:underline">Oublié ?</button>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 focus-within:border-[#2b6cb0] focus-within:bg-white transition-all">
                  <Lock className="h-5 w-5 text-slate-400" />
                  <input
                    className="w-full bg-transparent outline-none text-sm font-medium"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {showHelp && (
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-[11px] text-blue-800 flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Contactez l'administrateur principal pour réinitialiser votre accès.
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[#1a365d] py-4 text-white font-bold text-sm shadow-lg hover:bg-[#2b6cb0] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Accéder au Dashboard"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}