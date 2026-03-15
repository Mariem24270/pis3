import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarDays, 
  ArrowRight, 
  Stethoscope, 
  Pill, 
  PlusSquare, 
  ShieldCheck,
  Check 
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="font-sans antialiased">
      
      {/* =========================================
          SECTION 1 : HERO (L'en-tête premium)
          ========================================= */}
      <section className="relative bg-gradient-to-b lg:bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] min-h-[700px] flex items-center overflow-hidden py-24">
        
        {/* Icônes flottantes en arrière-plan */}
        <div className="absolute top-1/4 left-1/3 opacity-[0.07] text-white z-0">
          <Stethoscope size={80} strokeWidth={1} />
        </div>
        <div className="absolute bottom-1/4 right-1/3 opacity-[0.07] text-white z-0">
          <Pill size={60} strokeWidth={1} />
        </div>

        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-8">
            
            {/* GAUCHE : Texte & Bouton */}
            <div className="w-full lg:w-1/2 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-lg">
                <ShieldCheck className="text-[#FFC82C]" size={16} />
                <span className="text-blue-50 text-xs font-bold uppercase tracking-widest">
                  Excellence Médicale en Mauritanie
                </span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-[1.15]">
                Vivez en  <br />
                <span className="text-[#FFC82C] relative inline-block">
                  meilleure santé.
                  <div className="absolute -bottom-2 left-0 w-full h-2 bg-[#00A4D8] rounded-full opacity-80" style={{ borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%' }}></div>
                </span>
              </h1>
              
              <p className="text-lg text-blue-100/90 max-w-lg leading-relaxed font-medium">
                Consultez les meilleurs spécialistes à Nouakchott. 
                Prenez rendez-vous en ligne, payez via Banquily et gérez votre santé en toute simplicité.
              </p>

              <div className="pt-4">
                <button
                  onClick={() => navigate("/consultation")}
                  className="group flex items-center justify-center gap-3 bg-white text-[#1a365d] px-8 py-4 rounded-full font-bold text-lg shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all hover:bg-slate-50 hover:shadow-[0_8px_40px_rgb(255,255,255,0.2)] active:scale-95 w-full sm:w-auto"
                >
                  <CalendarDays size={24} className="text-[#00A4D8]" />
                  Prendre rendez-vous
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform text-[#1a365d]" />
                </button>
              </div>
            </div>

            {/* DROITE : Image Hero */}
            <div className="relative w-full lg:w-1/2 flex items-center justify-center lg:justify-end mt-10 lg:mt-0">
              {/* Forme Cyan (Doctolib) en arrière-plan */}
              <div 
                className="absolute w-[320px] h-[320px] lg:w-[450px] lg:h-[450px] bg-[#00A4D8]/80 blur-sm -top-6 -right-6 lg:-right-10 z-0"
                style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }}
              ></div>

              <div className="relative z-10 group">
                <img 
                  src="https://img.freepik.com/photos-gratuite/portrait-professionnel-sante-posant-pour-photo-bras-croises_1098-19293.jpg?semt=ais_hybrid&w=740&q=80" 
                  alt="Docteur souriant" 
                  className="w-[320px] h-[380px] lg:w-[420px] lg:h-[480px] object-cover shadow-2xl border-[6px] border-white"
                  style={{ borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }} 
                />
                
               
              </div>
            </div>

          </div>
        </div>
      </section>


       
      </div>
  
  );
};

export default Home;