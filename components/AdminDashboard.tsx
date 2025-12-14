import React, { useState, useMemo } from 'react';
import { Product, Transaction, UserRole } from '../types';
import { BarChart3, Package, TrendingUp, DollarSign, Calendar, FileText, CreditCard, AlertCircle, Pencil, LogOut, Shield, List, Plus, Trash2, Search, Printer, MapPin, Phone, ChevronDown, ArrowRight, ArrowUpCircle, Download } from 'lucide-react';
import InvoiceModal from './InvoiceModal';
import EditTransactionModal from './EditTransactionModal';
import EditProductModal from './EditProductModal';
// @ts-ignore
import { jsPDF } from "jspdf";
// @ts-ignore
import autoTable from "jspdf-autotable";

interface AdminDashboardProps {
  products: Product[];
  categories: string[];
  userRole: UserRole;
  transactions: Transaction[]; // Received as prop
  onLogout: () => void;
  onAddProduct: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onAddCategory: (category: string) => void;
  onDeleteCategory: (category: string) => void;
  onUpdateTransaction: (id: string, newTotal: number, newPaid: number) => void; // Handler for updates
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
    products, 
    categories,
    userRole, 
    transactions, // Use prop
    onLogout, 
    onAddProduct, 
    onEditProduct,
    onAddCategory,
    onDeleteCategory,
    onUpdateTransaction
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'categories' | 'income' | 'dp'>('inventory');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  // Category Local State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categorySearchTerm, setCategorySearchTerm] = useState('');

  // Product Management State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Report Filter State
  const [reportType, setReportType] = useState<'daily' | 'range' | 'monthly' | 'annual'>('daily');
  
