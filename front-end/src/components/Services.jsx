import React, { useState } from 'react';
import {
  Stethoscope, Microscope, HeartPulse,
  Baby, Activity, Brain, ArrowUpRight, ChevronDown,
  Eye, Bone, Pill, Wind, Thermometer, Syringe,
} from 'lucide-react';

const ALL_SERVICES = [
  { title:"Médecine Générale",       desc:"Consultations, suivi chronique, prévention et orientation spécialisée.",               more:"Nos généralistes prennent en charge toutes les pathologies du quotidien : fièvre, infections, maladies chroniques (diabète, hypertension), et coordonnent les soins spécialisés si nécessaire.",                                                icon:Stethoscope, color:"#6366f1", bg:"rgba(99,102,241,0.07)",   glow:"rgba(99,102,241,0.15)",  tag:"Généraliste"    },
  { title:"Cardiologie",             desc:"ECG, bilan cardiaque, suivi de l'hypertension et des arythmies.",                      more:"Électrocardiogrammes, épreuves d'effort, holter tensionnel, échodoppler cardiaque. Suivi des insuffisances cardiaques, valvulopathies et maladies coronariennes.",                                                                     icon:HeartPulse,  color:"#f43f5e", bg:"rgba(244,63,94,0.07)",    glow:"rgba(244,63,94,0.15)",   tag:"Cardiologie"    },
  { title:"Pédiatrie",               desc:"Suivi de croissance, vaccins et soins pour enfants de 0 à 16 ans.",                    more:"Consultations nourrissons, bilans de santé, carnet vaccinal, maladies infantiles, troubles du comportement et développement psychomoteur.",                                                                                           icon:Baby,        color:"#f97316", bg:"rgba(249,115,22,0.07)",   glow:"rgba(249,115,22,0.15)",  tag:"Pédiatrie"      },
  { title:"Laboratoire d'Analyses",  desc:"Bilan sanguin, urinaire, microbiologie et sérologie sous 24h.",                        more:"NFS, glycémie, bilan hépatique et rénal, ionogramme, sérologies infectieuses (paludisme, typhoïde, hépatites), ECBU, antibiogramme et bien d'autres analyses.",                                                                     icon:Microscope,  color:"#10b981", bg:"rgba(16,185,129,0.07)",  glow:"rgba(16,185,129,0.15)",  tag:"Laboratoire"    },
  { title:"Neurologie",              desc:"Migraines, AVC, épilepsie et troubles du système nerveux.",                             more:"EEG, bilan de mémoire, céphalées chroniques, sclérose en plaques, neuropathies périphériques et maladies neurodégénératives.",                                                                                                    icon:Brain,       color:"#8b5cf6", bg:"rgba(139,92,246,0.07)",  glow:"rgba(139,92,246,0.15)",  tag:"Neurologie"     },
  { title:"Urgences 24h/24",         desc:"Admission immédiate, réanimation et plateau technique complet.",                        more:"Ouvert 24h/24 et 7j/7. Traumatologie, détresses respiratoires, douleurs thoraciques, urgences pédiatriques et chirurgicales.",                                                                                                  icon:Activity,    color:"#ef4444", bg:"rgba(239,68,68,0.07)",   glow:"rgba(239,68,68,0.15)",   tag:"Urgences"       },
  { title:"Ophtalmologie",           desc:"Bilan visuel, fond d'œil, glaucome et chirurgie réfractive.",                          more:"Acuité visuelle, lunettes/lentilles, glaucome, cataracte, rétinopathie diabétique et infections oculaires.",                                                                                                                   icon:Eye,         color:"#0ea5e9", bg:"rgba(14,165,233,0.07)",  glow:"rgba(14,165,233,0.15)",  tag:"Ophtalmologie"  },
  { title:"Orthopédie",              desc:"Fractures, entorses, arthrose et chirurgie ostéo-articulaire.",                        more:"Fractures, luxations, ligamentoplasties, prothèses de hanche et genou, scoliose, ostéoporose et rééducation post-opératoire.",                                                                                                  icon:Bone,        color:"#64748b", bg:"rgba(100,116,139,0.07)", glow:"rgba(100,116,139,0.15)", tag:"Orthopédie"     },
  { title:"Pneumologie",             desc:"Asthme, BPCO, tuberculose et pathologies respiratoires.",                               more:"Spirométrie, fibroscopie bronchique, BPCO, pneumonies, pleurésies, apnée du sommeil et sevrage tabagique.",                                                                                                                    icon:Wind,        color:"#06b6d4", bg:"rgba(6,182,212,0.07)",   glow:"rgba(6,182,212,0.15)",   tag:"Pneumologie"    },
  { title:"Endocrinologie",          desc:"Diabète, thyroïde, hormones et maladies métaboliques.",                                 more:"Diabète type 1 et 2, hypothyroïdie, hyperthyroïdie, obésité, ostéoporose et insuffisance surrénalienne.",                                                                                                                       icon:Thermometer, color:"#d946ef", bg:"rgba(217,70,239,0.07)",  glow:"rgba(217,70,239,0.15)",  tag:"Endocrinologie" },
  { title:"Gynécologie",             desc:"Suivi de grossesse, contraception et santé de la femme.",                               more:"Échographies obstétricales, suivi prénatal, frottis cervico-vaginal, colposcopie, infections gynécologiques et ménopause.",                                                                                                     icon:Syringe,     color:"#ec4899", bg:"rgba(236,72,153,0.07)",  glow:"rgba(236,72,153,0.15)",  tag:"Gynécologie"    },
  { title:"Dermatologie",            desc:"Acné, eczéma, psoriasis et maladies de la peau.",                                       more:"Dermatite atopique, psoriasis, acné sévère, mycoses, verrues, grains de beauté suspects et photodermatoses.",                                                                                                                  icon:Pill,        color:"#a3e635", bg:"rgba(163,230,53,0.07)",  glow:"rgba(163,230,53,0.15)",  tag:"Dermatologie"   },
];

