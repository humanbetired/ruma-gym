import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { getMembershipPlansAdmin, createMembershipPlan, updateMembershipPlan } from '../../api/memberships';
import type { MembershipPlan } from '../../types/membership';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Pencil, EyeOff, Eye } from 'lucide-react';
import axios from 'axios';

export function AdminMembershipPlansPage() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [price, setPrice] = useState('');
  const [ptSessionQuota, setPtSessionQuota] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  async function loadPlans() {
    setIsLoading(true);
    try {
      const data = await getMembershipPlansAdmin();
      setPlans(data);
    } finally {
      setIsLoading(false);
    }
  }

  function startEdit(plan: MembershipPlan) {
    setEditingId(plan.id);
    setName(plan.name);
    setDurationDays(String(plan.durationDays));
    setPrice(String(plan.price).replace(/\D/g, ''));
    setPtSessionQuota(String(plan.ptSessionQuota));
  }

  function formatRupiah(value: string) {
  const number = value.replace(/\D/g, '');
  return number ? Number(number).toLocaleString('id-ID') : '';
  }

  function cancelEdit() {
    setEditingId(null);
    setName('');
    setDurationDays('');
    setPrice('');
    setPtSessionQuota('');
    setError('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const payload = {
      name,
      durationDays: Number(durationDays),
      price: Number(price),
      ptSessionQuota: ptSessionQuota ? Number(ptSessionQuota) : 0,
    };

    try {
      if (editingId) {
        await updateMembershipPlan(editingId, payload);
      } else {
        await createMembershipPlan(payload);
      }
      cancelEdit();
      await loadPlans();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        const msg = err.response.data.message;
        setError(Array.isArray(msg) ? msg[0] : msg);
      } else {
        setError('Gagal menyimpan paket.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleActive(plan: MembershipPlan) {
    try {
      await updateMembershipPlan(plan.id, { isActive: !plan.isActive });
      await loadPlans();
    } catch {
      alert('Gagal mengubah status paket.');
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6 text-text-primary">Kelola Paket Membership</h1>

      <form onSubmit={handleSubmit} className="neu-flat rounded-xl p-5 mb-6">
        <h2 className="font-bold mb-4 text-text-primary">{editingId ? 'Edit Paket' : 'Tambah Paket'}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="Nama Paket" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Durasi (hari)" type="number" value={durationDays} onChange={(e) => setDurationDays(e.target.value)} required />
          <Input
            label="Harga (Rp)"
            type="text"
            inputMode="numeric"
            value={formatRupiah(price)}
            onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))}
            required
          />
          <Input label="Kuota Sesi PT" type="number" value={ptSessionQuota} onChange={(e) => setPtSessionQuota(e.target.value)} placeholder="0" />
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
          {plans.map((plan) => (
            <div key={plan.id} className={`neu-flat rounded-xl p-4 flex items-center justify-between gap-3 ${!plan.isActive ? 'opacity-50' : ''}`}>
              <div className="min-w-0">
                <p className="font-semibold text-text-primary">{plan.name}</p>
                <p className="text-sm text-text-secondary font-mono">
                  Rp{Number(plan.price).toLocaleString('id-ID')} • {plan.durationDays} hari
                  {plan.ptSessionQuota > 0 && ` • ${plan.ptSessionQuota}x PT`}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => startEdit(plan)} className="p-2 rounded-lg neu-flat-sm text-primary hover:brightness-110" aria-label="Edit">
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleToggleActive(plan)}
                  className="p-2 rounded-lg neu-flat-sm text-neutral hover:brightness-110"
                  aria-label={plan.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                >
                  {plan.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}