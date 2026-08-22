import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Menu, X, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useScrollSpy } from '../hooks/useScrollSpy';
import { scrollToElement } from '../utils/smoothScroll';


const sectionLinks = [
  { id: 'beranda', label: 'Beranda', detailPath: null },
  { id: 'fasilitas', label: 'Fasilitas', detailPath: '/facilities' },
  { id: 'galeri', label: 'Galeri', detailPath: '/gallery' },
  { id: 'trainer', label: 'Trainer', detailPath: '/trainers' },
];


const sectionIds = sectionLinks.map((section) => section.id);


export function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();


  const isLandingPage = location.pathname === '/';
  const activeSection = useScrollSpy(sectionIds, isLandingPage);


  useEffect(() => {
    if (!isLandingPage) return;
    const hash = location.hash;
    if (!hash) return;
    const sectionId = hash.substring(1);
    const timer = setTimeout(() => {
      scrollToElement(sectionId);
    }, 150);
    return () => clearTimeout(timer);
  }, [isLandingPage, location.hash]);


  function handleLogout() {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  }


  function isSectionActive(link: (typeof sectionLinks)[number]) {
    if (isLandingPage) {
      return activeSection === link.id;
    }
    return link.detailPath !== null && location.pathname.startsWith(link.detailPath);
  }


  function handleSectionClick(e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) {
    e.preventDefault();
    setMobileMenuOpen(false);


    if (isLandingPage) {
      scrollToElement(sectionId);
      window.history.replaceState(null, '', `/#${sectionId}`);
      return;
    }


    navigate(`/#${sectionId}`);
  }


  return (
    <div className="min-h-screen flex flex-col bg-base">
      <header className="bg-base h-20 sticky top-0 z-50 px-5 py-3">
        <div className="max-w-350 mx-auto h-full neu-flat rounded-2xl px-6 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Ruma Gym - Beranda"
          >
            <img src="/logo.png" alt="Ruma Gym" className="h-10 w-auto" />
          </Link>


          <nav className="hidden md:flex items-center gap-2" aria-label="Navigasi utama">
            {sectionLinks.map((link) => {
              const isActive = isSectionActive(link);


              return (
                <a
                  key={link.id}
                  href={`/#${link.id}`}
                  onClick={(e) => handleSectionClick(e, link.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive ? 'neu-pressed text-secondary' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>


          <div className="hidden md:flex items-center gap-3">
            {isLoading ? null : user ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
                >
                  <LayoutDashboard size={16} />
                 
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-text-secondary hover:text-error transition-colors text-sm font-medium"
                >
                  <LogOut size={16} />
                  
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium">
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="neu-flat-sm px-4 py-2.5 rounded-lg text-secondary text-sm font-semibold hover:brightness-110 transition-all active:scale-[0.98]"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>


          <button
            type="button"
            className="md:hidden text-text-primary"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>


        {mobileMenuOpen && (
          <nav
            id="mobile-navigation"
            className="md:hidden max-w-350 mx-auto mt-2 neu-flat rounded-2xl px-5 py-4 flex flex-col gap-2"
            aria-label="Navigasi mobile"
          >
            {sectionLinks.map((link) => {
              const isActive = isSectionActive(link);


              return (
                <a
                  key={link.id}
                  href={`/#${link.id}`}
                  onClick={(e) => handleSectionClick(e, link.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive ? 'neu-pressed text-secondary' : 'text-text-secondary'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}


            <div className="border-t border-border pt-3 mt-1 flex flex-col gap-2">
              {isLoading ? null : user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-text-secondary text-sm"
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 text-left text-text-secondary text-sm"
                  >
                    <LogOut size={16} />
                    Keluar
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-text-secondary text-sm">
                    Masuk
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-secondary text-sm font-semibold">
                    Daftar
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </header>


      <main className="flex-1">
        <Outlet />
      </main>


      <footer className="bg-base py-10 px-5">
        <div className="max-w-350 mx-auto neu-flat-sm rounded-xl py-6 text-center text-sm text-text-secondary">
          © 2026 Ruma Gym. Semua hak dilindungi.
        </div>
      </footer>
    </div>
  );
}
