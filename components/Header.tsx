import React, { useState } from 'react';
import { Menu, X, Printer, Sparkles, ShoppingCart, BarChart2 } from 'lucide-react';
import { ViewState } from '../types';

interface HeaderProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  cartItemCount: number;
  onOpenCart: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView, cartItemCount, onOpenCart }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems: { id: ViewState; label: string; icon?: React.ReactNode }[] = [
    { id: 'home', label: 'Beranda' },
    { id: 'products', label: 'Katalog Produk' },
    { id: 'ai-assistant', label: 'AI Asisten', icon: <Sparkles className="w-4 h-4 mr-1" /> },
    { id: 'contact', label: 'Kontak' },
    { id: 'admin', label: 'Admin', icon: <BarChart2 className="w-4 h-4 mr-1" /> }, // Added Admin Link
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer group" 
            onClick={() => setView('home')}
          >
            <div className="bg-brand-600 p-2 rounded-lg mr-3 group-hover:bg-brand-500 transition-colors">
              <Printer className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 font-serif tracking-tight">Safaty<span className="text-brand-600">Undangan</span></h1>
              <p className="text-xs text-slate-500 font-medium tracking-wide">PERCETAKAN & DIGITAL</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 md:space-x-8">
            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`flex items-center text-sm font-medium transition-colors ${
                    currentView === item.id
                      ? 'text-brand-600'
                      : 'text-slate-600 hover:text-brand-600'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Cart Button */}
            <button 
              onClick={onOpenCart}
              className="relative p-2 text-slate-600 hover:text-brand-600 transition-colors"
              aria-label="Keranjang Belanja"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full shadow-sm">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-slate-600 hover:text-brand-600 hover:bg-slate-100 focus:outline-none"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id);
                  setIsMenuOpen(false);
                }}
                className={`flex items-center w-full px-3 py-2 rounded-md text-base font-medium ${
                  currentView === item.id
                    ? 'text-brand-600 bg-brand-50'
                    : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;