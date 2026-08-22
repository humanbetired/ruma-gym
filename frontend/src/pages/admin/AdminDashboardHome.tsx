import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPendingPayments } from '../../api/payments';
import { getPendingBookings } from '../../api/bookings';
import { getDailyVisits } from '../../api/analytics';
import { CreditCard, Calendar, Users } from 'lucide-react';

export function AdminDashboardHome() {
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0);
  const [pendingBookingsCount, setPendingBookingsCount] = useState(0);
  const [todayVisits, setTodayVisits] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPendingPayments(), getPendingBookings(), getDailyVisits(1)])
      .then(([payments, bookings, visits]) => {
        setPendingPaymentsCount(payments.length);
        setPendingBookingsCount(bookings.length);
        setTodayVisits(visits[0]?.count || 0);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <p className="text-text-secondary">Memuat...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-text-primary">Beranda</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Link to="/dashboard/payments" className="neu-flat rounded-xl p-5 hover:brightness-105 transition-all">
          <div className="flex items-center justify-between mb-2">
            <CreditCard size={22} className="text-primary" />
            {pendingPaymentsCount > 0 && <span className="w-2 h-2 rounded-full bg-error" />}
          </div>
          <p className="text-3xl font-bold text-text-primary">{pendingPaymentsCount}</p>
          <p className="text-text-secondary text-sm">Pembayaran Pending</p>
        </Link>

        <Link to="/dashboard/bookings-approval" className="neu-flat rounded-xl p-5 hover:brightness-105 transition-all">
          <div className="flex items-center justify-between mb-2">
            <Calendar size={22} className="text-primary" />
            {pendingBookingsCount > 0 && <span className="w-2 h-2 rounded-full bg-error" />}
          </div>
          <p className="text-3xl font-bold text-text-primary">{pendingBookingsCount}</p>
          <p className="text-text-secondary text-sm">Booking Pending</p>
        </Link>

        <Link to="/dashboard/check-in-feed" className="neu-flat rounded-xl p-5 hover:brightness-105 transition-all">
          <div className="flex items-center justify-between mb-2">
            <Users size={22} className="text-primary" />
          </div>
          <p className="text-3xl font-bold text-text-primary">{todayVisits}</p>
          <p className="text-text-secondary text-sm">Kunjungan Hari Ini</p>
        </Link>
      </div>

      <Link to="/dashboard/analytics" className="block neu-flat rounded-xl p-5 hover:brightness-105 transition-all">
        <p className="font-bold text-secondary">Lihat Analytics Lengkap</p>
        <p className="text-text-secondary text-sm mt-1">Grafik kunjungan, jam ramai, dan pertumbuhan member.</p>
      </Link>
    </div>
  );
}