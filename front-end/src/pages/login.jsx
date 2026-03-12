import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Hospital, Lock, User, Shield, Stethoscope } from "lucide-react";
import { API_BASE_URL } from "../api/config";

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const meta = useMemo(
    () => ({
      title: "Connexion",
      subtitle: "Entrez vos identifiants. La redirection dépend de votre rôle.",
      icon: Shield,
      accent: "from-emerald-600 to-teal-600",
    }),
    [],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || data.username?.[0] || data.password?.[0] || "Identifiants incorrects");
        return;
      }

      if (data.access) {
        localStorage.setItem("token", data.access);
        if (data.refresh) localStorage.setItem("refreshToken", data.refresh);

        // Récupérer le rôle réel depuis le backend
        const meRes = await fetch(`${API_BASE_URL}/me/`, {
          headers: { Authorization: `Bearer ${data.access}` },
        });
        const me = await meRes.json();
        let backendRole = me?.role; // admin | secretary | secretaire | doctor | unknown

        // Normaliser les libellés renvoyés par le backend
        if (backendRole === "secretaire") backendRole = "secretary";

        if (!backendRole || backendRole === "unknown") {
          setError("Rôle utilisateur introuvable.");
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          return;
        }

        localStorage.setItem("userRole", backendRole);

        onLoginSuccess?.(me);

        // Redirection
        if (backendRole === "admin") navigate("/admin");
        else if (backendRole === "secretary") navigate("/secretaire");
        else navigate("/docteur");
      } else {
        setError("Réponse serveur invalide");
      }
    } catch {
      setError("Erreur de connexion. Vérifiez que le backend est démarré.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-slate-50 via-sky-50/50 to-emerald-50/60 flex items-center">
      <div className="mx-auto w-full max-w-md px-4 py-10">
          <section className="rounded-3xl bg-white p-7 sm:p-10 shadow-xl ring-1 ring-slate-200/70">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Connexion
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  Bienvenue
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Entrez vos identifiants pour continuer.
                </p>
              </div>
              <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${meta.accent} text-white shadow-lg flex items-center justify-center`}>
                {React.createElement(meta.icon, { className: "h-6 w-6" })}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Nom d’utilisateur</label>
                <div className="flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-3 focus-within:border-sky-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-100">
                  <User className="h-5 w-5 text-slate-400" />
                  <input
                    className="w-full bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400"
                    type="text"
                    placeholder="Ex: admin_principal"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Mot de passe</label>
                <div className="flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-3 focus-within:border-sky-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-100">
                  <Lock className="h-5 w-5 text-slate-400" />
                  <input
                    className="w-full bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400"
                    type="password"
                    placeholder="Votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-xl bg-gradient-to-r ${meta.accent} px-4 py-3.5 text-sm font-bold text-white shadow-lg transition hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]`}
              >
                {loading ? "Connexion..." : "Connexion"}
              </button>

              <p className="text-center text-xs text-slate-400">
                Besoin d’aide ? Contactez l’administrateur principal.
              </p>
            </form>
          </section>
      </div>
    </div>
  );
}