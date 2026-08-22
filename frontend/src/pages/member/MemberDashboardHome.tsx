import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyMemberships } from '../../api/memberships';
import { getMyConfirmedSchedule } from '../../api/bookings';
import type { Membership } from '../../types/membership';
import type { PtBooking } from '../../types/trainer';
import { Button } from '../../components/ui/Button';
import { QrCode, Calendar, Dumbbell } from 'lucide-react';

export function MemberDashboardHome() {
  const [activeMembership, setActiveMembership] = useState<Membership | null>(null);
  const [upcomingBooking, setUpcomingBooking] = useState<PtBooking | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyMemberships(), getMyConfirmedSchedule(new Date())])
      .then(([memberships, bookings]) => {
        const active = memberships.find((m) => m.status === 'ACTIVE');
        setActiveMembership(active || null);
        setUpcomingBooking(bookings[0] || null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <p className="text-text-secondary">Memuat...</p>;
  }

  const daysRemaining = activeMembership?.endDate
    ? Math.max(0, Math.ceil((new Date(activeMembership.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-text-primary">Beranda</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="neu-flat rounded-xl p-5">
          {activeMembership ? (
            <>
              <p className="text-text-secondary text-sm">Membership Aktif</p>
              <p className="text-xl font-bold mt-1 text-text-primary">{activeMembership.plan.name}</p>
              <div className="flex gap-6 mt-3">
                <div>
                  <p className="text-text-secondary text-xs">Sisa Hari</p>
                  <p className="font-bold font-mono text-secondary">{daysRemaining}</p>
                </div>
                <div>
                  <p className="text-text-secondary text-xs">Sisa Sesi PT</p>
                  <p className="font-bold font-mono text-primary">{activeMembership.ptSessionsRemaining}</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-text-secondary text-sm">Belum Punya Membership Aktif</p>
              <Link to="/dashboard/membership">
                <Button variant="cta" className="mt-3">Daftar Sekarang</Button>
              </Link>
            </>
          )}
        </div>

        <div className="neu-flat rounded-xl p-5">
          <p className="text-text-secondary text-sm mb-1">Booking PT Terdekat</p>
          {upcomingBooking && upcomingBooking.schedule ? (
            <>
              <p className="font-bold text-text-primary">{upcomingBooking.trainer?.user?.fullName}</p>
              <p className="text-sm text-text-secondary font-mono mt-1">
                {new Date(upcomingBooking.schedule.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                {' • '}
                {new Date(upcomingBooking.schedule.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </>
          ) : (
            <p className="text-text-secondary text-sm">Belum ada booking mendatang.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/dashboard/check-in" className="neu-flat rounded-xl p-5 flex flex-col items-center gap-2 hover:brightness-105 transition-all">
          <QrCode size={26} className="text-primary" />
          <span className="font-medium text-sm text-text-primary">Check-in</span>
        </Link>
        <Link to="/dashboard/bookings/new" className="neu-flat rounded-xl p-5 flex flex-col items-center gap-2 hover:brightness-105 transition-all">
          <Calendar size={26} className="text-primary" />
          <span className="font-medium text-sm text-text-primary">Booking PT</span>
        </Link>
        <Link to="/dashboard/membership" className="neu-flat rounded-xl p-5 flex flex-col items-center gap-2 hover:brightness-105 transition-all">
          <Dumbbell size={26} className="text-primary" />
          <span className="font-medium text-sm text-text-primary">Membership</span>
        </Link>
      </div>
    </div>
  );
}