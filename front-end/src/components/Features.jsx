import React from 'react';
import { ShieldCheck, Zap, MessageCircle, Clock } from 'lucide-react';

const Features = () => (
  <section className="py-20 bg-white">
    <div className="container mx-auto px-6 text-center">
      {/* Titre informatif sur le site  */}
      <h2 className="text-3xl font-bold text-slate-900 mb-16 font-titre">
        Une prise en charge moderne
      </h2>
      
      <div className="grid md:grid-cols-4 gap-12">
        {/* Fonctionnalité : Réservation [cite: 27] */}
        <div className="space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Zap size={30} />
          </div>
          <h3 className="font-bold text-lg">Réservation Rapide</h3>
          <p className="text-slate-500 text-sm">Réservez votre place en quelques clics sans attendre.</p>
        </div>

        {/* Fonctionnalité : Notification WhatsApp [cite: 46] */}
        <div className="space-y-4">
          <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <MessageCircle size={30} />
          </div>
          <h3 className="font-bold text-lg">Confirmation WhatsApp</h3>
          <p className="text-slate-500 text-sm">Recevez instantanément vos détails de rendez-vous sur votre mobile.</p>
        </div>

        {/* Fonctionnalité : Paiement [cite: 29, 35] */}
        <div className="space-y-4">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck size={30} />
          </div>
          <h3 className="font-bold text-lg">Paiement Sécurisé</h3>
          <p className="text-slate-500 text-sm">Validation de votre consultation uniquement après paiement sécurisé.</p>
        </div>

        {/* Fonctionnalité : Disponibilité réelle [cite: 32] */}
        <div className="space-y-4">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Clock size={30} />
          </div>
          <h3 className="font-bold text-lg">Disponibilité Réelle</h3>
          <p className="text-slate-500 text-sm">Accédez uniquement aux créneaux réellement disponibles en temps réel.</p>
        </div>
      </div>
    </div>
  </section>
);

export default Features;