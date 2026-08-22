import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTrainers } from '../../api/trainers';
import type { TrainerProfile } from '../../types/trainer';
import { User } from 'lucide-react';

export function TrainersSection() {
  const [trainers, setTrainers] = useState<TrainerProfile[]>([]);

  useEffect(() => {
    getTrainers().then((data) => setTrainers(data.slice(0, 3)));
  }, []);

  if (trainers.length === 0) return null;

  return (
    <section id="trainer" className="max-w-350 mx-auto px-5 py-16 scroll-mt-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Personal Trainer</h2>
        <Link to="/trainers" className="text-primary font-semibold text-sm hover:brightness-110">
          Explore
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {trainers.map((trainer) => (
          <Link
            key={trainer.id}
            to={`/trainers/${trainer.id}`}
            className="neu-flat rounded-xl p-3 hover:brightness-105 transition-all"
          >
            <div className="aspect-square rounded-lg overflow-hidden neu-pressed flex items-center justify-center mb-3">
              {trainer.photoUrl ? (
                <img
                  src={`${import.meta.env.VITE_API_URL}${trainer.photoUrl}`}
                  alt={trainer.user?.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={40} className="text-neutral" />
              )}
            </div>
            <h3 className="font-semibold text-text-primary">{trainer.user?.fullName}</h3>
            {trainer.specialty && (
              <p className="text-sm text-secondary font-medium mt-1">{trainer.specialty}</p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}