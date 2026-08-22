import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFacilities } from '../../api/content';
import type { Facility } from '../../types/content';

export function FacilitiesSection() {
  const [facilities, setFacilities] = useState<Facility[]>([]);

  useEffect(() => {
    getFacilities().then((data) => setFacilities(data.slice(0, 3)));
  }, []);

  if (facilities.length === 0) return null;

  return (
    <section id="fasilitas" className="max-w-350 mx-auto px-5 py-16 scroll-mt-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Fasilitas</h2>
        <Link to="/facilities" className="text-primary font-semibold text-sm hover:brightness-110">
          Explore
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {facilities.map((facility) => (
          <div key={facility.id} className="neu-flat rounded-xl p-5">
            <h3 className="font-semibold text-text-primary mb-1">{facility.name}</h3>
            {facility.description && (
              <p className="text-sm text-text-secondary line-clamp-2">{facility.description}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}