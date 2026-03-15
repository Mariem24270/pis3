import React from 'react';
import { Check, Search, MessageCircle, Shield, CreditCard, ArrowRight, UserCheck } from 'lucide-react';
import { useNavigate } from "react-router-dom";
const Roles = () => {
  const navigate = useNavigate();
  return (
    <section className="py-16 bg-white font-sans overflow-hidden">
      <div className="container mx-auto px-6 max-w-5xl">
        
        {/* --- HEADER COMPACT --- */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0B2136] mb-4 tracking-tight">
            Une solution santé <span className="text-blue-600 font-black">directe</span>
          </h2>
          <p className="text-slate-500 text-base max-w-xl mx-auto">
            L'accès aux spécialistes simplifié par <strong>Bankily</strong> et <strong>WhatsApp</strong>, sans création de compte.
          </p>
        </div>

        <div className="space-y-24">
          
          {/* --- BLOC PATIENT (Code inchangé) --- */}
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-5">
              <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-[10px] font-bold uppercase tracking-widest">
                Service Patient
              </div>
              <h3 className="text-2xl font-bold text-[#0B2136]">
                Réservation instantanée
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Trouvez votre médecin et réservez votre créneau immédiatement. Le processus est conçu pour être terminé en moins de 2 minutes.
              </p>
              
              <ul className="grid gap-3">
                {[
                  { t: "Zéro Inscription", icon: <UserCheck size={16}/> },
                  { t: "Paiement Bankily Rapide", icon: <CreditCard size={16}/> },
                  { t: "Ticket WhatsApp automatique", icon: <MessageCircle size={16}/> }
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <span className="text-blue-600">{item.icon}</span>
                    {item.t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex-1 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[340px]">
                <div className="aspect-square bg-slate-100 rounded-3xl overflow-hidden shadow-lg border border-slate-100">
                  <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover" alt="Medical"/>
                  <div className="absolute -bottom-4 -left-4 bg-white p-3 rounded-2xl shadow-xl border border-slate-50 flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                      <Check size={16} strokeWidth={3} />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">Paiement validé</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- BLOC PRATICIEN (Design Organique Corrigé) --- */}
          <div className="flex flex-col-reverse lg:flex-row items-center gap-12 relative">
            
            {/* Visuel Organique CORRIGÉ (Style image_2.png) */}
            <div className="flex-1 flex justify-center lg:justify-start relative">
               <div className="relative w-full max-w-sm flex items-center justify-center">
                  
                  {/* Forme grise principale avec la photo */}
                  <div className="relative rounded-[40%_60%_70%_30%/40%_50%_60%_50%] overflow-hidden aspect-square w-[280px] h-[280px] z-10 border-4 border-white shadow-xl">
                    <img src="https://t4.ftcdn.net/jpg/01/36/18/77/240_F_136187711_qeBMOwkPdTg1dCN8e5TR1AmduXDz60Xn.jpg" className="w-full h-full object-cover" alt="Medical"/>

                      className="w-full h-full object-cover" 
                      alt="Médecin" 
                    />
                  </div>

                  {/* Bulles de couleurs organiques sur le côté */}
                  <div className="absolute top-0 right-0 w-full h-full -z-10 translate-x-12 translate-y-6">
                    {/* Bulle Rose/Fuchsia */}
                    <div className="absolute top-0 right-10 w-32 h-32 bg-[#FF4C8B] rounded-[50%_50%_20%_80%/80%_20%_80%_20%] opacity-90 blur-sm"></div>
                    {/* Bulle Bleu Vif */}
                    <div className="absolute bottom-10 right-0 w-48 h-48 bg-[#00AEEF] rounded-[20%_80%_20%_80%/80%_20%_80%_20%] opacity-90 blur-sm"></div>
                  </div>
               </div>
            </div>

            {/* Texte à droite (Style conservé) */}
            <div className="flex-1 space-y-5">
              <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 rounded-md text-[10px] font-bold uppercase tracking-widest">
                Administration
              </div>
              <h3 className="text-2xl font-bold text-[#0B2136]">
                Gestion des flux simplifiée
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Validez les reçus Bankily et accédez aux NNI des patients en un clin d'œil. Une interface pensée pour l'efficacité du secrétariat médical.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold text-slate-600 flex items-center gap-2 tracking-tight">
                   <Shield size={14} className="text-blue-500" /> Sécurité NNI
                </span>
                <span className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold text-slate-600 flex items-center gap-2 tracking-tight">
                   <Check size={14} className="text-emerald-500" /> Archives Bankily
                </span>
              </div>
             <button
  onClick={() => navigate("/login")}
  className="flex items-center gap-2 text-blue-600 font-bold text-sm hover:translate-x-1 transition-transform pt-4"
>
  Espace gestion <ArrowRight size={16} />
</button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Roles;