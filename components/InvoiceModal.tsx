import React from 'react';
import { X, Printer, MapPin, Phone, Scissors } from 'lucide-react';
import { Transaction } from '../types';

interface InvoiceModalProps {
  transaction: Transaction;
  onClose: () => void;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ transaction, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  // Reusable Component for the Invoice Content
  const InvoiceContent = ({ isCopy = false }: { isCopy?: boolean }) => {
    const formatCurrency = (amount: number) => 
      new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

    const subtotal = transaction.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const discount = transaction.discount || 0;
    const paidAmount = transaction.paidAmount ?? (transaction.status === 'Lunas' ? transaction.totalAmount : 0);
    const remainingAmount = transaction.totalAmount - paidAmount;

    return (
      <div className={`bg-white text-slate-900 h-full flex flex-col justify-between ${isCopy ? 'pt-8' : ''}`}>
        <div>
          {/* Header Nota */}
          <div className="flex justify-between items-start mb-4 pb-4 border-b-2 border-slate-100">
            <div>
              <h1 className="text-2xl font-bold font-serif text-brand-600 tracking-tight mb-1">Safaty<span className="text-slate-800">Undangan</span></h1>
              <div className="text-xs text-slate-500 space-y-0.5">
                <p className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> Jl. Percetakan Negara No. 123, Jakarta</p>
                <p className="flex items-center"><Phone className="w-3 h-3 mr-1" /> +62 812-3456-7890</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-slate-200 uppercase tracking-widest">INVOICE {isCopy && '(COPY)'}</h2>
              <p className="font-mono text-slate-600 mt-1 text-sm">#{transaction.id}</p>
              <p className="text-xs text-slate-500">{transaction.date}</p>
              <div className={`mt-1 inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                transaction.status === 'Lunas' 
                  ? 'bg-green-50 text-green-700 border-green-200' 
                  : transaction.status === 'DP'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-yellow-50 text-yellow-700 border-yellow-200'
              }`}>
                {transaction.status.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="mb-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ditagihkan Kepada:</h3>
            <p className="text-base font-bold text-slate-900">{transaction.customerName}</p>
            <p className="text-slate-500 text-xs max-w-xs">{transaction.customerAddress || '-'}</p>
          </div>

          {/* Table */}
          <table className="w-full mb-4">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 text-xs font-semibold text-slate-600">Item</th>
                <th className="text-center py-2 text-xs font-semibold text-slate-600">Qty</th>
                <th className="text-right py-2 text-xs font-semibold text-slate-600">Harga</th>
                <th className="text-right py-2 text-xs font-semibold text-slate-600">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transaction.items.map((item, index) => (
                <tr key={index}>
                  <td className="py-2 text-xs text-slate-800">{item.name}</td>
                  <td className="py-2 text-center text-xs text-slate-600">{item.quantity}</td>
                  <td className="py-2 text-right text-xs text-slate-600">{formatCurrency(item.price)}</td>
                  <td className="py-2 text-right text-xs font-medium text-slate-900">
                    {formatCurrency(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          {/* Total & Payment Details */}
          <div className="flex justify-end border-t border-slate-200 pt-2">
            <div className="w-64 space-y-1">
              {discount > 0 && (
                <>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-red-600">
                    <span>Diskon</span>
                    <span className="font-medium">- {formatCurrency(discount)}</span>
                  </div>
                  <div className="border-b border-slate-100 my-1"></div>
                </>
              )}

              <div className="flex justify-between items-center text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                <span>Total</span>
                <span className="text-brand-600">{formatCurrency(transaction.totalAmount)}</span>
              </div>
              
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Bayar / DP</span>
                  <span className="font-medium">{formatCurrency(paidAmount)}</span>
                </div>
                
                <div className={`flex justify-between items-center ${remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  <span className="font-bold text-xs">{remainingAmount > 0 ? 'Sisa' : 'Status'}</span>
                  <span className="text-sm font-bold border border-current px-1 rounded inline-block">
                    {remainingAmount > 0 ? formatCurrency(remainingAmount) : 'LUNAS'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 text-center pt-2 border-t border-dashed border-slate-200">
            <p className="font-serif italic text-slate-600 text-[10px] mb-1">Terima kasih telah mempercayakan momen bahagia Anda kepada kami.</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center print:p-0 print:block">
        
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity print:hidden" 
          onClick={onClose} 
          aria-hidden="true" 
        />
        
        {/* Modal Panel */}
        <div className="relative transform bg-white text-left shadow-2xl transition-all w-full max-w-2xl rounded-xl print:shadow-none print:w-full print:max-w-none print:rounded-none">
          
          {/* Header Actions (Hidden when printing) */}
          <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50 print:hidden rounded-t-xl">
            <h2 className="font-bold text-slate-700">Preview Nota</h2>
            <div className="flex space-x-2">
              <button 
                onClick={handlePrint}
                className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-brand-600 transition-colors"
              >
                <Printer className="w-4 h-4 mr-2" />
                Cetak (2 Rangkap)
              </button>
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* DISPLAY VIEW (Screen Only) */}
          <div className="p-8 print:hidden">
             <InvoiceContent />
          </div>

          {/* PRINT VIEW (2 Copies on A4) */}
          <div className="hidden print:flex flex-col h-[297mm] w-full bg-white">
              {/* Copy 1 (Top) */}
              <div className="h-[138mm] p-8 border-b-2 border-slate-300 border-dashed relative">
                 <InvoiceContent />
                 <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white px-2 text-slate-400 flex items-center text-xs">
                    <Scissors className="w-4 h-4 mr-1" /> Potong Disini
                 </div>
              </div>

              {/* Copy 2 (Bottom) */}
              <div className="h-[138mm] p-8">
                 <InvoiceContent isCopy={true} />
              </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;