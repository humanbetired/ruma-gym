import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTrainerById, getTrainerSchedules } from '../../api/trainers';
import type { TrainerProfile, TrainerSchedule } from '../../types/trainer';
import { useAuth } from '../../context/AuthContext';
import { User, MessageCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

function TikTokIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 8h3V4h-3c-3.31 0-5 1.69-5 5v3H6v4h3v8h4v-8h3l1-4h-4V9c0-.67.33-1 1-1z" />
    </svg>
  );
}

export function TrainerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [trainer, setTrainer] = useState<TrainerProfile | null>(null);
  const [schedules, setSchedules] = useState<TrainerSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id || isAuthLoading) return;

    async function loadData() {
      try {
        const trainerData = await getTrainerById(id!);
        setTrainer(trainerData);

        if (user) {
          const scheduleData = await getTrainerSchedules(id!);
          setSchedules(scheduleData);
        } else {
          setSchedules([]);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [id, user, isAuthLoading]);

  if (isLoading) {
    return (
      <div className="max-w-350 mx-auto px-5 py-12 text-text-secondary">
        Memuat...
      </div>
    );
  }

  if (!trainer) {
    return (
      <div className="max-w-350 mx-auto px-5 py-12 text-text-secondary">
        Trainer tidak ditemukan.
      </div>
    );
  }

const socialLinks = [
  {
    url: trainer.instagramUrl,
    icon: <InstagramIcon />,
    label: 'Instagram',
  },
  {
    url: trainer.tiktokUrl,
    icon: <TikTokIcon />,
    label: 'TikTok',
  },
  {
    url: trainer.facebookUrl,
    icon: <FacebookIcon />,
    label: 'Facebook',
  },
  {
    url: trainer.whatsappUrl,
    icon: <MessageCircle size={18} />,
    label: 'WhatsApp',
  },
].filter((link) => link.url);

  return (
    <div className="max-w-350 mx-auto px-5 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="neu-flat rounded-xl p-5">
          <div className="aspect-square neu-pressed rounded-lg overflow-hidden flex items-center justify-center mb-4">
            {trainer.photoUrl ? (
              <img
                src={`${import.meta.env.VITE_API_URL}${trainer.photoUrl}`}
                alt={trainer.user?.fullName}
                className="w-full h-full object-cover"
                loading='lazy'
              />
            ) : (
              <User size={64} className="text-neutral" />
            )}
          </div>

          <h1 className="text-2xl font-bold text-text-primary">
            {trainer.user?.fullName}
          </h1>

          {trainer.specialty && (
            <p className="text-secondary font-medium mt-1">
              {trainer.specialty}
            </p>
          )}

          {trainer.bio && (
            <p className="text-text-secondary mt-3">
              {trainer.bio}
            </p>
          )}

          {socialLinks.length > 0 && (
            <div className="flex gap-2 mt-4">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full neu-flat-sm flex items-center justify-center text-text-secondary hover:text-secondary hover:brightness-110 transition-all"
                  aria-label={link.label}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          )}

          {user ? (
            <Link
              to="/dashboard/bookings/new"
              state={{ trainerId: trainer.id }}
            >
              <Button className="w-full mt-6">
                Booking Sesi
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button className="w-full mt-6">
                Masuk untuk Booking
              </Button>
            </Link>
          )}
        </div>

        <div className="md:col-span-2">
          <h2 className="text-xl font-bold mb-4 text-text-primary">
            Jadwal Tersedia
          </h2>

          {!user ? (
            <div className="neu-pressed rounded-xl p-4 text-sm text-text-secondary">
              Masuk atau daftar akun terlebih dahulu untuk melihat jadwal yang
              tersedia dan melakukan booking.
            </div>
          ) : schedules.length === 0 ? (
            <p className="text-text-secondary">
              Belum ada jadwal tersedia untuk masa membership kamu saat ini.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="neu-flat rounded-xl p-4"
                >
                  <p className="font-semibold text-text-primary">
                    {new Date(schedule.date).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </p>

                  <p className="text-sm text-text-secondary font-mono mt-1">
                    {new Date(schedule.startTime).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {' - '}
                    {new Date(schedule.endTime).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}