const INITIAL_COUNT = 6;

export default function Services() {
  const [active,  setActive]  = useState(null);
  const [hovered, setHovered] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const services = showAll ? ALL_SERVICES : ALL_SERVICES.slice(0, INITIAL_COUNT);

  return (
    <section id="services" className="py-28 relative overflow-hidden" style={{ background: "#f9fafb" }}>

      {/* ── Blob décoratifs style Stripe ── */}
      <div className="absolute pointer-events-none" style={{ top:"-120px", left:"-120px", width:"500px", height:"500px", borderRadius:"50%", background:"radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)" }}/>
      <div className="absolute pointer-events-none" style={{ bottom:"-100px", right:"-80px", width:"420px", height:"420px", borderRadius:"50%", background:"radial-gradient(circle, rgba(244,63,94,0.07) 0%, transparent 70%)" }}/>
      <div className="absolute pointer-events-none" style={{ top:"40%", left:"60%", width:"300px", height:"300px", borderRadius:"50%", background:"radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)" }}/>

      <div className="container mx-auto px-6 relative" style={{ maxWidth: "1100px" }}>

        {/* ── En-tête ── */}
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

        {/* ── Grille de cartes Glassmorphism ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s, i) => {
            const Icon   = s.icon;
            const isOpen = active === i;
            const isHov  = hovered === i;

            return (
              <div
                key={i}
                onClick={() => setActive(isOpen ? null : i)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background:    isOpen ? "#ffffff" : "rgba(255,255,255,0.7)",
                  backdropFilter:"blur(20px)",
                  WebkitBackdropFilter:"blur(20px)",
                  border:        isOpen
                    ? `1.5px solid ${s.color}55`
                    : `1px solid rgba(0,0,0,0.07)`,
                  borderRadius:  "20px",
                  padding:       "24px",
                  cursor:        "pointer",
                  transition:    "all 0.3s cubic-bezier(0.4,0,0.2,1)",
                  boxShadow:     isOpen
                    ? `0 20px 60px -10px ${s.glow}, 0 4px 20px rgba(0,0,0,0.06)`
                    : isHov
                      ? "0 12px 40px -8px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.04)"
                      : "0 2px 12px rgba(0,0,0,0.04)",
                  transform:     isHov && !isOpen ? "translateY(-3px)" : "translateY(0)",
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div style={{
                      width:"46px", height:"46px", borderRadius:"13px",
                      background: isOpen ? s.color : s.bg,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      transition:"all 0.3s",
                      boxShadow: isOpen ? `0 8px 20px ${s.glow}` : "none",
                    }}>
                      <Icon size={20} strokeWidth={1.8} color={isOpen ? "#fff" : s.color}/>
                    </div>
                    <span style={{
                      fontSize:"10px", fontWeight:800, textTransform:"uppercase",
                      letterSpacing:"1.5px", padding:"3px 9px", borderRadius:"999px",
                      background: isOpen ? s.bg : "rgba(0,0,0,0.04)",
                      color: isOpen ? s.color : "#94a3b8",
                      transition:"all 0.3s",
                    }}>
                      {s.tag}
                    </span>
                  </div>
                  <div style={{
                    width:"28px", height:"28px", borderRadius:"8px",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    background: isHov || isOpen ? s.bg : "transparent",
                    transition:"all 0.2s",
                  }}>
                    <ArrowUpRight size={14}
                      style={{
                        color: isOpen ? s.color : "#cbd5e1",
                        transform: isOpen ? "rotate(0deg)" : "rotate(0deg)",
                        transition:"all 0.2s",
                      }}
                    />
                  </div>
                </div>

                {/* Titre */}
                <h3 className="text-lg font-black tracking-tight mb-2"
                  style={{ color: isOpen ? s.color : "#0f172a", transition:"color 0.3s" }}>
                  {s.title}
                </h3>

                {/* Description courte */}
                <p className="text-sm leading-relaxed font-medium"
                  style={{ color: isOpen ? "#64748b" : "#94a3b8", transition:"color 0.3s" }}>
                  {s.desc}
                </p>

                {/* Zone étendue */}
                <div style={{
                  overflow:"hidden",
                  maxHeight: isOpen ? "200px" : "0px",
                  opacity:   isOpen ? 1 : 0,
                  transition:"max-height 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.3s",
                }}>
                  <div style={{
                    marginTop:"16px",
                    paddingTop:"16px",
                    borderTop:`1px solid ${s.color}22`,
                  }}>
                    <p className="text-sm leading-relaxed" style={{ color:"#64748b" }}>
                      {s.more}
                    </p>

                  </div>
                </div>

                {/* Barre de progression décorative */}
                <div style={{
                  marginTop:"20px",
                  height:"2px",
                  borderRadius:"99px",
                  background:`linear-gradient(90deg, ${s.color}, ${s.color}33)`,
                  width: isOpen ? "100%" : isHov ? "40%" : "20%",
                  transition:"width 0.4s cubic-bezier(0.4,0,0.2,1)",
                  opacity: isOpen ? 1 : 0.4,
                }}/>
              </div>
            );
          })}
        </div>

        {/* ── Bouton Voir plus / Réduire ── */}
        <div className="flex justify-center mt-10">
          <button
            onClick={() => { setShowAll(v => !v); setActive(null); }}
            style={{ display:"flex", alignItems:"center", gap:"10px", padding:"13px 30px", background:"rgba(255,255,255,0.9)", backdropFilter:"blur(20px)", border:"1.5px solid rgba(99,102,241,0.25)", borderRadius:"999px", cursor:"pointer", fontSize:"13px", fontWeight:800, color:"#6366f1", boxShadow:"0 4px 20px rgba(99,102,241,0.12)", transition:"all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow="0 8px 30px rgba(99,102,241,0.2)"; e.currentTarget.style.transform="translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow="0 4px 20px rgba(99,102,241,0.12)"; e.currentTarget.style.transform="translateY(0)"; }}
          >
            <ChevronDown size={16} style={{ transform: showAll ? "rotate(180deg)" : "rotate(0deg)", transition:"transform 0.3s" }}/>
            {showAll ? "Réduire" : "Voir toutes les spécialités"}
            {!showAll && (
              <span style={{ background:"rgba(99,102,241,0.1)", color:"#6366f1", padding:"2px 8px", borderRadius:"999px", fontSize:"11px", fontWeight:900 }}>
                +{ALL_SERVICES.length - INITIAL_COUNT}
              </span>
            )}
          </button>
        </div>

        {/* ── Stats bas ── */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value:"6+",   label:"Spécialités",    color:"#6366f1" },
            { value:"24/7", label:"Disponibilité",  color:"#ef4444" },
            { value:"100%", label:"En ligne",       color:"#10b981" },
            { value:"MRU",  label:"Paiement local", color:"#f97316" },
          ].map((stat, i) => (
            <div key={i} style={{
              background:"rgba(255,255,255,0.8)",
              backdropFilter:"blur(16px)",
              border:"1px solid rgba(0,0,0,0.06)",
              borderRadius:"16px",
              padding:"18px 20px",
              textAlign:"center",
              boxShadow:"0 2px 10px rgba(0,0,0,0.04)",
            }}>
              <p className="text-2xl font-black tracking-tight" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-xs text-slate-400 font-bold mt-0.5 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}