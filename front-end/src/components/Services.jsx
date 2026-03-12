import React, { useState } from 'react';
import { 
  Stethoscope, 
  Microscope, 
  HeartPulse, 
  Baby, 
  Activity, 
  Brain,
  ChevronDown
} from 'lucide-react';

const services = [
  {
    title: "Médecine Générale",
    desc: "Suivi complet et prévention pour toute la famille avec nos praticiens experts.",
    more: "Nos médecins généralistes assurent le diagnostic, le traitement des maladies aiguës, le suivi des maladies chroniques et la coordination des soins spécialisés.",
    icon: <Stethoscope size={28} className="text-blue-500" />,
  },
  {
    title: "Cardiologie",
    desc: "Examens approfondis et soins spécialisés pour votre santé cardiovasculaire.",
    more: "Équipés des dernières technologies d'imagerie, nous réalisons des électrocardiogrammes, des épreuves d'effort et des bilans d'hypertension complets.",
    icon: <HeartPulse size={28} className="text-pink-500" />,
  },
  {
    title: "Pédiatrie",
    desc: "Un environnement doux et rassurant pour la santé et le bien-être de vos enfants.",
    more: "De la naissance à l'adolescence, nous veillons à la croissance, au développement moteur et au calendrier vaccinal de vos enfants.",
    icon: <Baby size={28} className="text-orange-400" />,
  },
  {
    title: "Laboratoire",
    desc: "Analyses médicales rapides et précises avec des équipements de pointe.",
    more: "Prélèvements sans rendez-vous et résultats disponibles en ligne sous 24h pour la majorité des analyses bio-chimiques.",
    icon: <Microscope size={28} className="text-emerald-500" />,
  },
  {
    title: "Neurologie",
    desc: "Diagnostic et traitement des troubles du système nerveux par des spécialistes.",
    more: "Prise en charge des migraines, troubles du sommeil, et pathologies neurologiques complexes avec un suivi personnalisé.",
    icon: <Brain size={28} className="text-purple-500" />,
  },
  {
    title: "Urgence 24/7",
    desc: "Une équipe réactive prête à intervenir à tout moment pour vos besoins vitaux.",
    more: "Service d'admission immédiate, plateau technique complet et réanimation pour toutes les urgences médicales et chirurgicales.",
    icon: <Activity size={28} className="text-red-500" />,
  }
];

const Services = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleService = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="services" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        
        {/* En-tête de section */}
        <div className="text-center max-w-2xl mx-auto mb-16 animate-reveal">
          <span className="text-blue-600 text-[10px] font-bold uppercase tracking-[4px] mb-4 block">
            Nos Expertises
          </span>
          <h2 className="text-3xl lg:text-4xl font-light text-slate-800 font-titre">
            Des soins spécialisés pour <br />
            <span className="font-semibold text-blue-900">votre bien-être.</span>
          </h2>
          <div className="w-12 h-1 bg-blue-500 mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Grille de services - Changée en grid-cols-3 pour les 6 services */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={index}
              className={`group p-8 rounded-[2rem] border transition-all duration-500 cursor-pointer flex flex-col justify-between ${
                activeIndex === index 
                ? 'bg-blue-50/50 border-blue-200 shadow-xl scale-[1.02]' 
                : 'bg-slate-50 border-slate-100 hover:bg-white hover:shadow-lg'
              }`}
              onClick={() => toggleService(index)}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="mb-6 p-4 inline-block rounded-2xl bg-white shadow-sm group-hover:shadow-md transition-shadow">
                    {service.icon}
                  </div>
                  <div className={`mt-2 transition-transform duration-300 ${activeIndex === index ? 'rotate-180' : ''}`}>
                    <ChevronDown size={18} className="text-slate-400" />
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-slate-800 mb-3 font-titre">
                  {service.title}
                </h3>
                
                <p className="text-slate-500 font-light leading-relaxed text-sm">
                  {service.desc}
                </p>

                {/* ZONE DYNAMIQUE */}
                <div 
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    activeIndex === index ? 'max-h-48 opacity-100 mt-6' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="p-4 bg-white rounded-xl border-l-4 border-blue-500 text-slate-600 text-sm italic font-light">
                    {service.more}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center text-blue-600 text-[10px] font-bold tracking-widest uppercase">
                <span className="group-hover:mr-2 transition-all">
                  {activeIndex === index ? "RÉDUIRE" : "EN SAVOIR PLUS"}
                </span>
                {activeIndex !== index && <div className="w-0 group-hover:w-8 h-[1px] bg-blue-600 transition-all duration-500"></div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;