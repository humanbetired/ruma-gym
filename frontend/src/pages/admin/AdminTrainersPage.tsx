import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { getTrainers, createTrainerProfile, updateTrainerProfileAdmin } from '../../api/trainers';
import { getUsersByRole } from '../../api/users';
import type { UserBasic } from '../../api/users';
import type { TrainerProfile } from '../../types/trainer';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Pencil, User } from 'lucide-react';
import axios from 'axios';

export function AdminTrainersPage() {
  const [trainers, setTrainers] = useState<TrainerProfile[]>([]);
  const [candidateUsers, setCandidateUsers] = useState<UserBasic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [bio, setBio] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const [trainersData, usersResult] = await Promise.all([getTrainers(), getUsersByRole('PERSONAL_TRAINER')]);
      setTrainers(trainersData);
      const trainerUserIds = new Set(trainersData.map((t) => t.userId));
      setCandidateUsers(usersResult.data.filter((u) => !trainerUserIds.has(u.id)));
    } finally {
      setIsLoading(false);
    }
  }

  function startEdit(trainer: TrainerProfile) {
    setEditingId(trainer.id);
    setBio(trainer.bio || '');
    setSpecialty(trainer.specialty || '');
  }

  function cancelEdit() {
    setEditingId(null);
    setSelectedUserId('');
    setBio('');
    setSpecialty('');
    setError('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (editingId) {
        await updateTrainerProfileAdmin(editingId, { bio: bio || undefined, specialty: specialty || undefined });
      } else {
        if (!selectedUserId) {
          setError('Pilih user terlebih dahulu.');
          setIsSubmitting(false);
          return;
        }
        await createTrainerProfile({ userId: selectedUserId, bio: bio || undefined, specialty: specialty || undefined });
      }
      cancelEdit();
      await loadData();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Gagal menyimpan profil trainer.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6 text-text-primary">Kelola Trainer</h1>

      <form onSubmit={handleSubmit} className="neu-flat rounded-xl p-5 mb-6">
        <h2 className="font-bold mb-4 text-text-primary">{editingId ? 'Edit Profil Trainer' : 'Buat Profil Trainer Baru'}</h2>

        <div className="flex flex-col gap-3">
          {!editingId && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-secondary">Pilih User (role PERSONAL_TRAINER)</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="neu-pressed w-full h-12 px-4 rounded-xl border-none text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Pilih Calon Trainer</option>
                {candidateUsers.map((user) => (
                  <option key={user.id} value={user.id}>{user.fullName} ({user.email})</option>
                ))}
              </select>
              {candidateUsers.length === 0 && (
                <p className="text-xs text-text-secondary">
                  Semua user dengan role PERSONAL_TRAINER sudah punya profil, atau belum ada user dengan role tersebut.
                </p>
              )}
            </div>
          )}

          <Input label="Spesialisasi (opsional)" value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="misal: Powerlifting, Yoga" />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">Bio (opsional)</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="neu-pressed w-full px-4 py-3 rounded-xl border-none text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {error && <p className="text-sm text-error">{error}</p>}

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Menyimpan...' : editingId ? 'Update' : 'Buat Profil'}</Button>
            {editingId && <Button type="button" variant="secondary" onClick={cancelEdit}>Batal</Button>}
          </div>
        </div>
      </form>

      {isLoading ? (
        <p className="text-text-secondary">Memuat...</p>
      ) : (
        <div className="flex flex-col gap-2">
          {trainers.map((trainer) => (
            <div key={trainer.id} className="neu-flat rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full neu-pressed flex items-center justify-center shrink-0">
                <User size={18} className="text-neutral" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-text-primary">{trainer.user?.fullName}</p>
                {trainer.specialty && <p className="text-sm text-secondary">{trainer.specialty}</p>}
              </div>
              <button onClick={() => startEdit(trainer)} className="p-2 rounded-lg neu-flat-sm text-primary hover:brightness-110 shrink-0" aria-label="Edit">
                <Pencil size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}