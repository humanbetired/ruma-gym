import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getGalleryImages } from '../../api/content';
import type { GalleryImage } from '../../types/content';

export function GallerySection() {
  const [images, setImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    getGalleryImages().then((data) => setImages(data.slice(0, 4)));
  }, []);

  if (images.length === 0) return null;

  return (
    <section id="galeri" className="max-w-350 mx-auto px-5 py-16 scroll-mt-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Galeri</h2>
        <Link to="/gallery" className="text-primary font-semibold text-sm hover:brightness-110">
          Explore
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {images.map((image) => (
          <div key={image.id} className="neu-flat rounded-xl p-2 aspect-square">
            <div className="w-full h-full rounded-lg overflow-hidden">
              <img
                src={`${import.meta.env.VITE_API_URL}${image.imageUrl}`}
                alt={image.caption || 'Foto galeri'}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}