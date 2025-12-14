
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  displayPrice: string;
  image: string;
  description: string;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface InvitationRequest {
  groomName: string;
  brideName: string;
  date: string;
  venue: string;
  tone: 'formal' | 'casual' | 'islami' | 'javanese';
  language: 'id' | 'en' | 'jw';
}

export interface TransactionItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Transaction {
  id: string;
  date: string;
  customerName: string;
  customerAddress?: string;
  totalAmount: number; // This is the Final Total (Subtotal - Discount)
  discount?: number;   // Optional discount amount
  paidAmount?: number; // Amount paid so far (for DP)
  status: 'Lunas' | 'Pending' | 'DP';
  items: TransactionItem[];
}

export type ViewState = 'home' | 'products' | 'ai-assistant' | 'contact' | 'admin';

export type UserRole = 'admin' | 'manager' | null;
