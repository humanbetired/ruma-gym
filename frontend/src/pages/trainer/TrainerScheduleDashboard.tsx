import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { getMySchedules, createSchedule, deleteSchedule } from '../../api/trainers';
import type { TrainerSchedule } from '../../types/trainer';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Trash2 } from 'lucide-react';
import { useConfirm } from '../../context/ConfirmContext';
import axios from 'axios';

export function TrainerScheduleDashboard() {
  const confirm = useConfirm();
  const [schedules, setSchedules] = useState<TrainerSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    loadSchedules();
  }, []);

  async function loadSchedules() {
    setIsLoading(true);
    try {
      const data = await getMySchedules();
      setSchedules(data);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddSchedule(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!date || !startTime || !endTime) return;

    setIsSubmitting(true);
    try {
      await createSchedule({
        date: new Date(date).toISOString(),
        startTime: new Date(`${date}T${startTime}`).toISOString(),
        endTime: new Date(`${date}T${endTime}`).toISOString(),
      });
      setDate('');
      setStartTime('');
      setEndTime('');
      await loadSchedules();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Gagal menambah jadwal.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(scheduleId: string) {
    const ok = await confirm({
      title: 'Hapus Jadwal',
      message: 'Yakin ingin menghapus slot jadwal ini? Tindakan ini tidak bisa dibatalkan.',
      confirmLabel: 'Hapus',
      variant: 'danger',
    });
    if (!ok) return;

    try {
      await deleteSchedule(scheduleId);
      setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert('Gagal menghapus jadwal.');
      }
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 text-text-primary">Jadwal Saya</h1>

      <form onSubmit={handleAddSchedule} className="neu-flat rounded-xl p-5 mb-6">
        <h2 className="font-bold mb-4 text-text-primary">Tambah Slot Jadwal</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input type="date" label="Tanggal" value={date} onChange={(e) => setDate(e.target.value)} required />
          <Input type="time" label="Mulai" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
          <Input type="time" label="Selesai" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
        </div>

        {error && <p className="text-sm text-error mt-3">{error}</p>}

        <Button type="submit" disabled={isSubmitting} className="mt-4">
          {isSubmitting ? 'Menambahkan...' : 'Tambah Jadwal'}
        </Button>
      </form>

      <h2 className="font-bold mb-3 text-text-primary">Daftar Jadwal</h2>
      {isLoading ? (
        <p className="text-text-secondary">Memuat...</p>
      ) : schedules.length === 0 ? (
        <p className="text-text-secondary">Belum ada jadwal ditambahkan.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="neu-flat rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-text-primary">
                  {new Date(schedule.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
                <p className="text-sm text-text-secondary font-mono">
                  {new Date(schedule.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  {' - '}
                  {new Date(schedule.endTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg neu-pressed ${schedule.isBooked ? 'text-primary' : 'text-success'}`}>
                  {schedule.isBooked ? 'Terisi' : 'Kosong'}
                </span>
                {!schedule.isBooked && (
                  <button
                    onClick={() => handleDelete(schedule.id)}
                    className="text-error hover:brightness-125 p-1.5 rounded-lg neu-flat-sm transition-all"
                    aria-label="Hapus jadwal"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}