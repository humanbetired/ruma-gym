import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTrainers } from '../../api/trainers';
import type { TrainerProfile } from '../../types/trainer';
import { User } from 'lucide-react';

export function TrainersPage() {
  const [trainers, setTrainers] = useState<TrainerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getTrainers()
      .then(setTrainers)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-350 mx-auto px-5 py-12">
      <h1 className="text-[32px] font-bold mb-2 text-text-primary">Personal Trainer Kami</h1>
      <p className="text-text-secondary mb-8">Pilih trainer yang sesuai dengan tujuan latihanmu.</p>

      {isLoading ? (
        <p className="text-text-secondary">Memuat...</p>
      ) : trainers.length === 0 ? (
        <p className="text-text-secondary">Belum ada trainer yang tersedia.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {trainers.map((trainer) => (
            <Link key={trainer.id} to={`/trainers/${trainer.id}`} className="neu-flat rounded-xl p-3 hover:brightness-105 transition-all">
              <div className="aspect-square neu-pressed rounded-lg overflow-hidden flex items-center justify-center mb-3">
                {trainer.photoUrl ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL}${trainer.photoUrl}`}
                    alt={trainer.user?.fullName}
                    className="w-full h-full object-cover"
                    loading='lazy'
                  />
                ) : (
                  <User size={48} className="text-neutral" />
                )}
              </div>
              <div className="px-2 pb-2">
                <h3 className="font-semibold text-lg text-text-primary">{trainer.user?.fullName}</h3>
                {trainer.specialty && <p className="text-sm text-secondary font-medium mt-1">{trainer.specialty}</p>}
                {trainer.bio && <p className="text-sm text-text-secondary mt-2 line-clamp-2">{trainer.bio}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}