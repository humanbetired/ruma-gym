import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

interface MenuItem {
  label: string;
  to: string;
}

const menuByRole: Record<string, MenuItem[]> = {
  MEMBER: [
    { label: 'Beranda', to: '/dashboard' },
    { label: 'Check-in', to: '/dashboard/check-in' },
    { label: 'Membership', to: '/dashboard/membership' },
    { label: 'Booking PT', to: '/dashboard/bookings' },
    { label: 'Notifikasi', to: '/dashboard/notifications' },
    { label: 'Kartu Anggota', to: '/dashboard/kta' },
  ],

  PERSONAL_TRAINER: [
    { label: 'Beranda', to: '/dashboard' },
    { label: 'Jadwal Saya', to: '/dashboard/schedule' },
    { label: 'Profil', to: '/dashboard/profile' },
    { label: 'Booking Masuk', to: '/dashboard/trainer-bookings' },
  ],

  ADMIN: [
    { label: 'Beranda', to: '/dashboard' },
    { label: 'Analytics', to: '/dashboard/analytics' },
    { label: 'Pembayaran', to: '/dashboard/payments' },
    { label: 'Trainer', to: '/dashboard/trainers' },
    { label: 'Booking', to: '/dashboard/bookings-approval' },
    { label: 'Galeri', to: '/dashboard/content/gallery' },
    { label: 'Live Check-in', to: '/dashboard/check-in-feed' },
    { label: 'Fasilitas', to: '/dashboard/content/facilities' },
    { label: 'Kelola User', to: '/dashboard/users' },
    { label: 'Paket Membership', to: '/dashboard/membership-plans' },
    { label: 'Drop-in Visitor', to: '/dashboard/drop-in' },
    { label: 'Kasir Warung', to: '/dashboard/warung/cashier' },
    { label: 'Riwayat Warung', to: '/dashboard/warung/history' },
    { label: 'Laporan Keuangan', to: '/dashboard/financial-report' },
  ],

  OWNER: [
    { label: 'Beranda', to: '/dashboard' },
    { label: 'Analytics', to: '/dashboard/analytics' },
    { label: 'Pembayaran', to: '/dashboard/payments' },
    { label: 'Trainer', to: '/dashboard/trainers' },
    { label: 'Booking', to: '/dashboard/bookings-approval' },
    { label: 'Galeri', to: '/dashboard/content/gallery' },
    { label: 'Live Check-in', to: '/dashboard/check-in-feed' },
    { label: 'Fasilitas', to: '/dashboard/content/facilities' },
    { label: 'Kelola User', to: '/dashboard/users' },
    { label: 'Paket Membership', to: '/dashboard/membership-plans' },
    { label: 'Drop-in Visitor', to: '/dashboard/drop-in' },
    { label: 'Kelola Warung', to: '/dashboard/warung/products' },
    { label: 'Kasir Warung', to: '/dashboard/warung/cashier' },
    { label: 'Riwayat Warung', to: '/dashboard/warung/history' },
    { label: 'Laporan Keuangan', to: '/dashboard/financial-report' },
  ],
};

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = user ? menuByRole[user.role] || [] : [];

  function handleLogout() {
    logout();
    navigate('/login');
  }

    function isMenuActive(to: string) {
    if (to === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(to);
  }

  return (
  <div className="min-h-screen flex flex-col md:flex-row bg-base">
    <aside className="w-full md:w-64 md:min-h-screen flex flex-col md:p-4 md:gap-4">
      <div className="hidden md:block neu-flat rounded-2xl p-5">
        <Link to="/" className="text-lg font-bold text-secondary flex items-center justify-center">
          <img src="/logo.png" alt="Ruma Gym" className="h-10 w-auto" />
        </Link>
      </div>

      <div className="md:hidden flex justify-center p-3">
        <Link to="/" className="flex items-center justify-center">
          <img
            src="/logo.png"
            alt="Ruma Gym"
            className="h-12 w-auto"
          />
        </Link>
      </div>

        <nav className="flex-1 flex flex-row md:flex-col overflow-x-auto md:overflow-visible p-3 md:p-0 gap-2">
          {menuItems.map((item) => {
            const isActive = isMenuActive(item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap text-sm font-medium active:scale-[0.98] ${
                  isActive
                    ? 'neu-pressed text-secondary'
                    : 'neu-flat-sm text-text-secondary hover:text-text-primary hover:brightness-110'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

      <div className="md:hidden px-3 pb-3">
        <button
          onClick={handleLogout}
          className="neu-flat-sm flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl hover:brightness-110 transition-all w-full text-sm font-medium text-error active:scale-[0.98]"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>

      <div className="hidden md:block p-1">
        <button
          onClick={handleLogout}
          className="neu-flat flex items-center gap-2 px-4 py-2.5 rounded-xl hover:brightness-110 transition-all w-full text-left text-sm font-medium text-error active:scale-[0.98]"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>

    <main className="flex-1 p-4 md:p-8">
      <Outlet />
    </main>
  </div>
);
}