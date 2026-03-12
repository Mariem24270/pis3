import React, { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../api/config";

function EspaceDocteurLocal() {
  // 1. Données patients récupérées depuis l'API (consultations payées)
  const [patients, setPatients] = useState([]);

  // 2. ÉTATS
  const [recherche, setRecherche] = useState("");
  const [patientSelectionne, setPatientSelectionne] = useState(null);
  const [notesTemp, setNotesTemp] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Ce dictionnaire va stocker les diagnostics LOCALEMENT { "idReservation": "Fièvre...", ... }
  const [diagnosticsLocaux, setDiagnosticsLocaux] = useState(() => {
    const dataSauvegardee = localStorage.getItem("mes_diagnostics_secrets");
    return dataSauvegardee ? JSON.parse(dataSauvegardee) : {};
  });

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
    const headers = token
      ? { Authorization: `Bearer ${token}` }
      : {};

    fetch(`${API_BASE_URL}/consultations-payees/`, { headers })
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        const arr = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
        // On mappe le format backend → format local utilisé dans le tableau
        const mapped = arr.map((r) => ({
          id: r.id,
          nomComplet: r.nom_complet,
          nni: r.NNI || r.nni,
          telephone: r.numero_tel,
          dateRdv: new Date(r.date).toLocaleDateString("fr-FR"),
          heureRdv: new Date(r.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        }));
        setPatients(mapped);
      })
      .catch(() => {
        if (isMounted) setError("Impossible de charger les patients. Vérifiez le backend.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 4. MOTEUR DE RECHERCHE
  const patientsFiltres = useMemo(
    () =>
      patients.filter((p) => {
        const terme = recherche.toLowerCase();
        return (
          (p.nomComplet || "").toLowerCase().includes(terme) ||
          (p.telephone || "").includes(terme) ||
          (p.nni || "").includes(terme)
        );
      }),
    [patients, recherche],
  );

  // 5. ACTIONS DU MODAL
  const ouvrirModal = (patient) => {
    setPatientSelectionne(patient);
    // Si un diagnostic existe déjà dans notre dictionnaire local, on l'affiche
    setNotesTemp(diagnosticsLocaux[patient.id] || "");
  };

  const sauvegarderDiagnostic = (e) => {
    e.preventDefault();
    
    // On met à jour le dictionnaire
    const nouveauDictionnaire = {
      ...diagnosticsLocaux,
      [patientSelectionne.id]: notesTemp,
    };
    
    // On met à jour l'état ET on sauvegarde dans le navigateur du docteur
    setDiagnosticsLocaux(nouveauDictionnaire);
    localStorage.setItem("mes_diagnostics_secrets", JSON.stringify(nouveauDictionnaire));
    
    setPatientSelectionne(null); // Ferme le modal
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* EN-TÊTE & BARRE DE RECHERCHE */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">Mes Patients</h1>
            <p className="text-slate-500 font-medium mt-1">Carnet de consultation local et sécurisé.</p>
          </div>
          
          <div className="w-full md:w-1/3 relative">
            <svg className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text" 
              placeholder="Rechercher nom, NNI ou tél..." 
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* LISTE DES PATIENTS (TABLEAU) */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Patient</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact & NNI</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Heure</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {patientsFiltres.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-10 text-slate-400">Aucun patient trouvé.</td></tr>
                ) : (
                  patientsFiltres.map((patient) => {
                    // On vérifie si ce patient a déjà un diagnostic dans notre dictionnaire local
                    const aUnDiagnostic = !!diagnosticsLocaux[patient.id];

                    return (
                      <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <p className="font-bold text-slate-800">{patient.nomComplet}</p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm font-medium text-slate-600">{patient.telephone}</p>
                          <p className="text-xs text-slate-400 font-mono">NNI: {patient.nni}</p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm font-bold text-slate-700">{patient.dateRdv}</p>
                          <p className="text-xs text-slate-500">{patient.heureRdv}</p>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button 
                            onClick={() => ouvrirModal(patient)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                              aUnDiagnostic 
                                ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white" // Style si déjà diagnostiqué
                                : "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"       // Style si pas encore diagnostiqué
                            }`}
                          >
                            {aUnDiagnostic ? "Voir le diagnostic" : "Diagnostiquer"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* MODAL : DOSSIER MÉDICAL DU PATIENT (Local) */}
      {patientSelectionne && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            
            <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
              <div>
                <h2 className="text-xl font-bold">Carnet Secret (Local)</h2>
                <p className="text-slate-400 text-sm mt-1">{patientSelectionne.nomComplet} • {patientSelectionne.dateRdv}</p>
              </div>
              <button onClick={() => setPatientSelectionne(null)} className="text-slate-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Corps du Modal (Formulaire) */}
            <form onSubmit={sauvegarderDiagnostic} className="p-8 space-y-4">
              
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-sm font-bold text-slate-800">
                    Diagnostic et prescriptions
                  </label>
                  
                  {/* NOUVEAU DESIGN : Petit badge de sécurité discret */}
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    Sauvegarde locale sécurisée
                  </div>
                </div>
                
                <textarea 
                  value={notesTemp}
                  onChange={(e) => setNotesTemp(e.target.value)}
                  placeholder="Écrivez vos notes cliniques ici..."
                  className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all resize-none text-slate-700 leading-relaxed"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setPatientSelectionne(null)} className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors">
                  Fermer
                </button>
                <button type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all">
                  Sauvegarder les notes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EspaceDocteurLocal;