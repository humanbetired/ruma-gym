import { useEffect, useState } from 'react';
import { getTransactions } from '../../api/warung';
import type { WarungTransaction } from '../../types/warung';
import { Pagination } from '../../components/ui/Pagination';
import { Input } from '../../components/ui/Input';
import { Receipt, Search } from 'lucide-react';

const PAGE_SIZE = 10;

function getDefaultDateRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0],
  };
}

export function AdminWarungHistoryPage() {
  const defaultRange = getDefaultDateRange();
  const [fromDate, setFromDate] = useState(defaultRange.from);
  const [toDate, setToDate] = useState(defaultRange.to);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [transactions, setTransactions] = useState<WarungTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    loadTransactions();
  }, [fromDate, toDate, searchQuery, page]);

  async function loadTransactions() {
    setIsLoading(true);
    try {
      const result = await getTransactions({
        from: fromDate || undefined,
        to: toDate || undefined,
        search: searchQuery || undefined,
        page,
        limit: PAGE_SIZE,
      });
      setTransactions(result.data);
      setTotalPages(result.meta.totalPages);
    } finally {
      setIsLoading(false);
    }
  }

  function handleDateChange(setter: (v: string) => void, value: string) {
    setter(value);
    setPage(1);
  }

  const periodTotal = transactions.reduce((sum, trx) => sum + Number(trx.totalAmount), 0);

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6 text-text-primary">Riwayat Transaksi Warung</h1>

      <div className="neu-flat rounded-xl p-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <Input
            type="date"
            label="Dari Tanggal"
            value={fromDate}
            onChange={(e) => handleDateChange(setFromDate, e.target.value)}
          />
          <Input
            type="date"
            label="Sampai Tanggal"
            value={toDate}
            onChange={(e) => handleDateChange(setToDate, e.target.value)}
          />
        </div>

        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral pointer-events-none">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari nama barang..."
            className="neu-pressed h-12 pl-12 pr-4 rounded-xl border-none w-full text-text-primary placeholder:text-neutral focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {!isLoading && transactions.length > 0 && (
        <div className="neu-pressed rounded-xl p-4 mb-6 flex items-center justify-between">
          <p className="text-sm text-text-secondary">Total di halaman ini</p>
          <p className="font-bold font-mono text-secondary">Rp{periodTotal.toLocaleString('id-ID')}</p>
        </div>
      )}

      {isLoading ? (
        <p className="text-text-secondary">Memuat...</p>
      ) : transactions.length === 0 ? (
        <p className="text-text-secondary">
          {searchQuery ? `Tidak ada transaksi dengan barang "${searchQuery}".` : 'Tidak ada transaksi pada periode ini.'}
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {transactions.map((trx) => (
              <div key={trx.id} className="neu-flat rounded-xl p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full neu-pressed flex items-center justify-center text-primary shrink-0">
                      <Receipt size={14} />
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">
                        Dicatat oleh <span className="text-text-primary font-medium">{trx.recordedByUser?.fullName}</span>
                      </p>
                      <p className="text-xs text-neutral">
                        {new Date(trx.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                  </div>
                  <p className="font-bold font-mono text-secondary shrink-0">Rp{Number(trx.totalAmount).toLocaleString('id-ID')}</p>
                </div>

                <div className="neu-pressed rounded-lg p-3 flex flex-col gap-1">
                  {trx.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-text-secondary">
                        {item.productName} x{item.quantity}
                      </span>
                      <span className="font-mono text-text-primary">
                        Rp{(Number(item.priceAtSale) * item.quantity).toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}