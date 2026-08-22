import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTrainerBookings } from '../../api/bookings';
import { getMySchedules } from '../../api/trainers';
import type { PtBooking, TrainerSchedule } from '../../types/trainer';
import { AlertCircle, Calendar } from 'lucide-react';

export function TrainerDashboardHome() {
  const [bookings, setBookings] = useState<PtBooking[]>([]);
  const [schedules, setSchedules] = useState<TrainerSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([getTrainerBookings(), getMySchedules()])
      .then(([bookingsData, schedulesData]) => {
        setBookings(bookingsData);
        setSchedules(schedulesData);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <p className="text-text-secondary">Memuat...</p>;

  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;

  const now = new Date();
  const weekFromNow = new Date();
  weekFromNow.setDate(weekFromNow.getDate() + 7);

  const thisWeekSchedules = schedules.filter((s) => {
    const scheduleDate = new Date(s.date);
    return scheduleDate >= now && scheduleDate <= weekFromNow;
  });
  const bookedThisWeek = thisWeekSchedules.filter((s) => s.isBooked).length;
  const emptyThisWeek = thisWeekSchedules.length - bookedThisWeek;

  const upcomingApproved = bookings
    .filter((b) => b.status === 'APPROVED' && b.schedule && new Date(b.schedule.startTime) >= now)
    .sort((a, b) => new Date(a.schedule!.startTime).getTime() - new Date(b.schedule!.startTime).getTime())[0];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-text-primary">Beranda</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="neu-flat rounded-xl p-5">
          <p className="text-text-secondary text-sm">Booking Pending</p>
          <p className="text-3xl font-bold text-warning mt-1">{pendingCount}</p>
        </div>
        <div className="neu-flat rounded-xl p-5">
          <p className="text-text-secondary text-sm">Terisi Minggu Ini</p>
          <p className="text-3xl font-bold text-primary mt-1">{bookedThisWeek}</p>
        </div>
        <div className="neu-flat rounded-xl p-5">
          <p className="text-text-secondary text-sm">Slot Kosong Minggu Ini</p>
          <p className="text-3xl font-bold text-success mt-1">{emptyThisWeek}</p>
        </div>
      </div>

      {pendingCount > 0 && (
        <Link to="/dashboard/trainer-bookings" className="flex items-center gap-3 neu-pressed rounded-xl p-4 mb-6">
          <AlertCircle size={20} className="text-warning shrink-0" />
          <p className="text-sm text-text-secondary">
            Ada <strong className="text-text-primary">{pendingCount} booking</strong> yang menunggu konfirmasi admin.
          </p>
        </Link>
      )}

      <div className="neu-flat rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={18} className="text-primary" />
          <h2 className="font-bold text-text-primary">Jadwal Terdekat</h2>
        </div>
        {upcomingApproved && upcomingApproved.schedule ? (
          <div>
            <p className="font-semibold text-text-primary">{upcomingApproved.member?.fullName}</p>
            <p className="text-sm text-text-secondary font-mono mt-1">
              {new Date(upcomingApproved.schedule.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
              {' • '}
              {new Date(upcomingApproved.schedule.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        ) : (
          <p className="text-text-secondary text-sm">Belum ada jadwal terkonfirmasi mendatang.</p>
        )}
      </div>
    </div>
  );
}