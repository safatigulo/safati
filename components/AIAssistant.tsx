import React, { useState } from 'react';
import { generateInvitationWording } from '../services/geminiService';
import { InvitationRequest } from '../types';
import { Sparkles, Copy, RefreshCw, AlertCircle } from 'lucide-react';

const AIAssistant: React.FC = () => {
  const [formData, setFormData] = useState<InvitationRequest>({
    groomName: '',
    brideName: '',
    date: '',
    venue: '',
    tone: 'formal',
    language: 'id'
  });

  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult('');

    try {
      if (!process.env.API_KEY) {
         setError("API Key tidak ditemukan. Fitur ini memerlukan konfigurasi environment variable.");
         setLoading(false);
         return;
      }
      const text = await generateInvitationWording(formData);
      setResult(text);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat menghasilkan teks.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    alert('Teks berhasil disalin!');
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-brand-100 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-brand-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 font-serif">AI Wedding Writer</h2>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
            Bingung menyusun kata-kata untuk undangan? Biarkan Safaty AI membantu Anda membuat redaksi undangan yang indah dan menyentuh hati dalam hitungan detik.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Detail Acara</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mempelai Pria</label>
                  <input
                    type="text"
                    name="groomName"
                    required
                    value={formData.groomName}
                    onChange={handleChange}
                    className="w-full rounded-lg border-slate-300 border px-4 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                    placeholder="Contoh: Rizky"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mempelai Wanita</label>
                  <input
                    type="text"
                    name="brideName"
                    required
                    value={formData.brideName}
                    onChange={handleChange}
                    className="w-full rounded-lg border-slate-300 border px-4 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                    placeholder="Contoh: Sarah"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Acara</label>
                <input
                  type="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full rounded-lg border-slate-300 border px-4 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Lokasi / Venue</label>
                <input
                  type="text"
                  name="venue"
                  required
                  value={formData.venue}
                  onChange={handleChange}
                  className="w-full rounded-lg border-slate-300 border px-4 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  placeholder="Nama Gedung / Hotel"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Gaya Bahasa</label>
                  <select
                    name="tone"
                    value={formData.tone}
                    onChange={handleChange}
                    className="w-full rounded-lg border-slate-300 border px-4 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value="formal">Formal & Elegan</option>
                    <option value="casual">Santai & Akrab</option>
                    <option value="islami">Islami</option>
                    <option value="javanese">Adat Jawa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bahasa</label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    className="w-full rounded-lg border-slate-300 border px-4 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value="id">Indonesia</option>
                    <option value="en">Inggris</option>
                    <option value="jw">Jawa Halus</option>
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all hover:shadow-lg"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="animate-spin -ml-1 mr-3 h-5 w-5" />
                      Sedang Menulis...
                    </>
                  ) : (
                    <>
                      <Sparkles className="-ml-1 mr-2 h-5 w-5" />
                      Buat Kata-kata Undangan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Result Section */}
          <div className="flex flex-col">
            <div className={`flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 flex flex-col ${result ? 'border-brand-200 ring-4 ring-brand-50' : ''} transition-all duration-300`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Hasil AI</h3>
                {result && (
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center text-sm text-brand-600 hover:text-brand-700 font-medium"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Salin
                  </button>
                )}
              </div>
              
              <div className="flex-1 bg-slate-50 rounded-xl p-4 min-h-[300px] overflow-y-auto whitespace-pre-wrap font-serif text-slate-700 leading-relaxed border border-slate-100">
                {error && (
                  <div className="flex items-start text-red-600 bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}
                {!result && !error && !loading && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <Sparkles className="w-12 h-12 mb-3 opacity-20" />
                    <p className="text-sm text-center">Isi formulir di samping dan klik tombol untuk melihat keajaiban AI.</p>
                  </div>
                )}
                {loading && (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 rounded w-full"></div>
                    <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                    <div className="h-20 bg-slate-200 rounded w-full mt-4"></div>
                  </div>
                )}
                {result}
              </div>
            </div>
            
            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Tips:</strong> Hasil ini adalah draf awal. Anda bisa menyalinnya dan menyesuaikan sedikit agar lebih personal sebelum dicetak di SafatyUndangan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;