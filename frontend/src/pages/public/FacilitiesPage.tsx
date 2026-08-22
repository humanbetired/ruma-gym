import { useEffect, useState } from 'react';
import { getFacilities } from '../../api/content';
import type { Facility } from '../../types/content';
import { Dumbbell } from 'lucide-react';

export function FacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getFacilities()
      .then(setFacilities)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-350 mx-auto px-5 py-12">
      <h1 className="text-[32px] font-bold mb-2 text-text-primary">Fasilitas Kami</h1>
      <p className="text-text-secondary mb-8">Nikmati fasilitas lengkap untuk mendukung latihanmu.</p>

      {isLoading ? (
        <p className="text-text-secondary">Memuat...</p>
      ) : facilities.length === 0 ? (
        <p className="text-text-secondary">Belum ada fasilitas yang ditampilkan.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {facilities.map((facility) => (
            <div key={facility.id} className="neu-flat rounded-xl p-6 flex flex-col gap-3">
              <div className="w-12 h-12 rounded-full neu-pressed flex items-center justify-center">
                <Dumbbell size={22} className="text-primary" />
              </div>
              <h3 className="font-semibold text-lg text-text-primary">{facility.name}</h3>
              {facility.description && (
                <p className="text-sm text-text-secondary">{facility.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}