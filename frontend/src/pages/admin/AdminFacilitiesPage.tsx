import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { getFacilitiesAdmin, createFacility, updateFacility, deleteFacility, restoreFacility } from '../../api/content';
import type { Facility } from '../../types/content';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Pencil, EyeOff, Eye } from 'lucide-react';

export function AdminFacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadFacilities();
  }, []);

  async function loadFacilities() {
    setIsLoading(true);
    try {
      const data = await getFacilitiesAdmin();
      setFacilities(data);
    } finally {
      setIsLoading(false);
    }
  }

  function startEdit(facility: Facility) {
    setEditingId(facility.id);
    setName(facility.name);
    setDescription(facility.description || '');
  }

  function cancelEdit() {
    setEditingId(null);
    setName('');
    setDescription('');
    setError('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (editingId) {
        await updateFacility(editingId, { name, description: description || undefined });
      } else {
        await createFacility({ name, description: description || undefined });
      }
      cancelEdit();
      await loadFacilities();
    } catch {
      setError('Gagal menyimpan fasilitas.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleActive(facility: Facility) {
    try {
      if (facility.isActive) {
        await deleteFacility(facility.id);
      } else {
        await restoreFacility(facility.id);
      }
      await loadFacilities();
    } catch {
      alert('Gagal mengubah status fasilitas.');
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6 text-text-primary">Kelola Fasilitas</h1>

      <form onSubmit={handleSubmit} className="neu-flat rounded-xl p-5 mb-6">
        <h2 className="font-bold mb-4 text-text-primary">{editingId ? 'Edit Fasilitas' : 'Tambah Fasilitas'}</h2>
        <div className="flex flex-col gap-3">
          <Input label="Nama" value={name} onChange={(e) => setName(e.target.value)} required />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">Deskripsi (opsional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="neu-pressed w-full px-4 py-3 rounded-xl border-none text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {error && <p className="text-sm text-error">{error}</p>}

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Menyimpan...' : editingId ? 'Update' : 'Tambah'}</Button>
            {editingId && <Button type="button" variant="secondary" onClick={cancelEdit}>Batal</Button>}
          </div>
        </div>
      </form>

      {isLoading ? (
        <p className="text-text-secondary">Memuat...</p>
      ) : (
        <div className="flex flex-col gap-2">
          {facilities.map((facility) => (
            <div key={facility.id} className={`neu-flat rounded-xl p-4 flex items-center justify-between gap-3 ${!facility.isActive ? 'opacity-50' : ''}`}>
              <div className="min-w-0">
                <p className="font-semibold text-text-primary">{facility.name}</p>
                {facility.description && <p className="text-sm text-text-secondary truncate">{facility.description}</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => startEdit(facility)} className="p-2 rounded-lg neu-flat-sm text-primary hover:brightness-110" aria-label="Edit">
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleToggleActive(facility)}
                  className="p-2 rounded-lg neu-flat-sm text-neutral hover:brightness-110"
                  aria-label={facility.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                >
                  {facility.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}