import React from 'react';
import { Facebook, Instagram, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Brand */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold font-serif">Safaty<span className="text-brand-500">Undangan</span></h2>
            <p className="text-slate-400 text-sm max-w-xs">
              Partner terbaik untuk kebutuhan cetak undangan dan digital printing Anda. Kualitas premium, harga bersahabat.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 tracking-wider uppercase mb-4">Layanan</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-slate-400 hover:text-white text-sm">Undangan Pernikahan</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white text-sm">Undangan Digital</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white text-sm">Cetak Banner</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white text-sm">Souvenir Custom</a></li>
            </ul>
          </div>

          {/* Legal / Contact */}
          <div>
             <h3 className="text-sm font-semibold text-slate-200 tracking-wider uppercase mb-4">Informasi</h3>
             <ul className="space-y-3">
              <li><a href="#" className="text-slate-400 hover:text-white text-sm">Tentang Kami</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white text-sm">Cara Pemesanan</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white text-sm">FAQ</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white text-sm">Syarat & Ketentuan</a></li>
             </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-slate-800 pt-8 text-center">
          <p className="text-base text-slate-500">
            &copy; {new Date().getFullYear()} SafatyUndangan. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;