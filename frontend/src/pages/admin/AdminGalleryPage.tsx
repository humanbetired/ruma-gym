import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { getGalleryImages, createGalleryImage, deleteGalleryImage } from '../../api/content';
import type { GalleryImage } from '../../types/content';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Trash2, Upload, X } from 'lucide-react';
import { useConfirm } from '../../context/ConfirmContext';
import { validateImageSize } from '../../utils/fileValidation';
import axios from 'axios';

export function AdminGalleryPage() {
  const confirm = useConfirm();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadImages();
  }, []);

  async function loadImages() {
    setIsLoading(true);
    try {
      const data = await getGalleryImages();
      setImages(data);
    } finally {
      setIsLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    const sizeError = validateImageSize(selectedFile);
    if (sizeError) {
      setError(sizeError);
      e.target.value = '';
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setError('');
  }

  function handleRemoveFile() {
    setFile(null);
    setPreview(null);

    const fileInput = document.getElementById('gallery-file') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('Pilih gambar terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createGalleryImage({ caption: caption || undefined, category: category || undefined }, file);
      setCaption('');
      setCategory('');
      setFile(null);
      setPreview(null);

      const fileInput = document.getElementById('gallery-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      await loadImages();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        const msg = err.response.data.message;
        setError(Array.isArray(msg) ? msg.join(', ') : msg);
      } else {
        setError('Gagal mengunggah gambar.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    const ok = await confirm({
      title: 'Hapus Foto',
      message: 'Foto ini akan dihapus permanen dari galeri. Yakin ingin melanjutkan?',
      confirmLabel: 'Hapus',
      variant: 'danger',
    });
    if (!ok) return;

    try {
      await deleteGalleryImage(id);
      setImages((prev) => prev.filter((img) => img.id !== id));
    } catch {
      alert('Gagal menghapus foto.');
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6 text-text-primary">Kelola Galeri</h1>

      <form onSubmit={handleSubmit} className="neu-flat rounded-xl p-5 mb-6">
        <h2 className="font-bold mb-4 text-text-primary">Tambah Foto</h2>
        <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-secondary">
            Gambar
          </label>

          {!preview ? (
            <label
              htmlFor="gallery-file"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                        neu-pressed text-sm font-medium text-text-secondary
                        hover:text-text-primary cursor-pointer transition-all"
            >
              <Upload size={18} />
              Pilih Gambar
            </label>
          ) : (
            <div className="relative rounded-xl overflow-hidden neu-pressed p-2">
              <div className="aspect-video rounded-lg overflow-hidden">
                <img
                  src={preview}
                  alt="Preview gambar"
                  className="w-full h-full object-contain"
                />
              </div>

              <button
                type="button"
                onClick={handleRemoveFile}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60
                          text-white hover:bg-black/80 transition-all"
                aria-label="Hapus gambar"
              >
                <X size={16} />
              </button>

              <div className="px-2 pt-2">
                <p className="text-xs text-text-secondary truncate">
                  {file?.name}
                </p>
              </div>
            </div>
          )}

          <input
            id="gallery-file"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

          <Input label="Caption (opsional)" value={caption} onChange={(e) => setCaption(e.target.value)} />
          <Input label="Kategori (opsional)" value={category} onChange={(e) => setCategory(e.target.value.toLowerCase())} placeholder="misal: interior, alat, member" />

          {error && <p className="text-sm text-error">{error}</p>}

          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Mengunggah...' : 'Tambah Foto'}</Button>
        </div>
      </form>

      {isLoading ? (
        <p className="text-text-secondary">Memuat...</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((image) => (
            <div key={image.id} className="relative group neu-flat rounded-xl p-2">
              <div className="aspect-square rounded-lg overflow-hidden">
                <img
                  src={`${import.meta.env.VITE_API_URL}${image.imageUrl}`}
                  alt={image.caption || 'Foto galeri'}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => handleDelete(image.id)}
                className="absolute top-3 right-3 neu-flat-sm text-error p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Hapus"
              >
                <Trash2 size={14} />
              </button>
              {image.category && (
                <span className="absolute bottom-3 left-3 bg-base text-secondary text-xs px-2 py-0.5 rounded-lg neu-flat-sm">
                  {image.category}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}