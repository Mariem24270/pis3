import React from 'react';
import { ChevronRight, Globe, HelpCircle } from 'lucide-react';

const Aide = () => {
  // Structure prête pour la traduction (FR/EN)
  const content = {
    fr: {
      sections: [
        {
          title: "Notre Établissement",
          links: ["À propos de l'Hôpital", "Nos engagements", "Recrutement", "Presse & Médias", "Protection des données"]
        },
        {
          title: "Services aux Patients",
          links: ["Prendre rendez-vous", "Guide d'hospitalisation", "Tarifs et conventions", "Vos droits et devoirs"]
        },
        {
          title: "Spécialités en Mauritanie",
          links: ["Médecine Générale", "Cardiologie", "Pédiatrie", "Gynécologie", "Urgences 24h/24", "Laboratoire d'analyses"]
        },
        {
          title: "Support",
          links: ["Centre d'aide en ligne", "Contactez-nous", "Numéros d'urgence", "FAQ"]
        }
      ],
      copyright: "Tous droits réservés."
    }
  };

  const data = content.fr; // Par défaut en Français

  return (
    <section id="aide" className="py-20 bg-[#f8fafc] border-t border-slate-200">
      <div className="container mx-auto px-6">
        
        {/* Titre avec la police Montserrat */}
        <div className="mb-16 relative">
          <h2 className="text-3xl font-light text-[#1a365d] font-titre tracking-tight">
            Aide et <span className="font-semibold">Information</span>
          </h2>
          
          {/* Flèche scribble stylisée (Image 1) */}
          <div className="absolute -top-4 left-60 opacity-20 hidden lg:block">
            <svg width="50" height="50" viewBox="0 0 100 100" fill="none" className="text-blue-600 stroke-current stroke-[2]">
               <path d="M10,10 Q40,0 40,40 T70,70" strokeDasharray="5 5" />
               <path d="M65,70 L70,75 L75,70" />
            </svg>
          </div>
        </div>

        {/* Grille des liens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {data.sections.map((section, idx) => (
            <div key={idx} className="space-y-6">
              <h3 className="text-blue-600 font-bold text-[11px] uppercase tracking-[3px] font-titre">
                {section.title}
              </h3>
              <ul className="space-y-4">
                {section.links.map((link, i) => (
                  <li key={i}>
                    <a href="#" className="text-slate-500 hover:text-blue-900 text-sm font-corps transition-all flex items-center group">
                      <span className="group-hover:translate-x-1 transition-transform duration-300">{link}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

       {/* Footer Ultra Épuré */}
        <div className="mt-32 flex flex-col md:flex-row justify-between items-end gap-12">
          
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 group cursor-pointer">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-sm font-medium text-slate-900 uppercase tracking-widest">🇲🇷 Mauritanie</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold tracking-widest">
                <button className="text-blue-600">FR</button>
                <button className="text-slate-300 hover:text-slate-900 transition-colors">EN</button>
              </div>
            </div>
            <p className="text-slate-400 text-sm font-light max-w-xs leading-relaxed font-corps">
              Excellence médicale au cœur de Nouakchott. 
              Services disponibles en français et anglais.
            </p>
          </div>

          <div className="text-[10px] text-slate-300 uppercase tracking-[4px] font-medium">
            © 2026 Hôpital Local / All Rights Reserved
          </div>
        </div>

      </div>
    </section>
  );
};
export default Aide;