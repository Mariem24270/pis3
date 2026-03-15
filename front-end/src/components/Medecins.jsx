import React, { useState, useEffect, useMemo } from "react";

import { Search, Calendar, Check, ArrowRight, ShieldCheck, Star, MapPin } from "lucide-react";

import { useNavigate } from "react-router-dom";


const API_BASE_URL = "http://127.0.0.1:8000/api";

const MEDIA_BASE_URL = "http://127.0.0.1:8000";


export default function DoctorsPage() {

const [consultations, setConsultations] = useState([]);

const [loading, setLoading] = useState(true);

const [searchTerm, setSearchTerm] = useState("");

const navigate = useNavigate();


useEffect(() => {

fetch(`${API_BASE_URL}/consultations/`)

.then(res => res.json())

.then(result => {

const data = result.data || result;

if (Array.isArray(data)) setConsultations(data);

})

.finally(() => setLoading(false));

}, []);


const doctorsList = useMemo(() => {

const doctorsMap = new Map();

consultations.forEach(c => {

const matchSearch = c.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||

c.doctor_specialite.toLowerCase().includes(searchTerm.toLowerCase());

if (matchSearch && !doctorsMap.has(c.doctor_name)) {

doctorsMap.set(c.doctor_name, {

id: c.id, // L'ID pour la consultation

name: c.doctor_name,

specialite: c.doctor_specialite,

photo: c.doctor_photo || c.photo,

firstAvailable: new Date(c.date_fin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })

});

}

});

return Array.from(doctorsMap.values());

}, [consultations, searchTerm]);


return (

<div className="min-h-screen bg-[#F8F9FF] py-16 px-6">

<div className="max-w-5xl mx-auto">

{/* EN-TÊTE AVEC DESCRIPTION ÉLÉGANTE */}

<header className="mb-16 text-center md:text-left">

<div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm mb-6">

<span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>

<span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Service Premium</span>

</div>

<h1 className="text-4xl font-black text-slate-900 mb-6 tracking-tight leading-[1.1]">

Trouvez l'expert qui <br/>

<span className="text-indigo-600">comprend vos besoins.</span>

</h1>

<p className="text-slate-400 text-sm max-w-lg leading-relaxed font-medium">

Parcourez notre réseau de santé d'élite. Une interface pensée pour votre confort : visualisez les profils et réservez votre créneau en un instant.

</p>

</header>


{/* BARRE DE RECHERCHE "TENDANCE" */}

<div className="relative mb-20 max-w-2xl">

<div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">

<Search className="text-indigo-600" size={24} />

</div>

<input

type="text"

placeholder="Rechercher un médecin, une spécialité..."

className="w-full pl-16 pr-8 py-6 bg-white border-none rounded-[2rem] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)] outline-none focus:ring-4 focus:ring-indigo-500/10 text-slate-600 font-bold placeholder:text-slate-300 transition-all text-lg"

onChange={(e) => setSearchTerm(e.target.value)}

/>

</div>


{/* GRILLE DES CARTES INTELLIGENTES */}

{loading ? (

<div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-pulse">

{[1,2,3,4].map(i => <div key={i} className="h-44 bg-slate-100 rounded-[2.5rem]"></div>)}

</div>

) : (

<div className="grid grid-cols-1 md:grid-cols-2 gap-10">

{doctorsList.map((doc) => (

<div

key={doc.name}

className="group relative bg-white p-7 rounded-[2.5rem] shadow-[0_10px_30px_-5px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_60px_-15px_rgba(79,70,229,0.15)] transition-all duration-500 flex items-center"

>

{/* Infos à gauche */}

<div className="flex-1 pr-4">

<div className="flex items-center gap-2 mb-2">

<ActivityIcon />

<span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{doc.specialite}</span>

</div>

<h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight group-hover:text-indigo-600 transition-colors">{doc.name}</h3>

<div className="flex items-center gap-4 mb-6">

<div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full">

<Calendar size={12}/> {doc.firstAvailable}

</div>

</div>


{/* Bouton Flèche - REDIRECTION VERS CONSULTATION */}

<button

  onClick={() => navigate("/consultation", { state: { doctorName: doc.name } })}

className="flex items-center gap-2 text-[11px] font-black text-slate-900 uppercase tracking-tighter group-hover:text-indigo-600 transition-all"

>

Réserver maintenant <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />

</button>

</div>


{/* Photo à droite - Design Intelligent */}

<div className="relative">

<div className="absolute inset-0 bg-indigo-100 rounded-[2rem] -rotate-6 group-hover:rotate-0 transition-transform duration-500"></div>

<img

src={doc.photo ? (doc.photo.startsWith('http') ? doc.photo : `${MEDIA_BASE_URL}${doc.photo}`) : "https://via.placeholder.com/150"}

className="relative w-28 h-28 rounded-[2rem] object-cover shadow-xl border-4 border-white transform group-hover:scale-105 transition-all duration-500"

alt={doc.name}

/>

<div className="absolute -bottom-2 -left-2 bg-emerald-500 p-1.5 rounded-xl border-2 border-white shadow-lg">

<Check size={12} className="text-white" />

</div>

</div>

</div>

))}

</div>

)}

</div>


<style dangerouslySetInnerHTML={{ __html: `

@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

body { font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: -0.02em; }

`}} />

</div>

);

}


// Petite icône personnalisée

function ActivityIcon() {

return (

<svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-indigo-500" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">

<path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>

</svg>

);

}