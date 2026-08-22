import { useEffect, useState } from 'react';
import { getGalleryImages } from '../../api/content';
import type { GalleryImage } from '../../types/content';

export function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadImages();
  }, [activeCategory]);

  async function loadImages() {
    setIsLoading(true);
    try {
      const data = await getGalleryImages(activeCategory || undefined);
      setImages(data);

      if (categories.length === 0) {
        const allImages = activeCategory ? await getGalleryImages() : data;
        const uniqueCategories = [...new Set(allImages.map((img) => img.category).filter(Boolean))] as string[];
        setCategories(uniqueCategories);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-350 mx-auto px-5 py-12">
      <h1 className="text-[32px] font-bold mb-2 text-text-primary">Galeri</h1>
      <p className="text-text-secondary mb-6">Suasana dan aktivitas di Ganesha Gym.</p>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveCategory(null)}
            className={`h-8 px-4 rounded-lg text-sm font-medium transition-all ${
              activeCategory === null ? 'neu-pressed text-secondary' : 'neu-flat-sm text-text-secondary hover:text-text-primary'
            }`}
          >
            Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`h-8 px-4 rounded-lg text-sm font-medium transition-all ${
                activeCategory === cat ? 'neu-pressed text-secondary' : 'neu-flat-sm text-text-secondary hover:text-text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <p className="text-text-secondary">Memuat...</p>
      ) : images.length === 0 ? (
        <p className="text-text-secondary">Belum ada foto di kategori ini.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div key={image.id} className="neu-flat rounded-xl p-2 aspect-square">
              <div className="w-full h-full rounded-lg overflow-hidden">
                <img
                  src={`${import.meta.env.VITE_API_URL}${image.imageUrl}`}
                  alt={image.caption || 'Foto galeri'}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  loading='lazy'
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}