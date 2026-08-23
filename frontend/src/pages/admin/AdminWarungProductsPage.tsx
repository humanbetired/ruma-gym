import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { getAllProductsAdmin, createProduct, updateProduct, deleteProduct } from '../../api/warung';
import type { WarungProduct } from '../../types/warung';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Pencil, EyeOff, Eye } from 'lucide-react';
import { useConfirm } from '../../context/ConfirmContext';

export function AdminWarungProductsPage() {
  const confirm = useConfirm();
  const [products, setProducts] = useState<WarungProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setIsLoading(true);
    try {
      const data = await getAllProductsAdmin();
      setProducts(data);
    } finally {
      setIsLoading(false);
    }
  }

  function startEdit(product: WarungProduct) {
    setEditingId(product.id);
    setName(product.name);
    setPrice(String(product.price).replace(/\D/g, ''));
    setStock(String(product.stock));
  }

  function formatRupiah(value: string) {
  const number = value.replace(/\D/g, '');
  return number ? Number(number).toLocaleString('id-ID') : '';
  }

  function cancelEdit() {
    setEditingId(null);
    setName('');
    setPrice('');
    setStock('');
    setError('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const payload = { name, price: Number(price), stock: Number(stock) };

    try {
      if (editingId) {
        await updateProduct(editingId, payload);
      } else {
        await createProduct(payload);
      }
      cancelEdit();
      await loadProducts();
    } catch {
      setError('Gagal menyimpan produk.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleActive(product: WarungProduct) {
    if (product.isActive) {
      const ok = await confirm({
        title: 'Nonaktifkan Produk',
        message: `Produk "${product.name}" tidak akan muncul lagi di halaman kasir. Lanjutkan?`,
        variant: 'danger',
      });
      if (!ok) return;
      await deleteProduct(product.id);
    } else {
      await updateProduct(product.id, { isActive: true });
    }
    await loadProducts();
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6 text-text-primary">Kelola Barang Warung</h1>

      <form onSubmit={handleSubmit} className="neu-flat rounded-xl p-5 mb-6">
        <h2 className="font-bold mb-4 text-text-primary">{editingId ? 'Edit Barang' : 'Tambah Barang'}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input label="Nama Barang" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input
            label="Harga (Rp)"
            type="text"
            inputMode="numeric"
            value={formatRupiah(price)}
            onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))}
            required
          />
          <Input label="Stok" type="number" value={stock} onChange={(e) => setStock(e.target.value)} required />
        </div>

        {error && <p className="text-sm text-error mt-3">{error}</p>}

        <div className="flex gap-2 mt-4">
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Menyimpan...' : editingId ? 'Update' : 'Tambah'}</Button>
          {editingId && <Button type="button" variant="secondary" onClick={cancelEdit}>Batal</Button>}
        </div>
      </form>

      {isLoading ? (
        <p className="text-text-secondary">Memuat...</p>
      ) : (
        <div className="flex flex-col gap-2">
          {products.map((product) => (
            <div key={product.id} className={`neu-flat rounded-xl p-4 flex items-center justify-between gap-3 ${!product.isActive ? 'opacity-50' : ''}`}>
              <div className="min-w-0">
                <p className="font-semibold text-text-primary">{product.name}</p>
                <p className="text-sm text-text-secondary font-mono">
                  Rp{Number(product.price).toLocaleString('id-ID')} • Stok: {product.stock}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => startEdit(product)} className="p-2 rounded-lg neu-flat-sm text-primary hover:brightness-110" aria-label="Edit">
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleToggleActive(product)}
                  className="p-2 rounded-lg neu-flat-sm text-neutral hover:brightness-110"
                  aria-label={product.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                >
                  {product.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}