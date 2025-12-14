import React, { useState } from 'react';
import { Product } from '../types';
import { Plus, Search, PackageX } from 'lucide-react';

interface ProductListProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onAddToCart }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter logic
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-slate-900 font-serif">Katalog Produk</h2>
          <p className="mt-4 text-lg text-slate-500">Pilih kebutuhan percetakan Anda dengan kualitas terbaik.</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-12 relative">
            <div className="relative">
                <input
                    type="text"
                    placeholder="Cari undangan, banner, atau kartu nama..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-full border border-slate-300 shadow-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-slate-700 bg-slate-50 focus:bg-white"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400" />
                </div>
            </div>
            {searchTerm && (
                <p className="text-center text-sm text-slate-400 mt-2">
                    Menampilkan hasil untuk "{searchTerm}"
                </p>
            )}
        </div>

        {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
                <div key={product.id} className="group flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="relative h-48 w-full overflow-hidden">
                    <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-brand-600 shadow-sm">
                    {product.category}
                    </div>
                    {product.stock < 20 && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold shadow-sm">
                        Sisa {product.stock}
                    </div>
                    )}
                </div>
                <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 font-serif">{product.name}</h3>
                    <p className="text-slate-500 text-sm mb-4 line-clamp-2">{product.description}</p>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                    <span className="text-lg font-bold text-brand-600">{product.displayPrice}</span>
                    <button 
                        onClick={() => onAddToCart(product)}
                        className="flex items-center space-x-1 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah</span>
                    </button>
                    </div>
                </div>
                </div>
            ))}
            </div>
        ) : (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <PackageX className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900">Produk tidak ditemukan</h3>
                <p className="text-slate-500 mt-1">Coba gunakan kata kunci lain atau lihat semua kategori.</p>
                <button 
                    onClick={() => setSearchTerm('')}
                    className="mt-6 text-brand-600 font-medium hover:underline"
                >
                    Tampilkan Semua Produk
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;