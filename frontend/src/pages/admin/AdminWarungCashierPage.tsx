import { useEffect, useState } from 'react';
import { getActiveProducts, createTransaction } from '../../api/warung';
import type { WarungProduct } from '../../types/warung';
import { Button } from '../../components/ui/Button';
import { Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import axios from 'axios';

interface CartItem {
  product: WarungProduct;
  quantity: number;
}

export function AdminWarungCashierPage() {
  const [products, setProducts] = useState<WarungProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setIsLoading(true);
    try {
      const data = await getActiveProducts();
      setProducts(data);
    } finally {
      setIsLoading(false);
    }
  }

  function handleAddToCart() {
    if (!selectedProductId) return;

    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });

    setSelectedProductId('');
  }

  function updateQuantity(productId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id !== productId) return item;
          const newQty = item.quantity + delta;
          return { ...item, quantity: newQty };
        })
        .filter((item) => item.quantity > 0),
    );
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }

  const total = cart.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);

  async function handleCheckout() {
    if (cart.length === 0) return;

    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      await createTransaction(cart.map((item) => ({ productId: item.product.id, quantity: item.quantity })));
      setSuccessMessage('Transaksi berhasil dicatat!');
      setCart([]);
      await loadProducts();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Gagal memproses transaksi.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6 text-text-primary">Kasir Warung</h1>

      <div className="neu-flat rounded-xl p-5 mb-6">
        <label className="text-sm font-medium text-text-secondary block mb-2">Pilih Barang</label>
        <div className="flex flex-col sm:flex-row gap-2">
  <select
    value={selectedProductId}
    onChange={(e) => setSelectedProductId(e.target.value)}
    className="neu-pressed w-full sm:flex-1 h-12 px-4 rounded-xl border-none text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
  >
    <option value="">Pilih barang</option>
    {products.map((product) => (
      <option key={product.id} value={product.id}>
        {product.name} — Rp{Number(product.price).toLocaleString('id-ID')} (stok: {product.stock})
      </option>
    ))}
  </select>

  <Button
    onClick={handleAddToCart}
    disabled={!selectedProductId}
    className="w-full sm:w-auto"
  >
    Tambah
  </Button>
</div>
        {isLoading && <p className="text-xs text-text-secondary mt-2">Memuat daftar barang...</p>}
        {!isLoading && products.length === 0 && (
          <p className="text-xs text-text-secondary mt-2">Belum ada barang tersedia atau stok habis.</p>
        )}
      </div>

      <div className="neu-flat rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart size={18} className="text-primary" />
          <h2 className="font-bold text-text-primary">Keranjang</h2>
        </div>

        {cart.length === 0 ? (
          <p className="text-text-secondary text-sm">Belum ada barang di keranjang.</p>
        ) : (
          <div className="flex flex-col gap-2 mb-4">
            {cart.map((item) => (
              <div key={item.product.id} className="neu-pressed rounded-lg p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-text-primary truncate">{item.product.name}</p>
                  <p className="text-xs text-text-secondary font-mono">
                    Rp{Number(item.product.price).toLocaleString('id-ID')} x {item.quantity} = Rp
                    {(Number(item.product.price) * item.quantity).toLocaleString('id-ID')}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => updateQuantity(item.product.id, -1)}
                    className="w-7 h-7 rounded-lg neu-flat-sm flex items-center justify-center text-text-secondary hover:brightness-110"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-6 text-center text-sm font-medium text-text-primary">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, 1)}
                    disabled={item.quantity >= item.product.stock}
                    className="w-7 h-7 rounded-lg neu-flat-sm flex items-center justify-center text-text-secondary hover:brightness-110 disabled:opacity-30"
                  >
                    <Plus size={12} />
                  </button>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="w-7 h-7 rounded-lg neu-flat-sm flex items-center justify-center text-error hover:brightness-110 ml-1"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="neu-pressed rounded-lg p-4 flex items-center justify-between mb-4">
          <span className="font-semibold text-text-primary">Total</span>
          <span className="text-xl font-bold font-mono text-secondary">Rp{total.toLocaleString('id-ID')}</span>
        </div>

        {error && <p className="text-sm text-error mb-3">{error}</p>}
        {successMessage && <p className="text-sm text-success mb-3">{successMessage}</p>}

        <Button onClick={handleCheckout} disabled={cart.length === 0 || isSubmitting} className="w-full">
          {isSubmitting ? 'Memproses...' : 'Selesaikan Transaksi'}
        </Button>
      </div>
    </div>
  );
}