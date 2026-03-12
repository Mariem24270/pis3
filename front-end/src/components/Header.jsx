import React from 'react';
import { Link } from "react-router-dom";
import { Stethoscope, HelpCircle, CalendarCheck } from 'lucide-react';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] text-white shadow-md">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        
        <Link to="/" className="flex items-center gap-3 group">
          <div className="bg-white/15 p-2.5 rounded-xl backdrop-blur-md group-hover:bg-white/25 transition-all">
            <Stethoscope size={26} className="text-blue-200" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight leading-none">Hôpital <span className="text-blue-200">Local</span></h1>
            <span className="text-[10px] uppercase tracking-[2px] font-semibold text-blue-300 mt-1">Excellence Médicale</span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-10 text-[15px] font-medium tracking-wide">
          <Link to="/" className="text-blue-100 hover:text-white transition-all">Accueil</Link>
          {/* ANCRE VERS SERVICES */}
          <a href="#services" className="text-blue-100 hover:text-white transition-all">Nos services</a>
          <Link to="/medecins" className="text-blue-100 hover:text-white transition-all">Médecins</Link>
        </nav>

        <div className="flex items-center gap-6">
          <Link
            to="/login"
            className="hidden sm:inline-flex items-center justify-center rounded-xl bg-white/10 px-5 py-3 text-sm font-bold text-white ring-1 ring-white/20 hover:bg-white/15 transition"
          >
            Connexion
          </Link>

          <Link
            to="/consultation"
            className="inline-flex items-center gap-2 rounded-xl bg-white text-blue-900 hover:bg-blue-50 px-6 py-3 font-bold text-sm shadow-md transition-all"
          >
            <CalendarCheck size={18} />
            Prendre RDV
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;