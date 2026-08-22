export interface WarungProduct {
  id: string;
  name: string;
  price: string;
  stock: number;
  isActive: boolean;
  createdAt: string;
}

export interface WarungTransactionItem {
  id: string;
  productId: string;
  productName: string;
  priceAtSale: string;
  quantity: number;
}

export interface WarungTransaction {
  id: string;
  totalAmount: string;
  recordedBy: string;
  recordedByUser?: { fullName: string };
  createdAt: string;
  items: WarungTransactionItem[];
}