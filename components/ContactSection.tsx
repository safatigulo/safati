import React from 'react';
import { Phone, MapPin, Mail, Clock } from 'lucide-react';

const ContactSection: React.FC = () => {
  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 font-serif">Hubungi Kami</h2>
          <p className="mt-4 text-lg text-slate-500">
            Siap mewujudkan undangan impian Anda? Konsultasikan sekarang.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-brand-100 text-brand-600">
                  <MapPin className="w-6 h-6" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-slate-900">Alamat Workshop</h3>
                <p className="mt-1 text-slate-600">
                  Jl. Percetakan Negara No. 123<br />
                  Jakarta Pusat, Indonesia 10560
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-brand-100 text-brand-600">
                  <Phone className="w-6 h-6" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-slate-900">Telepon / WhatsApp</h3>
                <p className="mt-1 text-slate-600">+62 812-3456-7890</p>
                <p className="text-sm text-slate-500 mt-1">Fast Response: 09:00 - 17:00 WIB</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-brand-100 text-brand-600">
                  <Mail className="w-6 h-6" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-slate-900">Email</h3>
                <p className="mt-1 text-slate-600">order@safatyundangan.com</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-brand-100 text-brand-600">
                  <Clock className="w-6 h-6" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-slate-900">Jam Operasional</h3>
                <p className="mt-1 text-slate-600">
                  Senin - Sabtu: 08:00 - 20:00<br />
                  Minggu: 10:00 - 16:00
                </p>
              </div>
            </div>
          </div>

          {/* Map / Image */}
          <div className="bg-slate-100 rounded-2xl overflow-hidden h-96 relative shadow-lg">
             <img 
               src="https://picsum.photos/800/600?grayscale" 
               alt="Lokasi Toko" 
               className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-500"
             />
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="bg-white/80 px-4 py-2 rounded-lg text-slate-800 font-bold backdrop-blur-sm">Peta Lokasi (Simulasi)</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;