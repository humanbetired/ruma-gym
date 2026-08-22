import { useEffect, useState } from 'react';
import { getPendingBookings, approveBooking, rejectBooking } from '../../api/bookings';
import type { PtBooking } from '../../types/trainer';
import { Button } from '../../components/ui/Button';

export function BookingApprovalPage() {
  const [bookings, setBookings] = useState<PtBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    setIsLoading(true);
    try {
      const data = await getPendingBookings();
      setBookings(data);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleApprove(id: string) {
    setProcessingId(id);
    try {
      await approveBooking(id);
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal approve booking.');
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(id: string) {
    setProcessingId(id);
    try {
      await rejectBooking(id);
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal reject booking.');
    } finally {
      setProcessingId(null);
    }
  }

  if (isLoading) return <p className="text-text-secondary">Memuat...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-text-primary">Approval Booking PT</h1>

      {bookings.length === 0 ? (
        <p className="text-text-secondary">Tidak ada booking yang menunggu persetujuan.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="neu-flat rounded-xl p-5">
              <div className="flex flex-col gap-1 mb-3">
                <p className="font-bold text-text-primary">{booking.member?.fullName}</p>
                <p className="text-sm text-text-secondary">{booking.member?.email}</p>
              </div>

              <div className="text-sm text-text-secondary neu-pressed rounded-lg p-3 flex flex-col gap-1">
                <p><span className="font-semibold text-text-primary">Trainer:</span> {booking.trainer?.user?.fullName}</p>
                {booking.schedule && (
                  <p>
                    <span className="font-semibold text-text-primary">Jadwal:</span>{' '}
                    {new Date(booking.schedule.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                    {' • '}
                    {new Date(booking.schedule.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
                {booking.notes && <p className="italic">"{booking.notes}"</p>}
              </div>

              <div className="flex gap-2 mt-4">
                <Button onClick={() => handleApprove(booking.id)} disabled={processingId === booking.id} className="flex-1">
                  Approve
                </Button>
                <Button onClick={() => handleReject(booking.id)} disabled={processingId === booking.id} variant="secondary" className="flex-1">
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}