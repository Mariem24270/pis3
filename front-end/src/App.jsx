import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Services from "./components/Services";
import Roles from "./components/Roles"; // 1. Ne pas oublier d'importer Roles
import Aide from "./components/Aide";   // 2. Ne pas oublier d'importer Aide
import Consultation from "./pages/consultation";
import Medecins from "./components/Medecins";
import EspaceDocteur from "./pages/EspaceDocteur";
import Login from "./pages/login";
import AdminDashboard from "./pages/admin";
import Secretaire from "./pages/Secretaire";

function RequireAuth({ children }) {
  const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
  if (!token) return <Login />;
  return children;
}

function NotAuthorized() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Accès refusé</h2>
        <p>Vous n&apos;avez pas le rôle nécessaire pour voir cette page.</p>
        <a href="/" className="text-blue-600 underline">Retour à l&apos;accueil</a>
      </div>
    </div>
  );
}

function RequireRole({ allow, children }) {
  const role = localStorage.getItem("userRole");
  if (!role) return <Login />;
  const allowed = Array.isArray(allow) ? allow : [allow];
  if (!allowed.includes(role)) {
    // Redirection automatique selon le rôle
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
function Home() {
  return (
    <>
      <Hero />
      <Services />
      <Roles /> {/* 3. Ajouter Roles ici */}
      <Aide />  {/* 4. Ajouter Aide ici */}
    </>
  );
}

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Page où le patient choisit un médecin et un créneau */}
        <Route path="/consultation" element={<Consultation />} />
        {/* Page liste des médecins */}
        <Route path="/medecins" element={<Medecins />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <RequireAuthAndRole allow="admin">
              <AdminDashboard onLogout={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("userRole");
                window.location.href = "/login";
              }} />
            </RequireAuthAndRole>
          }
        />
        <Route
          path="/secretaire"
          element={
            <RequireAuthAndRole allow="secretary">
              <Secretaire onLogout={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("userRole");
                window.location.href = "/login";
              }} />
            </RequireAuthAndRole>
          }
        />
        <Route
          path="/docteur"
          element={
            <RequireAuthAndRole allow="doctor">
              <EspaceDocteur />
            </RequireAuthAndRole>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;