  // Filter Values
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]); // For Daily
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);   // For Range
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);     // For Range
  const [filterMonth, setFilterMonth] = useState((new Date().getMonth() + 1).toString()); // For Monthly
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());    // For Monthly & Annual

  // Helper to determine if user can manage inventory
  const canManageInventory = userRole === 'admin' || userRole === 'manager';

  const handleSaveProduct = (product: Product) => {
    if (editingProduct) {
        onEditProduct(product);
    } else {
        onAddProduct(product);
    }
  };

  const openAddProductModal = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
        onAddCategory(newCategoryName.trim());
        setNewCategoryName('');
    }
  };

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  // Filter products based on search term
  const filteredProducts = products.filter(product => {
    const term = searchTerm.toLowerCase();
    return (
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term)
    );
  });

  // Filter Categories based on category search term
  const filteredCategories = categories.filter(category => 
    category.toLowerCase().includes(categorySearchTerm.toLowerCase())
  );

  // --- REPORT LOGIC ---

  // 1. Transaction Filtering Logic (Daily, Range, Monthly)
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
        const tDate = t.date; // YYYY-MM-DD string
        
        if (reportType === 'daily') {
            return tDate === filterDate;
        } 
        else if (reportType === 'range') {
            return tDate >= startDate && tDate <= endDate;
        } 
        else if (reportType === 'monthly') {
            const tYear = tDate.substring(0, 4);
            const tMonth = parseInt(tDate.substring(5, 7)).toString(); // Remove leading zero
            return tYear === filterYear && tMonth === filterMonth;
        }
        return false; // Annual is handled separately
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort newest first
  }, [transactions, reportType, filterDate, startDate, endDate, filterMonth, filterYear]);

  // Calculate Revenue for the filtered transactions
  const filteredRevenue = useMemo(() => {
     return filteredTransactions
        .filter(t => t.status === 'Lunas' || t.status === 'DP')
        .reduce((sum, t) => sum + (t.paidAmount || (t.status === 'Lunas' ? t.totalAmount : 0)), 0);
  }, [filteredTransactions]);


  // 2. Annual Report Logic (Aggregated by Month)
  const annualRecap = useMemo(() => {
    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ].map((name, index) => ({
        id: index + 1,
        name,
        transactionCount: 0,
        revenue: 0
    }));

    transactions.forEach(t => {
        const tYear = t.date.substring(0, 4);
        const tMonth = parseInt(t.date.substring(5, 7));

        if (tYear === filterYear && (t.status === 'Lunas' || t.status === 'DP')) {
            const monthIndex = tMonth - 1;
            if (months[monthIndex]) {
                months[monthIndex].transactionCount += 1;
                const moneyIn = t.paidAmount || (t.status === 'Lunas' ? t.totalAmount : 0);
                months[monthIndex].revenue += moneyIn;
            }
        }
    });

    return months;
  }, [transactions, filterYear]);

  const annualTotalRevenue = annualRecap.reduce((sum, m) => sum + m.revenue, 0);
  const annualTotalTransactions = annualRecap.reduce((sum, m) => sum + m.transactionCount, 0);

  // DP Logic
  const dpTransactions = transactions.filter(t => t.status === 'DP');
  const totalReceivable = dpTransactions.reduce((sum, t) => sum + (t.totalAmount - (t.paidAmount || 0)), 0);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadStockPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.text("Laporan Stok Barang - SafatyUndangan", 14, 22);
    doc.setFontSize(11);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 30);
    
    // Data Table Preparation
    const tableData = filteredProducts.map(product => {
        const soldCount = transactions.reduce((acc, t) => {
            const item = t.items.find(i => i.name === product.name);
            return acc + (item ? item.quantity : 0);
        }, 0);
        const totalStock = product.stock + soldCount;
        
        return [
            product.name,
            product.category,
            totalStock,
            soldCount,
            product.stock,
            product.stock > 50 ? 'Aman' : product.stock > 10 ? 'Menipis' : 'Kritis'
        ];
    });

    // Generate Table
    autoTable(doc, {
        head: [['Nama Produk', 'Kategori', 'Total Awal', 'Terjual', 'Sisa Stok', 'Status']],
        body: tableData,
        startY: 40,
        theme: 'grid',
        headStyles: { fillColor: [202, 138, 4] }, // Brand color
    });

    doc.save(`Laporan_Stok_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Generate Year Options
  const yearOptions = useMemo(() => {
      const currentYear = new Date().getFullYear();
      return Array.from({length: 4}, (_, i) => (currentYear - 2 + i).toString());
  }, []);

  // Generate Month Options
  const monthOptions = [
      { value: '1', label: 'Januari' }, { value: '2', label: 'Februari' }, { value: '3', label: 'Maret' },
      { value: '4', label: 'April' }, { value: '5', label: 'Mei' }, { value: '6', label: 'Juni' },
      { value: '7', label: 'Juli' }, { value: '8', label: 'Agustus' }, { value: '9', label: 'September' },
      { value: '10', label: 'Oktober' }, { value: '11', label: 'November' }, { value: '12', label: 'Desember' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Admin Header - Hidden on Print */}
      <div className="bg-slate-900 text-white shadow-md print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center">
                <Shield className="w-6 h-6 mr-3 text-brand-500" />
                <div>
                    <h1 className="text-xl font-bold font-serif">Admin Dashboard</h1>
                    <p className="text-xs text-slate-400">Selamat datang, <span className="text-brand-400 font-bold capitalize">{userRole}</span></p>
                </div>
            </div>
            <button 
                onClick={onLogout}
                className="flex items-center px-4 py-2 bg-slate-800 hover:bg-red-900/50 rounded-lg text-sm text-slate-300 hover:text-red-200 transition-colors border border-slate-700 hover:border-red-800"
            >
                <LogOut className="w-4 h-4 mr-2" />
                Keluar
            </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:max-w-none">
        
        {/* Info Box - Hidden on Print */}
        {userRole === 'manager' && (
           <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-6 flex items-center print:hidden">
             <AlertCircle className="w-5 h-5 mr-2" />
             <span>Anda login sebagai <strong>Manager</strong>. Anda memiliki akses penuh ke laporan keuangan dan manajemen stok.</span>
           </div>
        )}

        {/* Tabs - Hidden on Print */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 print:hidden">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-3 px-4 text-sm font-medium transition-colors flex items-center ${
              activeTab === 'inventory'
                ? 'border-b-2 border-brand-600 text-brand-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Package className="w-4 h-4 mr-2" />
            Laporan Stok
          </button>
          
          {canManageInventory && (
             <button
             onClick={() => setActiveTab('categories')}
             className={`pb-3 px-4 text-sm font-medium transition-colors flex items-center ${
               activeTab === 'categories'
                 ? 'border-b-2 border-brand-600 text-brand-600'
                 : 'text-slate-500 hover:text-slate-700'
             }`}
           >
             <List className="w-4 h-4 mr-2" />
             Manajemen Kategori
           </button>
          )}

          <button
            onClick={() => setActiveTab('income')}
            className={`pb-3 px-4 text-sm font-medium transition-colors flex items-center ${
              activeTab === 'income'
                ? 'border-b-2 border-brand-600 text-brand-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Laporan Penjualan
          </button>
          <button
            onClick={() => setActiveTab('dp')}
            className={`pb-3 px-4 text-sm font-medium transition-colors flex items-center ${
              activeTab === 'dp'
                ? 'border-b-2 border-brand-600 text-brand-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Laporan DP
            {dpTransactions.length > 0 && (
              <span className="ml-2 bg-brand-100 text-brand-800 text-xs py-0.5 px-2 rounded-full">
                {dpTransactions.length}
              </span>
            )}
          </button>
        </div>

        {/* PRINT HEADER - Only visible when printing */}
        <div className="hidden print:block mb-8 border-b-2 border-slate-800 pb-4">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-brand-600 tracking-tight mb-2">Safaty<span className="text-slate-800">Undangan</span></h1>
                    <div className="text-sm text-slate-600 space-y-1">
                        <p className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> Jl. Percetakan Negara No. 123, Jakarta Pusat</p>
                        <p className="flex items-center"><Phone className="w-4 h-4 mr-2" /> +62 812-3456-7890</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-bold text-slate-900 uppercase">
                        {activeTab === 'inventory' ? 'LAPORAN STOK BARANG' :
                         reportType === 'daily' ? 'LAPORAN HARIAN' : 
                         reportType === 'range' ? 'LAPORAN PERIODE' :
                         reportType === 'monthly' ? 'LAPORAN BULANAN' :
                         'REKAPITULASI TAHUNAN'}
                    </h2>
                    <p className="text-slate-500 mt-1">
                        {activeTab === 'inventory' && `Per Tanggal: ${new Date().toLocaleDateString('id-ID')}`}
                        {activeTab !== 'inventory' && reportType === 'daily' && `Tanggal: ${new Date(filterDate).toLocaleDateString('id-ID', { dateStyle: 'full' })}`}
                        {activeTab !== 'inventory' && reportType === 'range' && `Periode: ${new Date(startDate).toLocaleDateString('id-ID')} s/d ${new Date(endDate).toLocaleDateString('id-ID')}`}
                        {activeTab !== 'inventory' && reportType === 'monthly' && `Bulan: ${monthOptions.find(m => m.value === filterMonth)?.label} ${filterYear}`}
                        {activeTab !== 'inventory' && reportType === 'annual' && `Tahun Buku: ${filterYear}`}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">Dicetak oleh: {userRole} | {new Date().toLocaleString('id-ID')}</p>
                </div>
            </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px] print:shadow-none print:border-none print:min-h-0">
          
          {activeTab === 'inventory' && (
            <div className="p-6 print:p-0">
              {/* Only show Title on Print if needed, but Inventory print usually not requested per date */}
              <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 print:hidden">
                <h3 className="text-lg font-bold text-slate-900">Laporan Stok & Penjualan Barang</h3>
                
                <div className="flex flex-wrap w-full md:w-auto gap-3 items-center">
                    {/* Search Input */}
                    <div className="relative flex-1 md:w-56">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                            placeholder="Cari produk..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2">
                      <button 
                          onClick={handleDownloadStockPDF}
                          className="bg-slate-100 text-slate-700 px-3 py-2 rounded-lg text-sm hover:bg-slate-200 transition-colors flex items-center border border-slate-200"
                          title="Download PDF"
                      >
                          <Download className="w-4 h-4 mr-2" />
                          PDF
                      </button>

                      <button 
                          onClick={handlePrint}
                          className="bg-slate-800 text-white px-3 py-2 rounded-lg text-sm hover:bg-slate-900 transition-colors flex items-center"
                          title="Cetak Laporan"
                      >
                          <Printer className="w-4 h-4 mr-2" />
                          Cetak
                      </button>
                    </div>

                    {canManageInventory && (
                        <button 
                            onClick={openAddProductModal}
                            className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-700 transition-colors flex items-center justify-center shadow-sm whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Tambah
                        </button>
                    )}
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 print:border print:border-slate-300">
                  <thead className="bg-slate-50 print:bg-slate-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider print:px-4 print:py-2 print:text-black">Produk</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider print:px-4 print:py-2 print:text-black">Kategori</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider print:px-4 print:py-2 print:text-black">Harga</th>
                      
                      {/* New Columns */}
                      <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider print:px-4 print:py-2 print:text-black">Total Barang</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider print:px-4 print:py-2 print:text-black">Terjual</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider print:px-4 print:py-2 print:text-black">Sisa Stok</th>
                      
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider print:px-4 print:py-2 print:text-black">Status</th>
                      {canManageInventory && (
                          <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider print:hidden">Aksi</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200 print:divide-slate-300">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => {
                            // Calculate Sales for this product from transactions
                            const soldCount = transactions.reduce((acc, t) => {
                                const item = t.items.find(i => i.name === product.name);
                                return acc + (item ? item.quantity : 0);
                            }, 0);
                            
                            // Estimate "Total Stock" (Initial) as Current + Sold
                            const totalStock = product.stock + soldCount;

                            return (
                                <tr key={product.id}>
                                    <td className="px-6 py-4 whitespace-nowrap print:px-4 print:py-2">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0 print:hidden">
                                        <img className="h-10 w-10 rounded-full object-cover" src={product.image} alt="" />
                                        </div>
                                        <div className="ml-4 print:ml-0">
                                        <div className="text-sm font-medium text-slate-900">{product.name}</div>
                                        </div>
                                    </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 print:px-4 print:py-2">{product.category}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 print:px-4 print:py-2">{product.displayPrice}</td>
                                    
                                    {/* Total Barang */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 text-center font-medium print:px-4 print:py-2">
                                        {totalStock}
                                    </td>

                                    {/* Terjual */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center print:px-4 print:py-2">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${soldCount > 0 ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'}`}>
                                            {soldCount > 0 && <ArrowUpCircle className="w-3 h-3 mr-1" />}
                                            {soldCount}
                                        </span>
                                    </td>

                                    {/* Sisa Stok */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-center text-slate-900 print:px-4 print:py-2">
                                        {product.stock}
                                    </td>
                                    
                                    <td className="px-6 py-4 whitespace-nowrap print:px-4 print:py-2">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        product.stock > 50 ? 'bg-green-100 text-green-800' : 
                                        product.stock > 10 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {product.stock > 50 ? 'Aman' : product.stock > 10 ? 'Menipis' : 'Kritis'}
                                    </span>
                                    </td>
                                    {canManageInventory && (
                                        <td className="px-6 py-4 whitespace-nowrap text-center print:hidden">
                                            <button 
                                                onClick={() => openEditProductModal(product)}
                                                className="text-slate-500 hover:text-brand-600 transition-colors"
                                                title="Edit Stok & Produk"
                                            >
                                                <Pencil className="w-5 h-5" />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={canManageInventory ? 8 : 7} className="px-6 py-12 text-center text-slate-500">
                                <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                <p>Tidak ada produk yang cocok dengan pencarian "{searchTerm}"</p>
                            </td>
                        </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'categories' && canManageInventory && (
             <div className="p-6 print:hidden">
                <div className="max-w-2xl">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Manajemen Kategori Produk</h3>
                    
                    {/* Category Search */}
                    <div className="relative mb-6">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                            placeholder="Cari kategori..."
                            value={categorySearchTerm}
                            onChange={(e) => setCategorySearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Add Category Form */}
                    <form onSubmit={handleAddCategorySubmit} className="flex gap-2 mb-8 p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <input 
                            type="text" 
                            placeholder="Nama Kategori Baru"
                            className="flex-1 rounded-md border-slate-300 border px-3 py-2 text-sm focus:ring-brand-500 focus:border-brand-500"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            required
                        />
                        <button 
                            type="submit"
                            className="bg-brand-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-700 flex items-center"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah
                        </button>
                    </form>

                    {/* Category List */}
                    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                        {filteredCategories.length > 0 ? (
                            <ul className="divide-y divide-slate-100">
                                {filteredCategories.map((category, index) => (
                                    <li key={index} className="px-4 py-3 flex justify-between items-center hover:bg-slate-50 transition-colors">
                                        <span className="text-slate-700 font-medium">{category}</span>
                                        <button 
                                            onClick={() => onDeleteCategory(category)}
                                            className="text-slate-400 hover:text-red-500 p-1"
                                            title="Hapus Kategori"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="p-8 text-center text-slate-500">
                                <p>Tidak ada kategori yang cocok dengan pencarian "{categorySearchTerm}".</p>
                            </div>
                        )}
                    </div>
                </div>
             </div>
          )}

          {activeTab === 'income' && (
            <div className="p-6 print:p-0">
              
              {/* Report Type Selector & Filter - Hidden on Print */}
              <div className="flex flex-col gap-4 mb-6 print:hidden">
                
                {/* Type Toggle - Improved Group */}
                <div className="flex flex-wrap bg-slate-100 p-1 rounded-lg w-fit gap-1">
                    <button 
                        onClick={() => setReportType('daily')}
                        className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${reportType === 'daily' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Harian
                    </button>
                    <button 
                        onClick={() => setReportType('range')}
                        className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${reportType === 'range' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Periode (Range)
                    </button>
                    <button 
                        onClick={() => setReportType('monthly')}
                        className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${reportType === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Bulanan
                    </button>
                    <button 
                        onClick={() => setReportType('annual')}
                        className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${reportType === 'annual' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Rekap Tahunan
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <h3 className="text-lg font-bold text-slate-900">
                        {reportType === 'daily' && 'Laporan Transaksi Harian'}
                        {reportType === 'range' && 'Laporan Transaksi Periode'}
                        {reportType === 'monthly' && 'Laporan Transaksi Bulanan'}
                        {reportType === 'annual' && 'Rekapitulasi Pendapatan Tahunan'}
                    </h3>
                    
                    <div className="flex flex-wrap gap-3 w-full lg:w-auto items-center">
                        
                        {/* Dynamic Inputs Based on Report Type */}
                        
                        {reportType === 'daily' && (
                             <input 
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="block w-full sm:w-auto px-3 py-2 border border-slate-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 text-sm"
                            />
                        )}

                        {reportType === 'range' && (
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <input 
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="block w-full sm:w-36 px-3 py-2 border border-slate-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 text-sm"
                                />
                                <ArrowRight className="w-4 h-4 text-slate-400" />
                                <input 
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="block w-full sm:w-36 px-3 py-2 border border-slate-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 text-sm"
                                />
                            </div>
                        )}

                        {(reportType === 'monthly' || reportType === 'annual') && (
                            <div className="flex gap-2 w-full sm:w-auto">
                                {reportType === 'monthly' && (
                                    <div className="relative w-full sm:w-32">
                                        <select
                                            value={filterMonth}
                                            onChange={(e) => setFilterMonth(e.target.value)}
                                            className="block w-full pl-3 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 text-sm appearance-none bg-white"
                                        >
                                            {monthOptions.map(m => (
                                                <option key={m.value} value={m.value}>{m.label}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-2.5 pointer-events-none" />
                                    </div>
                                )}
                                <div className="relative w-full sm:w-28">
                                    <select
                                        value={filterYear}
                                        onChange={(e) => setFilterYear(e.target.value)}
                                        className="block w-full pl-3 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 text-sm appearance-none bg-white"
                                    >
                                        {yearOptions.map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-2.5 pointer-events-none" />
                                </div>
                            </div>
                        )}

                        <button 
                            onClick={handlePrint}
                            className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors flex items-center shadow-sm whitespace-nowrap ml-auto lg:ml-0"
                        >
                            <Printer className="w-4 h-4 mr-2" />
                            Cetak
                        </button>
                    </div>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 print:grid-cols-3 print:gap-4 print:mb-6">
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 print:border print:border-slate-300 print:bg-white print:p-4">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-500 text-white mr-4 print:hidden">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 font-medium print:text-black">Total Pendapatan</p>
                      <h3 className="text-2xl font-bold text-slate-900 print:text-xl">
                          {formatCurrency(reportType === 'annual' ? annualTotalRevenue : filteredRevenue)}
                      </h3>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-6 rounded-xl border border-green-100 print:border print:border-slate-300 print:bg-white print:p-4">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-500 text-white mr-4 print:hidden">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-green-600 font-medium print:text-black">Total Transaksi</p>
                      <h3 className="text-2xl font-bold text-slate-900 print:text-xl">
                          {reportType === 'annual' ? annualTotalTransactions : filteredTransactions.length}
                      </h3>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 print:border print:border-slate-300 print:bg-white print:p-4">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-purple-500 text-white mr-4 print:hidden">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-purple-600 font-medium print:text-black">Periode Laporan</p>
                      <h3 className="text-lg font-bold text-slate-900 print:text-base">
                        {reportType === 'daily' && new Date(filterDate).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}
                        {reportType === 'range' && 'Range Tanggal'}
                        {reportType === 'monthly' && monthOptions.find(m => m.value === filterMonth)?.label}
                        {reportType === 'annual' && `Tahun ${filterYear}`}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 print:border print:border-slate-300">
                  <thead className="bg-slate-50 print:bg-slate-100">
                    <tr>
                      {reportType !== 'annual' ? (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider print:px-4 print:py-2 print:text-black">ID / Tanggal</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider print:px-4 print:py-2 print:text-black">Pelanggan</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider print:px-4 print:py-2 print:text-black">Total Transaksi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider print:px-4 print:py-2 print:text-black">Terbayar</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider print:px-4 print:py-2 print:text-black">Status</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider print:hidden">Aksi</th>
                          </>
                      ) : (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider print:px-4 print:py-2 print:text-black">No</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider print:px-4 print:py-2 print:text-black">Bulan</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider print:px-4 print:py-2 print:text-black">Jumlah Transaksi</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider print:px-4 print:py-2 print:text-black">Total Pendapatan (Rp)</th>
                          </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200 print:divide-slate-300">
                    
                    {reportType !== 'annual' ? (
                        filteredTransactions.length > 0 ? (
                            filteredTransactions.map((trx) => (
                            <tr key={trx.id}>
                                <td className="px-6 py-4 whitespace-nowrap print:px-4 print:py-2">
                                <div className="text-sm font-bold text-slate-900">{trx.id}</div>
                                <div className="text-xs text-slate-500">{trx.date}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium print:px-4 print:py-2">{trx.customerName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900 print:px-4 print:py-2">{formatCurrency(trx.totalAmount)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 print:px-4 print:py-2">
                                    {formatCurrency(trx.paidAmount ?? (trx.status === 'Lunas' ? trx.totalAmount : 0))}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap print:px-4 print:py-2">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    trx.status === 'Lunas' ? 'bg-green-100 text-green-800' : 
                                    trx.status === 'DP' ? 'bg-blue-100 text-blue-800' :
                                    'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {trx.status}
                                </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center print:hidden">
                                <div className="flex justify-center space-x-2">
                                    <button 
                                    onClick={() => setEditingTransaction(trx)}
                                    disabled={userRole !== 'admin'}
                                    className={`transition-colors ${userRole === 'admin' ? 'text-slate-500 hover:text-brand-600' : 'text-slate-300 cursor-not-allowed'}`}
                                    title={userRole === 'admin' ? "Edit Nominal & DP" : "Akses Terbatas"}
                                    >
                                    <Pencil className="w-5 h-5" />
                                    </button>
                                    <button 
                                    onClick={() => setSelectedTransaction(trx)}
                                    className="text-slate-500 hover:text-brand-600 transition-colors"
                                    title="Lihat Nota"
                                    >
                                    <FileText className="w-5 h-5" />
                                    </button>
                                </div>
                                </td>
                            </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500 print:py-6">
                                    <p>Tidak ada transaksi pada periode ini.</p>
                                </td>
                            </tr>
                        )
                    ) : (
                        // ANNUAL TABLE BODY
                        annualRecap.map((month) => (
                            <tr key={month.id} className={month.revenue > 0 ? "bg-white" : "bg-slate-50/50"}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 print:px-4 print:py-2">{month.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 print:px-4 print:py-2">{month.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 print:px-4 print:py-2">
                                    {month.transactionCount > 0 ? `${month.transactionCount} Transaksi` : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900 text-right print:px-4 print:py-2">
                                    {month.revenue > 0 ? formatCurrency(month.revenue) : '-'}
                                </td>
                            </tr>
                        ))
                    )}
                    
                    {/* Annual Footer Total */}
                    {reportType === 'annual' && (
                        <tr className="bg-slate-100 font-bold border-t-2 border-slate-300 print:bg-slate-200">
                            <td colSpan={2} className="px-6 py-4 text-right print:px-4 print:py-2 uppercase">Total Tahunan</td>
                            <td className="px-6 py-4 print:px-4 print:py-2">{annualTotalTransactions}</td>
                            <td className="px-6 py-4 text-right print:px-4 print:py-2">{formatCurrency(annualTotalRevenue)}</td>
                        </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'dp' && (
            <div className="p-6 print:hidden">
              {/* DP Summary Info */}
               <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8 flex items-start">
                  <div className="bg-amber-100 p-3 rounded-full mr-4">
                     <AlertCircle className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-amber-900 mb-1">Piutang / Sisa Tagihan</h3>
                    <p className="text-amber-700 mb-2">Total kekurangan pembayaran dari konsumen yang harus ditagih.</p>
                    <p className="text-3xl font-bold text-slate-900">{formatCurrency(totalReceivable)}</p>
                  </div>
               </div>

              <h3 className="text-lg font-bold text-slate-900 mb-4">Daftar Transaksi DP (Belum Lunas)</h3>
              
              {dpTransactions.length === 0 ? (
                <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Tidak ada transaksi DP yang aktif saat ini.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID Transaksi</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Pelanggan</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Tagihan</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">DP Masuk</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Kurang Bayar</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {dpTransactions.map((trx) => {
                         const paid = trx.paidAmount || 0;
                         const remaining = trx.totalAmount - paid;
                         return (
                          <tr key={trx.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-bold text-slate-900">{trx.id}</div>
                              <div className="text-xs text-slate-500">{trx.date}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">{trx.customerName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{formatCurrency(trx.totalAmount)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">{formatCurrency(paid)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">{formatCurrency(remaining)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex justify-center space-x-2">
                                <button 
                                  onClick={() => setEditingTransaction(trx)}
                                  disabled={userRole !== 'admin'}
                                  className={`transition-colors ${userRole === 'admin' ? 'text-slate-500 hover:text-brand-600' : 'text-slate-300 cursor-not-allowed'}`}
                                  title={userRole === 'admin' ? "Edit Nominal & DP" : "Akses Terbatas"}
                                >
                                  <Pencil className="w-5 h-5" />
                                </button>
                                <button 
                                  onClick={() => setSelectedTransaction(trx)}
                                  className="text-slate-500 hover:text-brand-600 transition-colors"
                                  title="Lihat Nota"
                                >
                                  <FileText className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                         );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Invoice Modal */}
      {selectedTransaction && (
        <InvoiceModal 
          transaction={selectedTransaction} 
          onClose={() => setSelectedTransaction(null)} 
        />
      )}

      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSave={onUpdateTransaction} // Use prop
        />
      )}

      {/* Add/Edit Product Modal */}
      {isProductModalOpen && (
        <EditProductModal
            product={editingProduct}
            onClose={() => setIsProductModalOpen(false)}
            onSave={handleSaveProduct}
            categories={categories}
        />
      )}
    </div>
  );
};

export default AdminDashboard;