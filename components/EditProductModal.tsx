import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Package, Image as ImageIcon, Upload, Link } from 'lucide-react';
import { Product } from '../types';

interface EditProductModalProps {
  product?: Product | null; // If null, we are adding a new product
  onClose: () => void;
  onSave: (product: Product) => void;
  categories: string[];
}

const EditProductModal: React.FC<EditProductModalProps> = ({ product, onClose, onSave, categories }) => {
  const [formData, setFormData] = useState<Product>({
    id: '',
    name: '',
    category: categories[0] || 'Undangan Pernikahan',
    price: 0,
    displayPrice: '',
    image: '',
    description: '',
    stock: 0
  });

  const [inputType, setInputType] = useState<'url' | 'file'>('file');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!product;

  useEffect(() => {
    if (product) {
      setFormData(product);
      // Determine input type guess
      if (product.image.startsWith('data:')) {
          setInputType('file');
      } else {
          setInputType('url');
      }
    } else {
      // Initialize for new product
      setFormData({
        id: `PROD-${Date.now()}`,
        name: '',
        category: categories[0] || 'Undangan Pernikahan',
        price: 0,
        displayPrice: '',
        image: 'https://picsum.photos/400/300?random=' + Math.floor(Math.random() * 100),
        description: '',
        stock: 0
      });
    }
  }, [product, categories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? Number(value) : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Auto-format display price based on numeric price
    const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(formData.price);
    
    // Determine unit suffix based on category (simple logic)
    const suffix = formData.category.includes('Undangan') || formData.category.includes('Buku') ? '/ pcs' : 
                   formData.category.includes('Kartu') ? '/ Box' : '';

    const finalData = {
        ...formData,
        displayPrice: `${formattedPrice} ${suffix}`
    };

    onSave(finalData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="font-bold text-slate-800 flex items-center">
            <Package className="w-5 h-5 mr-2 text-brand-600" />
            {isEditing ? 'Edit Produk' : 'Tambah Produk Baru'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Produk</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                placeholder="Contoh: Undangan Hardcover Gold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    >
                        {categories.map((cat, idx) => (
                          <option key={idx} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Stok</label>
                    <input
                        type="number"
                        name="stock"
                        required
                        min="0"
                        value={formData.stock}
                        onChange={handleChange}
                        className="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    />
                </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Harga (Rp)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-500 text-sm">Rp</span>
                <input
                    type="number"
                    name="price"
                    required
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
            </div>

            {/* Image Input Section */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Gambar Produk</label>
              
              {/* Toggle Input Type */}
              <div className="flex space-x-4 mb-3">
                <button
                  type="button"
                  onClick={() => setInputType('file')}
                  className={`text-xs flex items-center px-3 py-1.5 rounded-full border transition-colors ${inputType === 'file' ? 'bg-brand-50 border-brand-200 text-brand-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                >
                  <Upload className="w-3 h-3 mr-1.5" />
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setInputType('url')}
                  className={`text-xs flex items-center px-3 py-1.5 rounded-full border transition-colors ${inputType === 'url' ? 'bg-brand-50 border-brand-200 text-brand-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                >
                  <Link className="w-3 h-3 mr-1.5" />
                  URL Gambar
                </button>
              </div>

              {inputType === 'file' ? (
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <Upload className="w-8 h-8 mb-2 text-slate-400" />
                    <span className="text-sm font-medium">Klik untuk upload gambar</span>
                    <span className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</span>
                  </div>
                </div>
              ) : (
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 text-slate-500">
                      <ImageIcon className="w-4 h-4" />
                  </span>
                  <input
                      type="text"
                      name="image"
                      value={formData.image}
                      onChange={handleChange}
                      className="flex-1 rounded-r-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                      placeholder="https://example.com/image.jpg"
                  />
                </div>
              )}

              {/* Image Preview */}
              {formData.image && (
                <div className="mt-4 relative w-full h-40 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                  <img src={formData.image} alt="Preview" className="w-full h-full object-contain" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
              <textarea
                name="description"
                rows={3}
                required
                value={formData.description}
                onChange={handleChange}
                className="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
          </form>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-white transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              form="product-form"
              className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Simpan Produk
            </button>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;