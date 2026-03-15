import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Services from "./components/Services";
import Roles from "./components/Roles";
import Aide from "./components/Aide";
import Consultation from "./pages/consultation";
import Medecins from "./components/Medecins";
import EspaceDocteur from "./pages/EspaceDocteur";
import Login from "./pages/login";
import AdminDashboard from "./pages/admin";
import Secretaire from "./pages/Secretaire";

// --- COMPOSANTS DE PROTECTION ---

function RequireAuth({ children }) {
  const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
  if (!token) return <Login />;
  return children;
}

function NotAuthorized() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-slate-50">
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold mb-2 text-slate-900">Accès refusé</h2>
        <p className="text-slate-600 mb-4">Vous n'avez pas le rôle nécessaire pour voir cette page.</p>
        <a href="/" className="text-blue-600 font-bold hover:underline font-medium">Retour à l'accueil</a>
      </div>
    </div>
  );
}

function RequireRole({ allow, children }) {
  const role = localStorage.getItem("userRole");
  if (!role) return <Login />;
  const allowed = Array.isArray(allow) ? allow : [allow];
  if (!allowed.includes(role)) {
    if (role === "admin") window.location.href = "/admin";
    else if (role === "secretary") window.location.href = "/secretaire";
    else if (role === "doctor") window.location.href = "/docteur";
    return <NotAuthorized />;
  }
  return children;
}

function RequireAuthAndRole({ allow, children }) {
  return (
    <RequireAuth>
      <RequireRole allow={allow}>{children}</RequireRole>
    </RequireAuth>
  );
}

// --- LOGIQUE D'AFFICHAGE DU HEADER ---

function NavigationWrapper() {
  const location = useLocation();
  
  // Liste des routes où on ne veut PAS de header (Login et Dashboards)
  const hideHeaderOn = ["/login", "/admin", "/secretaire", "/docteur"];
  
  // On cache le header si la route actuelle est dans la liste
  if (hideHeaderOn.includes(location.pathname)) {
    return null;
  }

  return <Header />;
}

// --- PAGES ---

function Home() {
  return (
    <>
      <Hero />
      <Services />
      <Roles />
      <Aide />
    </>
  );
}

// --- COMPOSANT PRINCIPAL ---

function App() {
  return (
    <Router>
      {/* Ce wrapper gère intelligemment l'affichage du Header */}
      <NavigationWrapper />
      
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/consultation" element={<Consultation />} />
          <Route path="/medecins" element={<Medecins />} />
          <Route path="/login" element={<Login />} />
          
          {/* Routes Admin */}
          <Route
            path="/admin"
            element={
              <RequireAuthAndRole allow="admin">
                <AdminDashboard onLogout={() => {
                  localStorage.clear();
                  window.location.href = "/login";
                }} />
              </RequireAuthAndRole>
            }
          />

          {/* Routes Secrétaire */}
          <Route
            path="/secretaire"
            element={
              <RequireAuthAndRole allow="secretary">
                <Secretaire onLogout={() => {
                  localStorage.clear();
                  window.location.href = "/login";
                }} />
              </RequireAuthAndRole>
            }
          />

          {/* Routes Docteur */}
          <Route
            path="/docteur"
            element={
              <RequireAuthAndRole allow="doctor">
                <EspaceDocteur />
              </RequireAuthAndRole>
            }
          />
        </Routes>
      </main>
    </Router>
  );
}

export default App;