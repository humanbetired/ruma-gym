import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyBookings } from '../../api/bookings';
import type { PtBooking } from '../../types/trainer';
import { Button } from '../../components/ui/Button';

const statusStyle: Record<PtBooking['status'], string> = {
  PENDING: 'text-warning',
  APPROVED: 'text-success',
  REJECTED: 'text-error',
  COMPLETED: 'text-primary',
};

const statusLabel: Record<PtBooking['status'], string> = {
  PENDING: 'Menunggu Konfirmasi',
  APPROVED: 'Terkonfirmasi',
  REJECTED: 'Ditolak',
  COMPLETED: 'Selesai',
};

export function MyBookingsPage() {
  const [bookings, setBookings] = useState<PtBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMyBookings()
      .then(setBookings)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Booking Saya</h1>
        <Link to="/dashboard/bookings/new">
          <Button>Booking Baru</Button>
        </Link>
      </div>

      {isLoading ? (
        <p className="text-text-secondary">Memuat...</p>
      ) : bookings.length === 0 ? (
        <p className="text-text-secondary">Belum ada booking sesi PT.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {bookings.map((booking) => (
            <div key={booking.id} className="neu-flat rounded-xl p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-text-primary">{booking.trainer?.user?.fullName}</p>
                  {booking.schedule && (
                    <p className="text-sm text-text-secondary mt-1">
                      {new Date(booking.schedule.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                      {' • '}
                      {new Date(booking.schedule.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                  {booking.notes && <p className="text-sm text-text-secondary mt-1 italic">"{booking.notes}"</p>}
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg neu-pressed shrink-0 ${statusStyle[booking.status]}`}>
                  {statusLabel[booking.status]}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}