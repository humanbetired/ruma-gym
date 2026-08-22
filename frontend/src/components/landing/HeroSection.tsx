import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

export function HeroSection() {
  return (
    <section id="beranda" className="scroll-mt-24">
      <div className="max-w-350 mx-auto px-5 py-16 md:py-24">
        <div className="neu-flat rounded-3xl overflow-hidden flex flex-col md:flex-row min-h-125">

          {/* Panel kiri */}
          <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center items-start">
            <h1 className="text-[32px] md:text-[40px] font-bold max-w-2xl leading-tight text-text-primary">
              Bentuk Tubuh Impianmu di{' '}
              <span className="text-secondary">RUMA GYM</span>
            </h1>

            <p className="text-text-secondary max-w-xl text-lg mt-5">
              Fasilitas lengkap, personal trainer berpengalaman, dan komunitas
              yang mendukung perjalanan fitnessmu.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Link to="/register">
                <Button variant="cta">Daftar Sekarang</Button>
              </Link>
            </div>
          </div>

          {/* Panel kanan */}
          <div className="w-full md:w-1/2 min-h-75 md:min-h-auto">
            <img
              src="/gym-hero.jpeg"
              alt="Ganesha Gym"
              className="w-full h-full object-cover"
            />
          </div>

        </div>
      </div>
    </section>
  );
}