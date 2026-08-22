import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { createDropIn, checkoutDropIn, getTodayDropIns } from '../../api/dropin';
import type { DropInVisit } from '../../types/dropin';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LogOut, UserCheck } from 'lucide-react';

export function DropInPage() {
  const [visits, setVisits] = useState<DropInVisit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingOutId, setCheckingOutId] = useState<string | null>(null);

  useEffect(() => {
    loadVisits();
  }, []);

  async function loadVisits() {
    setIsLoading(true);
    try {
      const data = await getTodayDropIns();
      setVisits(data);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!visitorName || !amount) {
      setError('Nama dan nominal wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createDropIn({ visitorName, visitorPhone: visitorPhone || undefined, amount: Number(amount) });
      setVisitorName('');
      setVisitorPhone('');
      setAmount('');
      await loadVisits();
    } catch {
      setError('Gagal mencatat kunjungan.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCheckout(id: string) {
    setCheckingOutId(id);
    try {
      await checkoutDropIn(id);
      await loadVisits();
    } catch {
      alert('Gagal mencatat checkout.');
    } finally {
      setCheckingOutId(null);
    }
  }

  const stillInside = visits.filter((v) => !v.checkOutTime);
  const alreadyLeft = visits.filter((v) => v.checkOutTime);
  const totalRevenue = visits.reduce((sum, v) => sum + Number(v.amount), 0);

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6 text-text-primary">Drop-in Visitor</h1>

      <form onSubmit={handleSubmit} className="neu-flat rounded-xl p-5 mb-6">
        <h2 className="font-bold mb-4 text-text-primary">Catat Kedatangan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input label="Nama Pengunjung" value={visitorName} onChange={(e) => setVisitorName(e.target.value)} required />
          <Input label="No. HP (opsional)" value={visitorPhone} onChange={(e) => setVisitorPhone(e.target.value)} />
          <Input label="Nominal Bayar (Rp)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </div>

        {error && <p className="text-sm text-error mt-3">{error}</p>}

        <Button type="submit" disabled={isSubmitting} className="mt-4">{isSubmitting ? 'Menyimpan...' : 'Catat Kedatangan'}</Button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="neu-flat rounded-xl p-4">
          <p className="text-text-secondary text-sm">Masih di Dalam</p>
          <p className="text-2xl font-bold text-primary">{stillInside.length}</p>
        </div>
        <div className="neu-flat rounded-xl p-4">
          <p className="text-text-secondary text-sm">Total Kunjungan Hari Ini</p>
          <p className="text-2xl font-bold text-text-primary">{visits.length}</p>
        </div>
        <div className="neu-flat rounded-xl p-4">
          <p className="text-text-secondary text-sm">Total Pendapatan Drop-in</p>
          <p className="text-2xl font-bold font-mono text-secondary">Rp{totalRevenue.toLocaleString('id-ID')}</p>
        </div>
      </div>

      {isLoading ? (
        <p className="text-text-secondary">Memuat...</p>
      ) : (
        <>
          {stillInside.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold mb-2 flex items-center gap-2 text-text-primary">
                <UserCheck size={18} className="text-primary" />
                Masih di Dalam ({stillInside.length})
              </h3>
              <div className="flex flex-col gap-2">
                {stillInside.map((visit) => (
                  <div key={visit.id} className="neu-flat rounded-xl p-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-text-primary">{visit.visitorName}</p>
                      <p className="text-sm text-text-secondary font-mono">
                        Masuk {new Date(visit.checkInTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        {' • '}Rp{Number(visit.amount).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <Button variant="secondary" onClick={() => handleCheckout(visit.id)} disabled={checkingOutId === visit.id}>
                      <LogOut size={16} className="inline mr-1" />
                      Checkout
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {alreadyLeft.length > 0 && (
            <div>
              <h3 className="font-bold mb-2 text-text-secondary">Sudah Keluar ({alreadyLeft.length})</h3>
              <div className="flex flex-col gap-2">
                {alreadyLeft.map((visit) => (
                  <div key={visit.id} className="neu-pressed rounded-xl p-4 flex items-center justify-between gap-3 opacity-70">
                    <div>
                      <p className="font-semibold text-text-primary">{visit.visitorName}</p>
                      <p className="text-sm text-text-secondary font-mono">
                        {new Date(visit.checkInTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        {' - '}
                        {new Date(visit.checkOutTime!).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        {' • '}Rp{Number(visit.amount).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {visits.length === 0 && <p className="text-text-secondary">Belum ada kunjungan drop-in hari ini.</p>}
        </>
      )}
    </div>
  );
}