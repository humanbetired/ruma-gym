import { useEffect } from 'react';
import { useLocation} from 'react-router-dom';
import { HeroSection } from '../../components/landing/HeroSection';
import { FacilitiesSection } from '../../components/landing/FacilitiesSection';
import { GallerySection } from '../../components/landing/GallerySection';
import { TrainersSection } from '../../components/landing/TrainersSection';
import { Button } from '../../components/ui/Button';
import { Dumbbell, Users, Clock } from 'lucide-react';

export function LandingPage() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const timer = setTimeout(() => {
        const element = document.getElementById(id);
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.hash]);

  return (
    <div>
      <HeroSection />

      <div className="max-w-350 mx-auto px-5 pt-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="neu-flat rounded-xl p-5 flex items-start gap-3">
            <Dumbbell className="text-primary shrink-0" size={24} />
            <div>
              <h3 className="font-semibold text-text-primary">Peralatan Lengkap</h3>
              <p className="text-sm text-text-secondary">Alat gym modern dan terawat.</p>
            </div>
          </div>
          <div className="neu-flat rounded-xl p-5 flex items-start gap-3">
            <Users className="text-primary shrink-0" size={24} />
            <div>
              <h3 className="font-semibold text-text-primary">Trainer Berpengalaman</h3>
              <p className="text-sm text-text-secondary">Bimbingan personal sesuai targetmu.</p>
            </div>
          </div>
          <div className="neu-flat rounded-xl p-5 flex items-start gap-3">
            <Clock className="text-primary shrink-0" size={24} />
            <div>
              <h3 className="font-semibold text-text-primary">Buka Setiap Hari</h3>
              <p className="text-sm text-text-secondary">Latihan kapan saja sesuai jadwalmu.</p>
            </div>
          </div>
        </div>
      </div>

      <FacilitiesSection />
      <GallerySection />
      <TrainersSection />

      <section className="max-w-350 mx-auto px-5 py-16">
        <div className="neu-flat rounded-2xl p-12 text-center flex flex-col items-center gap-4">
          <h2 className="text-2xl md:text-[28px] font-bold text-text-primary">
            Siap Mulai Perjalanan Fitnessmu?
          </h2>

          <a
            href="https://maps.app.goo.gl/i2zZJFjGA11ogPm1A"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="cta">Datangi Kami!</Button>
          </a>
        </div>
      </section>
    </div>
  );
}