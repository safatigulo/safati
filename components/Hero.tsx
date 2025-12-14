import React from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { ViewState } from '../types';

interface HeroProps {
  onCtaClick: () => void;
  onSecondaryCtaClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onCtaClick, onSecondaryCtaClick }) => {
  return (
    <div className="relative overflow-hidden bg-slate-50 lg:pt-20 pt-10 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
          
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-sm font-semibold mb-6">
              <span className="flex h-2 w-2 rounded-full bg-brand-600 mr-2"></span>
              Solusi Percetakan Terpercaya
            </div>
            <h1 className="text-4xl tracking-tight font-extrabold text-slate-900 sm:text-5xl md:text-6xl font-serif">
              Cetak Momen <br />
              <span className="text-brand-600">Bahagiamu</span> Disini
            </h1>
            <p className="mt-3 text-base text-slate-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
              SafatyUndangan menyediakan layanan cetak undangan pernikahan eksklusif, banner, kartu nama, dan kebutuhan percetakan lainnya dengan kualitas premium dan harga bersahabat.
            </p>
            <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onCtaClick}
                  className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-brand-600 hover:bg-brand-700 md:py-4 md:text-lg shadow-lg shadow-brand-200 transition-all hover:-translate-y-1"
                >
                  Lihat Katalog
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
                <button
                  onClick={onSecondaryCtaClick}
                  className="inline-flex items-center justify-center px-8 py-3 border border-slate-300 text-base font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 md:py-4 md:text-lg shadow-sm transition-all"
                >
                  Coba AI Generator
                </button>
              </div>
            </div>
            
            <div className="mt-8 border-t border-slate-200 pt-6">
              <div className="flex flex-wrap gap-4 sm:justify-center lg:justify-start text-sm text-slate-500">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-brand-500 mr-2" />
                  Kualitas Premium
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-brand-500 mr-2" />
                  Pengerjaan Cepat
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-brand-500 mr-2" />
                  Desain Custom
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
            <div className="relative mx-auto w-full rounded-lg shadow-xl lg:max-w-md overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <img
                className="w-full h-full object-cover"
                src="https://picsum.photos/600/800?random=10"
                alt="Contoh Undangan Pernikahan Mewah"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                <div className="text-white">
                  <p className="font-serif text-2xl font-bold">Elegant Series</p>
                  <p className="text-sm opacity-90">Koleksi Terbaru 2024</p>
                </div>
              </div>
            </div>
             {/* Floating Elements */}
             <div className="hidden lg:block absolute -top-4 -right-4 w-24 h-24 bg-brand-100 rounded-full blur-2xl opacity-60"></div>
             <div className="hidden lg:block absolute -bottom-8 -left-8 w-32 h-32 bg-indigo-100 rounded-full blur-2xl opacity-60"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;