import { useEffect, useState } from 'react';
import { createMembership, getMyMemberships, getMembershipPlans, cancelMembership } from '../../api/memberships';
import { submitPaymentProof } from '../../api/payments';
import type { MembershipPlan, Membership } from '../../types/membership';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Copy, Check, Download, Landmark, QrCode, Upload, X } from 'lucide-react';
import axios from 'axios';
import { useConfirm } from '../../context/ConfirmContext';
import { validateImageSize } from '../../utils/fileValidation';


const BANK_INFO = {
  bankName: 'BRI',
  accountNumber: '658201019220532',
  accountHolder: 'Renda Nur Roudhoh',
};

function BankInfoCard() {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(BANK_INFO.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="neu-flat rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Landmark size={18} className="text-primary" />
        <h3 className="font-bold text-text-primary">Transfer Bank</h3>
      </div>

      <div className="neu-pressed rounded-lg p-4 flex flex-col gap-2">
        <div>
          <p className="text-xs text-text-secondary">Bank</p>
          <p className="font-semibold text-text-primary">{BANK_INFO.bankName}</p>
        </div>

        <div>
          <p className="text-xs text-text-secondary">Nomor Rekening</p>
          <div className="flex items-center gap-2">
            <p className="font-mono font-semibold text-lg text-secondary">{BANK_INFO.accountNumber}</p>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg neu-flat-sm text-text-secondary hover:text-text-primary hover:brightness-110 transition-all"
              aria-label="Salin nomor rekening"
            >
              {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
            </button>
          </div>
          {copied && <p className="text-xs text-success mt-1">Nomor rekening disalin!</p>}
        </div>

        <div>
          <p className="text-xs text-text-secondary">Atas Nama</p>
          <p className="font-semibold text-text-primary">{BANK_INFO.accountHolder}</p>
        </div>
      </div>
    </div>
  );
}

function QrisCard() {
  return (
    <div className="neu-flat rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <QrCode size={18} className="text-primary" />
        <h3 className="font-bold text-text-primary">Bayar dengan QRIS</h3>
      </div>

      <div className="neu-pressed rounded-lg p-4 flex flex-col items-center gap-3">
        <img src="/qris.jpeg" alt="QRIS Ganesha Gym" className="w-48 h-48 object-contain rounded-lg" />
        <a
          href="/qris.jpeg"
          download="QRIS-Ganesha-Gym.png"
          className="flex items-center gap-2 text-sm font-semibold text-primary hover:brightness-110 transition-all"
        >
          <Download size={16} />
          Download QRIS
        </a>
      </div>
    </div>
  );
}

export function MembershipPage() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [myMemberships, setMyMemberships] = useState<Membership[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [pendingMembership, setPendingMembership] = useState<Membership | null>(null);
  const [amount, setAmount] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const confirm = useConfirm();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const [plansData, memberships] = await Promise.all([getMembershipPlans(), getMyMemberships()]);
      setPlans(plansData);
      setMyMemberships(memberships);

      const existingPending = memberships.find((m) => m.status === 'PENDING');
      setPendingMembership(existingPending || null);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSelectPlan(planId: string) {
    setError('');
    setSelectedPlanId(planId);
    setIsSubmitting(true);
    try {
      const membership = await createMembership(planId);
      setPendingMembership(membership);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Gagal mendaftar membership.');
      }
      setSelectedPlanId(null);
    } finally {
      setIsSubmitting(false);
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
  }

  function formatRupiah(value: string) {
  const number = value.replace(/\D/g, '');
  return number ? Number(number).toLocaleString('id-ID') : '';
  }

  async function handleSubmitProof() {
    if (!pendingMembership || !file || !amount) {
      setError('Lengkapi nominal dan bukti pembayaran.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await submitPaymentProof(pendingMembership.id, Number(amount), file);
      await loadData();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Gagal mengirim bukti pembayaran.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCancel() {
    if (!pendingMembership) return;

    const ok = await confirm({
      title: 'Batalkan Pilihan Paket',
      message: 'Kamu bisa memilih paket lain setelahnya. Yakin ingin membatalkan?',
      confirmLabel: 'Ya, Batalkan',
      variant: 'danger',
    });
    if (!ok) return;

    setIsCancelling(true);
    try {
      await cancelMembership(pendingMembership.id);
      setPendingMembership(null);
      setSelectedPlanId(null);
      setAmount('');
      setFile(null);
      setPreview(null);
      await loadData();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Gagal membatalkan pilihan.');
      }
    } finally {
      setIsCancelling(false);
    }
  }

  const activeMembership = myMemberships.find((m) => m.status === 'ACTIVE');

  if (isLoading) return <p className="text-text-secondary">Memuat...</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 text-text-primary">Membership</h1>

      {activeMembership && (
        <div className="neu-flat rounded-xl p-4 mb-6">
          <p className="font-semibold text-success">Membership Aktif</p>
          <p className="text-sm text-text-secondary mt-1">
            Paket: {activeMembership.plan.name} <br></br>berlaku sampai {new Date(activeMembership.endDate!).toLocaleDateString('id-ID')}
          </p>
          <p className="text-sm text-text-secondary">Sisa sesi PT: {activeMembership.ptSessionsRemaining}</p>
        </div>
      )}

      {pendingMembership && pendingMembership.status === 'PENDING' && !pendingMembership.payment && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BankInfoCard />
            <QrisCard />
          </div>

          <div className="neu-flat rounded-xl p-6">
            <div className="flex items-start justify-between gap-3 mb-1">
              <h2 className="font-bold text-lg text-text-primary">Upload Bukti Pembayaran</h2>
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="text-sm text-error font-medium hover:brightness-110 transition-all shrink-0"
              >
                {isCancelling ? 'Membatalkan...' : 'Batalkan Paket'}
              </button>
            </div>
            <p className="text-sm text-text-secondary mb-4">
              Paket: {pendingMembership.plan.name} 
              <br></br>Harga: Rp{Number(pendingMembership.plan.price).toLocaleString('id-ID')}
            </p>

            <div className="flex flex-col gap-4">
              <Input
                label="Nominal yang ditransfer"
                type="text"
                inputMode="numeric"
                value={formatRupiah(amount)}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                placeholder={Number(pendingMembership.plan.price).toLocaleString('id-ID')}
              />

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text-secondary">
                    Bukti Transfer
                  </label>

                  {!preview ? (
                    <label
                      htmlFor="proof-upload"
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                                neu-pressed text-sm font-medium text-text-secondary
                                hover:text-text-primary cursor-pointer transition-all"
                    >
                      <Upload size={18} />
                      Pilih Bukti Transfer
                    </label>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden neu-pressed p-2">
                      <img
                        src={preview}
                        alt="Preview bukti transfer"
                        className="w-full max-h-72 object-contain rounded-lg"
                        loading='lazy'
                      />

                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="absolute top-4 right-4 p-2 rounded-full bg-black/60
                                  text-white hover:bg-black/80 transition-all"
                        aria-label="Hapus bukti transfer"
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
                    id="proof-upload"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

              {error && <p className="text-sm text-error">{error}</p>}

              <Button onClick={handleSubmitProof} disabled={isSubmitting}>
                {isSubmitting ? 'Mengirim...' : 'Kirim Bukti Pembayaran'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {pendingMembership && pendingMembership.payment && (
        <div className="neu-pressed rounded-xl p-4">
          <p className="font-semibold text-warning">Menunggu Verifikasi Admin</p>
          <p className="text-sm text-text-secondary mt-1">Bukti pembayaran kamu sedang ditinjau. Mohon tunggu konfirmasi.</p>
        </div>
      )}

      {!activeMembership && !pendingMembership && (
        <div>
          <h2 className="font-bold text-lg mb-4 text-text-primary">Pilih Paket Membership</h2>
          {error && <p className="text-sm text-error mb-4">{error}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {plans.map((plan) => (
              <div key={plan.id} className="neu-flat rounded-xl p-5 flex flex-col gap-2">
                <h3 className="font-bold text-lg text-text-primary">{plan.name}</h3>
                <p className="text-2xl font-bold text-secondary">Rp{Number(plan.price).toLocaleString('id-ID')}</p>
                <p className="text-sm text-text-secondary">{plan.durationDays} hari</p>
                {plan.ptSessionQuota > 0 && <p className="text-sm text-text-secondary">Termasuk {plan.ptSessionQuota}x sesi PT</p>}
                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isSubmitting && selectedPlanId === plan.id}
                  className="mt-2"
                >
                  {isSubmitting && selectedPlanId === plan.id ? 'Memproses...' : 'Pilih Paket'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}