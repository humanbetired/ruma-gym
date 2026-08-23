import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { getMyTrainerProfile, updateMyTrainerProfile, uploadMyTrainerPhoto } from '../../api/trainers';
import type { TrainerProfile } from '../../types/trainer';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { IconInput } from '../../components/ui/IconInput';
import { User, MessageCircle } from 'lucide-react';
import axios from 'axios';
import { validateImageSize } from '../../utils/fileValidation';


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

export function TrainerProfilePage() {
  const [profile, setProfile] = useState<TrainerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [bio, setBio] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setIsLoading(true);
    try {
      const data = await getMyTrainerProfile();
      setProfile(data);
      setBio(data.bio || '');
      setSpecialty(data.specialty || '');
      setInstagramUrl(data.instagramUrl || '');
      setTiktokUrl(data.tiktokUrl || '');
      setFacebookUrl(data.facebookUrl || '');
      setWhatsappUrl(data.whatsappUrl || '');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      const updated = await updateMyTrainerProfile({
        bio: bio || undefined,
        specialty: specialty || undefined,
        instagramUrl: instagramUrl || undefined,
        tiktokUrl: tiktokUrl || undefined,
        facebookUrl: facebookUrl || undefined,
        whatsappUrl: whatsappUrl || undefined,
      });
      setProfile(updated);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        const msg = err.response.data.message;
        setError(Array.isArray(msg) ? msg.join(', ') : msg);
      } else {
        setError('Gagal menyimpan profil.');
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeError = validateImageSize(file);
    if (sizeError) {
      setPhotoError(sizeError);
      e.target.value = '';
      return;
    }

    setPhotoError('');
    setIsUploadingPhoto(true);

    try {
      const updated = await uploadMyTrainerPhoto(file);
      setProfile(updated);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        const msg = err.response.data.message;
        setPhotoError(Array.isArray(msg) ? msg.join(', ') : msg);
      } else {
        setPhotoError('Gagal mengunggah foto.');
      }
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  if (isLoading) return <p className="text-text-secondary">Memuat...</p>;
  if (!profile) return <p className="text-text-secondary">Profil trainer tidak ditemukan.</p>;

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-6 text-text-primary">Profil Saya</h1>

      <div className="neu-flat rounded-xl p-6">
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="w-28 h-28 rounded-full neu-pressed overflow-hidden flex items-center justify-center">
            {profile.photoUrl ? (
              <img src={`${import.meta.env.VITE_API_URL}${profile.photoUrl}`} alt={profile.user?.fullName} className="w-full h-full object-cover" />
            ) : (
              <User size={40} className="text-neutral" />
            )}
          </div>

          <label className="text-sm text-primary font-semibold cursor-pointer">
            {isUploadingPhoto ? 'Mengunggah...' : 'Ganti Foto'}
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handlePhotoChange}
              disabled={isUploadingPhoto}
              className="hidden"
            />
          </label>
          {photoError && <p className="text-xs text-error">{photoError}</p>}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Spesialisasi" value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="misal: Powerlifting, Yoga" />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="neu-pressed w-full px-4 py-3 rounded-xl border-none text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="border-t border-border pt-4 mt-2">
            <p className="text-sm font-semibold text-text-primary mb-3">Sosial Media</p>
            <div className="flex flex-col gap-3">
              <IconInput
                icon={<InstagramIcon/>}
                type="url"
                placeholder="Link Instagram"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
              />
              <IconInput
                icon={<TikTokIcon />}
                type="url"
                placeholder="Link TikTok"
                value={tiktokUrl}
                onChange={(e) => setTiktokUrl(e.target.value)}
              />
              <IconInput
                icon={<FacebookIcon/>}
                type="url"
                placeholder="Link Facebook"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
              />
              <IconInput
                icon={<MessageCircle size={18} />}
                type="url"
                placeholder="Link WhatsApp (misal wa.me/628xxx)"
                value={whatsappUrl}
                onChange={(e) => setWhatsappUrl(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-sm text-error">{error}</p>}

          <Button type="submit" disabled={isSaving}>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</Button>
        </form>
      </div>
    </div>
  );
}