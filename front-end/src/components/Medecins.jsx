import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';
import { API_BASE_URL, MEDIA_BASE_URL } from '../api/config';

const Medecins = () => {
  const navigate = useNavigate();
  const [docteurs, setDocteurs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch(`${API_BASE_URL}/doctors/`)
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        if (Array.isArray(data)) {
          setDocteurs(data);
        } else if (Array.isArray(data?.results)) {
          setDocteurs(data.results);
        } else {
          setDocteurs([]);
        }
      })
      .catch(() => {
        if (isMounted) setDocteurs([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="container mx-auto px-6 max-w-6xl">
        
        {/* Titre de la page */}
        <div className="mb-12">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Nos Spécialistes</h2>
          <p className="text-slate-500 mt-2">Consultez les meilleurs experts pour votre santé.</p>
        </div>

        {/* Grille des médecins */}
        {loading ? (
          <div className="text-center text-slate-500 py-16">
            Chargement des médecins...
          </div>
        ) : docteurs.length === 0 ? (
          <div className="text-center text-slate-500 py-16">
            Aucun médecin disponible pour le moment.
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {docteurs.map((doc) => (
            <div key={doc.id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all group border border-slate-100">
              {/* Photo du Docteur */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={doc.photo ? `${MEDIA_BASE_URL}${doc.photo}` : "https://via.placeholder.com/300x400"}
                  alt={doc.user?.username || doc.username || "Médecin"}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-xs font-bold text-slate-800">4.9</span>
                </div>
              </div>

              {/* Infos Docteur */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 leading-tight">
                      {doc.user?.username || doc.username}
                    </h3>
                    <p className="text-blue-600 font-bold text-xs uppercase tracking-wider mt-1">
                      {doc.specialite}
                    </p>
                  </div>
                </div>
                
                <p className="text-slate-500 text-sm line-clamp-2 mb-6">
                  {doc.description || "Médecin disponible pour des consultations dans cette spécialité."}
                </p>

                <div className="flex items-center gap-4 border-t border-slate-50 pt-6">
                  <button 
                    onClick={() => navigate(`/consultation?doctor=${doc.id}`)}
                    className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors shadow-lg shadow-slate-200"
                  >
                    Prendre RDV <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
};

export default Medecins;