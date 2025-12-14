import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductList from './components/ProductList';
import AIAssistant from './components/AIAssistant';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import AdminDashboard from './components/AdminDashboard';
import LoginModal from './components/LoginModal';
import { ViewState, Product, CartItem, UserRole, Transaction } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Auth State
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Category Management State
  const [categories, setCategories] = useState<string[]>([
    'Undangan Pernikahan',
    'Office',
    'Promosi',
    'Packaging',
    'Buku',
    'Digital'
  ]);

  // Initial Product Data with Stock
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'Undangan Hardcover Mewah',
      category: 'Undangan Pernikahan',
      price: 5000,
      displayPrice: 'Rp 5.000 / pcs',
      image: 'https://picsum.photos/400/300?random=1',
      description: 'Undangan tebal dengan foil emas dan amplop eksklusif. Pilihan tepat untuk acara formal.',
      stock: 1500
    },
    {
      id: '2',
      name: 'Undangan Softcover Floral',
      category: 'Undangan Pernikahan',
      price: 2500,
      displayPrice: 'Rp 2.500 / pcs',
      image: 'https://picsum.photos/400/300?random=2',
      description: 'Desain minimalis dengan motif bunga yang manis. Bahan art carton berkualitas.',
      stock: 2000
    },
    {
      id: '3',
      name: 'Kartu Nama Bisnis',
      category: 'Office',
      price: 35000,
      displayPrice: 'Rp 35.000 / Box',
      image: 'https://picsum.photos/400/300?random=3',
      description: 'Cetak kartu nama 1 atau 2 sisi dengan laminasi doff atau glossy. Isi 100 pcs.',
      stock: 50
    },
    {
      id: '4',
      name: 'X-Banner Standing',
      category: 'Promosi',
      price: 85000,
      displayPrice: 'Rp 85.000',
      image: 'https://picsum.photos/400/300?random=4',
      description: 'Banner promosi lengkap dengan tiang penyangga. Praktis dan mudah dibawa.',
      stock: 12
    },
    {
      id: '5',
      name: 'Cetak Sticker Label',
      category: 'Packaging',
      price: 15000,
      displayPrice: 'Rp 15.000 / Lembar A3',
      image: 'https://picsum.photos/400/300?random=5',
      description: 'Sticker kromo atau vinyl anti air. Sudah termasuk cutting sesuai pola.',
      stock: 500
    },
    {
      id: '6',
      name: 'Buku Yasin Custom',
      category: 'Buku',
      price: 12000,
      displayPrice: 'Rp 12.000 / pcs',
      image: 'https://picsum.photos/400/300?random=6',
      description: 'Buku Yasin dengan cover custom foto almarhum, tersedia hardcover dan softcover.',
      stock: 75
    }
  ]);

  // Global Transactions State (Lifted from AdminDashboard)
  const [transactions, setTransactions] = useState<Transaction[]>([
    { 
      id: 'TRX-001', 
      date: '2024-05-01', 
      customerName: 'Budi Santoso', 
      customerAddress: 'Jl. Melati No. 45, Jakarta Selatan',
      totalAmount: 500000, 
      status: 'Lunas', 
      items: [
        { name: 'Undangan Hardcover Mewah', quantity: 100, price: 5000 }
      ] 
    },
    { 
      id: 'TRX-002', 
      date: '2024-05-02', 
      customerName: 'Siti Aminah', 
      customerAddress: 'Komplek Permata Hijau Blok A2',
      totalAmount: 175000, 
      status: 'Lunas', 
      items: [
        { name: 'Kartu Nama Bisnis', quantity: 5, price: 35000 }
      ] 
    },
    { 
      id: 'TRX-003', 
      date: '2024-05-03', 
      customerName: 'PT Maju Jaya', 
      customerAddress: 'Gedung Cyber Lt. 2, Kuningan',
      totalAmount: 850000, 
      status: 'Pending', 
      items: [
         { name: 'X-Banner Standing', quantity: 10, price: 85000 }
      ] 
    },
    { 
      id: 'TRX-004', 
      date: '2024-05-03', 
      customerName: 'Rian & Rini', 
      customerAddress: 'Jl. Kenanga No. 10, Bandung',
      totalAmount: 2500000, 
      status: 'Lunas', 
      items: [
         { name: 'Undangan Softcover Floral', quantity: 1000, price: 2500 }
      ]
    },
    { 
      id: 'TRX-005', 
      date: '2024-05-04', 
      customerName: 'Keluarga Besar H. Ahmad', 
      customerAddress: 'Jl. Raya Bogor KM 25',
      totalAmount: 600000, 
      status: 'Lunas', 
      items: [
         { name: 'Buku Yasin Custom', quantity: 50, price: 12000 }
      ] 
    },
    {
      id: 'TRX-006',
      date: '2024-05-05',
      customerName: 'Doni Pratama',
      customerAddress: 'Jl. Sudirman No. 88',
      totalAmount: 3000000,
      paidAmount: 1000000,
      status: 'DP',
      items: [
        { name: 'Undangan Hardcover Premium', quantity: 200, price: 15000 }
      ]
    },
    {
      id: 'TRX-007',
      date: '2024-06-06',
      customerName: 'Sari & Bimo',
      customerAddress: 'Komp. Gading Serpong',
      totalAmount: 1500000,
      paidAmount: 750000,
      status: 'DP',
      items: [
        { name: 'Undangan Softcover Custom', quantity: 500, price: 3000 }
      ]
    }
  ]);

  // Simple scroll to top on view change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, newQuantity) };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Transaction Management Handlers
  const handleAddTransaction = (newTransaction: Transaction) => {
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const handleUpdateTransaction = (id: string, newTotal: number, newPaid: number) => {
    setTransactions(prev => prev.map(trx => {
      if (trx.id === id) {
        // Calculate new status based on payment
        let newStatus: 'Lunas' | 'DP' | 'Pending' = 'Pending';
        if (newPaid >= newTotal) {
          newStatus = 'Lunas';
        } else if (newPaid > 0) {
          newStatus = 'DP';
        }

        return {
          ...trx,
          totalAmount: newTotal,
          paidAmount: newPaid,
          status: newStatus
        };
      }
      return trx;
    }));
  };

  // Product Management Handlers
  const handleAddProduct = (newProduct: Product) => {
    setProducts(prev => [newProduct, ...prev]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  // Category Management Handlers
  const handleAddCategory = (newCategory: string) => {
    if (!categories.includes(newCategory)) {
      setCategories(prev => [...prev, newCategory]);
    }
  };

  const handleDeleteCategory = (category: string) => {
    setCategories(prev => prev.filter(c => c !== category));
  };

  // Intercept navigation to handle authentication
  const handleSetView = (view: ViewState) => {
    if (view === 'admin' && !userRole) {
      setIsLoginOpen(true);
    } else {
      setCurrentView(view);
    }
  };

  const handleLoginSuccess = (role: UserRole) => {
    setUserRole(role);
    setIsLoginOpen(false);
    setCurrentView('admin');
  };

  const handleLogout = () => {
    setUserRole(null);
    setCurrentView('home');
  };

  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-slate-900 relative">
      <div className="print:hidden">
        <Header 
            currentView={currentView} 
            setView={handleSetView} 
            cartItemCount={cartItemCount}
            onOpenCart={() => setIsCartOpen(true)}
        />
      </div>

      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onCheckoutSuccess={clearCart}
        onAddTransaction={handleAddTransaction}
      />

      <LoginModal 
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={handleLoginSuccess}
      />

      <main className="flex-grow">
        {currentView === 'home' && (
          <>
            <Hero 
              onCtaClick={() => setCurrentView('products')} 
              onSecondaryCtaClick={() => setCurrentView('ai-assistant')}
            />
            {/* Show a preview of products on home too */}
            <div className="bg-slate-50 py-10">
               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-end mb-6">
                 <div>
                    <h2 className="text-2xl font-bold text-slate-900">Produk Unggulan</h2>
                    <p className="text-slate-500">Pilihan favorit pelanggan kami</p>
                 </div>
                 <button onClick={() => setCurrentView('products')} className="text-brand-600 font-medium hover:text-brand-700">Lihat Semua &rarr;</button>
               </div>
               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Hardcoded previews for Home Page - using dynamic data but sliced */}
                  {products.slice(0, 3).map((product) => (
                    <div key={product.id} onClick={() => setCurrentView('products')} className="cursor-pointer group relative rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all">
                       <img src={product.image} alt={product.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"/>
                       <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                       <div className="absolute bottom-4 left-4 text-white font-bold text-lg drop-shadow-md">{product.name}</div>
                    </div>
                  ))}
               </div>
            </div>
            
            <div className="py-16 bg-brand-600 text-white text-center">
              <div className="max-w-4xl mx-auto px-4">
                <h2 className="text-3xl font-serif font-bold mb-4">Butuh Inspirasi Kata-Kata?</h2>
                <p className="text-brand-100 mb-8 text-lg">Gunakan fitur AI kami untuk membuat redaksi undangan yang menyentuh hati secara otomatis.</p>
                <button 
                  onClick={() => setCurrentView('ai-assistant')}
                  className="bg-white text-brand-600 px-8 py-3 rounded-full font-bold shadow-lg hover:bg-brand-50 transition-colors"
                >
                  Coba AI Writer Sekarang
                </button>
              </div>
            </div>
          </>
        )}

        {currentView === 'products' && (
          <ProductList products={products} onAddToCart={addToCart} />
        )}
        
        {currentView === 'ai-assistant' && <AIAssistant />}
        
        {currentView === 'contact' && <ContactSection />}

        {currentView === 'admin' && (
          <AdminDashboard 
            products={products} 
            categories={categories}
            userRole={userRole}
            transactions={transactions}
            onLogout={handleLogout}
            onAddProduct={handleAddProduct}
            onEditProduct={handleUpdateProduct}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            onUpdateTransaction={handleUpdateTransaction}
          />
        )}
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
};

export default App;