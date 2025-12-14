import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, CheckCircle, Loader2, Printer, Wallet, CreditCard, Tag, Phone } from 'lucide-react';
import { CartItem, Transaction } from '../types';
import InvoiceModal from './InvoiceModal';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckoutSuccess: () => void;
  onAddTransaction: (transaction: Transaction) => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ 
  isOpen, 
  onClose, 
  items, 
  onUpdateQuantity, 
  onRemoveItem, 
  onCheckoutSuccess,
  onAddTransaction
}) => {
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  // State Input
  const [dpInput, setDpInput] = useState<string>(''); 
  const [discountInput, setDiscountInput] = useState<string>('');
  
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [orderId, setOrderId] = useState('');
  
  // State untuk menyimpan data transaksi yang baru saja dibuat agar bisa dicetak
  const [completedOrder, setCompletedOrder] = useState<Transaction | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);

  // Perhitungan
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = parseInt(discountInput || '0', 10);
  const finalTotal = Math.max(0, subtotal - discount);
  
  const paidAmount = parseInt(dpInput || '0', 10);
  const remainingAmount = Math.max(0, finalTotal - paidAmount);

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  const handleCheckout = () => {
    if (!customerPhone || !customerAddress) {
      alert('Mohon lengkapi No. WhatsApp dan alamat pengiriman.');
      return;
    }

    setCheckoutStatus('processing');

    // Simulate API Call
    setTimeout(() => {
      const newOrderId = `TRX-${Math.floor(1000 + Math.random() * 9000)}-${new Date().getFullYear()}`;
      
      // Tentukan status berdasarkan pembayaran terhadap TOTAL AKHIR (setelah diskon)
      let status: 'Lunas' | 'DP' | 'Pending' = 'Pending';
      if (paidAmount >= finalTotal) {
        status = 'Lunas';
      } else if (paidAmount > 0) {
        status = 'DP';
      }

      // Buat objek transaksi lengkap
      const newTransaction: Transaction = {
        id: newOrderId,
        date: new Date().toISOString().split('T')[0], // Use ISO format for consistent filtering in admin
        customerName: customerPhone, // Map phone to customerName field for compatibility
        customerAddress: customerAddress,
        totalAmount: finalTotal, // Total yang disimpan adalah yang sudah didiskon
        discount: discount > 0 ? discount : undefined,
        paidAmount: paidAmount,
        status: status,
        items: items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      };

      setCompletedOrder(newTransaction);
      setOrderId(newOrderId);
      onAddTransaction(newTransaction); // Save to App state for Admin Dashboard
      setCheckoutStatus('success');
      onCheckoutSuccess(); // Clear cart in parent
    }, 2000);
  };

  const resetForm = () => {
    setCustomerPhone('');
    setCustomerAddress('');
    setDpInput('');
    setDiscountInput('');
    setCheckoutStatus('idle');
    setCompletedOrder(null);
    setShowInvoice(false);
    onClose();
  };

  const handleSetFullPayment = () => {
    setDpInput(finalTotal.toString());
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] overflow-hidden">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
        
        <div className="absolute inset-y-0 right-0 max-w-md w-full flex">
          <div className="flex-1 flex flex-col bg-white shadow-xl animate-in slide-in-from-right duration-300">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center">
                <ShoppingBag className="w-5 h-5 mr-2 text-brand-600" />
                Keranjang Belanja
              </h2>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Body Content */}
            <div className="flex-1 overflow-y-auto p-6 relative">
              
              {/* Success State - Scrollable with justify-start */}
              {checkoutStatus === 'success' ? (
                <div className="flex flex-col items-center justify-start min-h-full pt-10 pb-8 text-center space-y-4 animate-in fade-in zoom-in duration-300">
                  <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-1 flex-shrink-0">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Pesanan Berhasil!</h3>
                  <p className="text-sm text-slate-500">Terima kasih telah berbelanja di SafatyUndangan.</p>
                  
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 w-full mt-4">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">ID Pesanan Anda</p>
                    <p className="text-lg font-mono font-bold text-slate-900">{orderId}</p>
                    <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between text-xs">
                      <span className="text-slate-500">Status Pembayaran:</span>
                      <span className={`font-bold ${
                        completedOrder?.status === 'Lunas' ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {completedOrder?.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="w-full space-y-3 mt-4">
                    <button 
                      onClick={() => setShowInvoice(true)}
                      className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Cetak Nota Sekarang
                    </button>

                    <button 
                      onClick={resetForm}
                      className="w-full flex items-center justify-center px-4 py-3 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
                    >
                      Tutup & Lanjut Belanja
                    </button>
                  </div>

                  <div className="text-[10px] text-slate-400 mt-2">
                    Silakan simpan ID Pesanan atau cetak nota sebagai bukti pemesanan yang sah.
                  </div>
                </div>
              ) : (
                /* Normal Cart View */
                <>
                  {items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500">
                      <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
                      <p>Keranjang Anda masih kosong.</p>
                      <button onClick={onClose} className="mt-4 text-brand-600 font-medium hover:underline">
                        Mulai Belanja
                      </button>
                    </div>
                  ) : (
                    <>
                      <ul className="space-y-6">
                        {items.map((item) => (
                          <li key={item.id} className="flex py-2">
                            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-slate-200">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover object-center"
                              />
                            </div>

                            <div className="ml-4 flex flex-1 flex-col">
                              <div>
                                <div className="flex justify-between text-base font-medium text-slate-900">
                                  <h3 className="line-clamp-2 text-sm">{item.name}</h3>
                                  <p className="ml-4 text-sm font-bold whitespace-nowrap">{item.displayPrice}</p>
                                </div>
                                <p className="mt-1 text-xs text-slate-500">{item.category}</p>
                              </div>
                              <div className="flex flex-1 items-end justify-between text-sm">
                                <div className="flex items-center border border-slate-300 rounded-md overflow-hidden">
                                  <button 
                                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                    className="p-1 px-2 hover:bg-slate-100 text-slate-600 disabled:opacity-50 border-r border-slate-300"
                                    disabled={item.quantity <= 1}
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value);
                                      if (!isNaN(val) && val >= 1) {
                                        onUpdateQuantity(item.id, val);
                                      } else if (e.target.value === '') {
                                        // Optional: Handle empty input
                                      }
                                    }}
                                    className="w-14 text-center text-slate-900 font-medium focus:outline-none focus:bg-slate-50 py-1"
                                  />
                                  <button 
                                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                    className="p-1 px-2 hover:bg-slate-100 text-slate-600 border-l border-slate-300"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => onRemoveItem(item.id)}
                                  className="font-medium text-red-500 hover:text-red-600 flex items-center text-xs"
                                >
                                  <Trash2 className="w-3 h-3 mr-1" /> Hapus
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>

                      {/* MOVED INPUTS AND TOTALS HERE TO BE SCROLLABLE */}
                      <div className="mt-8 pt-6 border-t border-slate-100">
                        <div className="space-y-4 mb-6">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">No. WhatsApp</label>
                            <input 
                                type="tel" 
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                disabled={checkoutStatus === 'processing'}
                                className="w-full rounded-md border-slate-300 border px-3 py-2 text-sm focus:ring-brand-500 focus:border-brand-500 disabled:bg-slate-100"
                                placeholder="Contoh: 081234567890"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Alamat Pengiriman</label>
                            <textarea 
                                value={customerAddress}
                                onChange={(e) => setCustomerAddress(e.target.value)}
                                disabled={checkoutStatus === 'processing'}
                                className="w-full rounded-md border-slate-300 border px-3 py-2 text-sm focus:ring-brand-500 focus:border-brand-500 disabled:bg-slate-100"
                                placeholder="Alamat Lengkap (Kecamatan, Kota)"
                                rows={2}
                            />
                          </div>

                          {/* Discount Input */}
                          <div>
                            <label className="text-sm font-bold text-slate-700 mb-1 flex items-center">
                              <Tag className="w-3 h-3 mr-1" />
                              Diskon (Potongan Harga)
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-2.5 text-slate-500 text-sm font-medium">Rp</span>
                              <input 
                                  type="number"
                                  value={discountInput}
                                  onChange={(e) => setDiscountInput(e.target.value)}
                                  disabled={checkoutStatus === 'processing'}
                                  className="w-full rounded-md border-slate-300 border pl-10 pr-4 py-2 text-sm font-medium focus:ring-brand-500 focus:border-brand-500 disabled:bg-slate-100 text-red-600"
                                  placeholder="0"
                                  min="0"
                              />
                            </div>
                          </div>

                          {/* Payment Input Section */}
                          <div className="bg-slate-100 p-4 rounded-lg border border-slate-200">
                            <div className="flex justify-between items-center mb-3">
                              <label className="text-sm font-bold text-slate-800 flex items-center">
                                  <Wallet className="w-4 h-4 mr-1 text-slate-600" />
                                  Pembayaran / DP
                              </label>
                              <button 
                                onClick={handleSetFullPayment}
                                className="text-xs text-brand-600 font-semibold hover:underline flex items-center"
                              >
                                <CreditCard className="w-3 h-3 mr-1" />
                                Bayar Lunas
                              </button>
                            </div>
                            
                            <div className="relative mb-2">
                              <span className="absolute left-3 top-2.5 text-slate-500 text-sm font-medium">Rp</span>
                              <input 
                                  type="number"
                                  value={dpInput}
                                  onChange={(e) => setDpInput(e.target.value)}
                                  disabled={checkoutStatus === 'processing'}
                                  className="w-full rounded-md border-slate-300 border pl-10 pr-4 py-2 text-sm font-medium focus:ring-brand-500 focus:border-brand-500 disabled:bg-slate-100"
                                  placeholder="0 (Bayar Nanti)"
                                  min="0"
                              />
                            </div>

                            <div className="flex justify-between items-center text-xs mt-2 pt-2 border-t border-slate-200">
                              <span className={remainingAmount > 0 ? "text-slate-600" : "text-green-600 font-bold"}>
                                  {remainingAmount > 0 ? 'Sisa Kekurangan:' : 'Status:'}
                              </span>
                              <span className={`font-bold ${remainingAmount > 0 ? "text-red-600" : "text-green-600"}`}>
                                  {remainingAmount > 0 ? formatCurrency(remainingAmount) : "LUNAS"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Summary Totals */}
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-2 mb-4 text-slate-600 text-sm">
                          {discount > 0 && (
                            <div className="flex justify-between">
                              <p>Subtotal</p>
                              <p>{formatCurrency(subtotal)}</p>
                            </div>
                          )}
                          {discount > 0 && (
                            <div className="flex justify-between text-red-600">
                              <p>Diskon</p>
                              <p>- {formatCurrency(discount)}</p>
                            </div>
                          )}
                          <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-200 pt-2 mt-2">
                            <p>Total Akhir</p>
                            <p>{formatCurrency(finalTotal)}</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Footer & Checkout Form - Button Only */}
            {items.length > 0 && checkoutStatus !== 'success' && (
              <div className="border-t border-slate-100 px-6 py-6 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                <button
                  onClick={handleCheckout}
                  disabled={checkoutStatus === 'processing'}
                  className="flex items-center justify-center w-full rounded-md border border-transparent bg-brand-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-brand-700 transition-all hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {checkoutStatus === 'processing' ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      {paidAmount > 0 ? `Bayar ${formatCurrency(paidAmount)} & Pesan` : 'Buat Pesanan'}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Modal for Immediate Printing */}
      {showInvoice && completedOrder && (
        <InvoiceModal 
          transaction={completedOrder} 
          onClose={() => setShowInvoice(false)} 
        />
      )}
    </>
  );
};

export default CartDrawer;