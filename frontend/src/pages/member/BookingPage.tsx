import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getTrainers, getTrainerSchedules } from '../../api/trainers';
import { createBooking } from '../../api/bookings';
import type { TrainerProfile, TrainerSchedule } from '../../types/trainer';
import { Button } from '../../components/ui/Button';
import axios from 'axios';

export function BookingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const preselectedTrainerId = (location.state as { trainerId?: string } | null)?.trainerId;

  const [trainers, setTrainers] = useState<TrainerProfile[]>([]);
  const [selectedTrainerId, setSelectedTrainerId] = useState<string | null>(preselectedTrainerId || null);
  const [schedules, setSchedules] = useState<TrainerSchedule[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);

  useEffect(() => {
    getTrainers().then(setTrainers);
  }, []);

  useEffect(() => {
    if (!selectedTrainerId) {
      setSchedules([]);
      return;
    }

    setIsLoadingSchedules(true);
    setSelectedScheduleId(null);
    getTrainerSchedules(selectedTrainerId)
      .then(setSchedules)
      .finally(() => setIsLoadingSchedules(false));
  }, [selectedTrainerId]);

  async function handleConfirmBooking() {
    if (!selectedScheduleId) return;

    setError('');
    setIsSubmitting(true);
    try {
      await createBooking({ scheduleId: selectedScheduleId, notes: notes || undefined });
      navigate('/dashboard/bookings');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Gagal membuat booking.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 text-text-primary">Booking Sesi PT</h1>

      <div className="neu-flat rounded-xl p-6 flex flex-col gap-6">
        <div>
          <label className="text-sm font-medium text-text-secondary block mb-2">Pilih Trainer</label>
          <select
            value={selectedTrainerId || ''}
            onChange={(e) => setSelectedTrainerId(e.target.value || null)}
            className="neu-pressed w-full h-12 px-4 rounded-xl border-none text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Pilih Trainer</option>
            {trainers.map((trainer) => (
              <option key={trainer.id} value={trainer.id}>
                {trainer.user?.fullName} {trainer.specialty ? `: ${trainer.specialty}` : ''}
              </option>
            ))}
          </select>
        </div>

        {selectedTrainerId && (
          <div>
            <label className="text-sm font-medium text-text-secondary block mb-2">Pilih Jadwal</label>
            {isLoadingSchedules ? (
              <p className="text-text-secondary text-sm">Memuat jadwal...</p>
              ) : schedules.length === 0 ? (
                <p className="text-text-secondary text-sm">
                  Tidak ada jadwal tersedia untuk trainer ini dalam masa membership kamu saat ini.
                </p>
              ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {schedules.map((schedule) => (
                  <button
                    key={schedule.id}
                    onClick={() => setSelectedScheduleId(schedule.id)}
                    className={`text-left rounded-xl p-3 transition-all ${
                      selectedScheduleId === schedule.id ? 'neu-pressed' : 'neu-flat-sm hover:brightness-105'
                    }`}
                  >
                    <p className={`font-semibold text-sm ${selectedScheduleId === schedule.id ? 'text-secondary' : 'text-text-primary'}`}>
                      {new Date(schedule.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </p>
                    <p className="text-sm text-text-secondary font-mono">
                      {new Date(schedule.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      {' - '}
                      {new Date(schedule.endTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedScheduleId && (
          <div>
            <label className="text-sm font-medium text-text-secondary block mb-2">Catatan (opsional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Misal: fokus latihan kaki"
              className="neu-pressed w-full px-4 py-3 rounded-xl border-none text-text-primary placeholder:text-neutral focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        )}

        {error && <p className="text-sm text-error">{error}</p>}

        <Button onClick={handleConfirmBooking} disabled={!selectedScheduleId || isSubmitting}>
          {isSubmitting ? 'Memproses...' : 'Konfirmasi Booking'}
        </Button>
      </div>
    </div>
  );
}