import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { Transaction } from '../types';

interface EditTransactionModalProps {
  transaction: Transaction;
  onClose: () => void;
  onSave: (id: string, newTotal: number, newPaid: number) => void;
}

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({ transaction, onClose, onSave }) => {
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);

  useEffect(() => {
    setTotalAmount(transaction.totalAmount);
    // Jika status Lunas dan paidAmount kosong, anggap paidAmount = totalAmount
    const currentPaid = transaction.paidAmount ?? (transaction.status === 'Lunas' ? transaction.totalAmount : 0);
    setPaidAmount(currentPaid);
  }, [transaction]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(transaction.id, totalAmount, paidAmount);
    onClose();
  };

  const remaining = totalAmount - paidAmount;
  
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="font-bold text-slate-800">Edit Transaksi {transaction.id}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Total Harga (Tagihan)</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-500 text-sm">Rp</span>
              <input
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah Terbayar (DP / Lunas)</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-500 text-sm">Rp</span>
              <input
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                min="0"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">Masukkan nominal yang sudah dibayarkan pelanggan.</p>
          </div>

          <div className={`p-4 rounded-lg border ${remaining > 0 ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
            <div className="flex justify-between items-center">
              <span className={`text-sm font-medium ${remaining > 0 ? 'text-amber-800' : 'text-green-800'}`}>
                {remaining > 0 ? 'Sisa Tagihan (Kurang)' : 'Status Pembayaran'}
              </span>
              <span className={`text-lg font-bold ${remaining > 0 ? 'text-amber-700' : 'text-green-700'}`}>
                {remaining > 0 ? formatCurrency(remaining) : 'LUNAS'}
              </span>
            </div>
            {remaining < 0 && (
              <div className="flex items-center mt-2 text-red-600 text-xs">
                <AlertCircle className="w-3 h-3 mr-1" />
                <span>Pembayaran berlebih: {formatCurrency(Math.abs(remaining))}</span>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTransactionModal;