import { useEffect, useState } from 'react';
import { getPendingPayments, approvePayment, rejectPayment } from '../../api/payments';
import type { Payment } from '../../types/membership';
import { Button } from '../../components/ui/Button';
import { useConfirm } from '../../context/ConfirmContext';
import { usePrompt } from '../../context/PromptContext';

export function PaymentApprovalPage() {
  const confirm = useConfirm();
  const prompt = usePrompt();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadPayments();
  }, []);

  async function loadPayments() {
    setIsLoading(true);
    try {
      const data = await getPendingPayments();
      setPayments(data);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleApprove(id: string) {
    const ok = await confirm({
      title: 'Approve Pembayaran',
      message: 'Membership member ini akan langsung aktif setelah disetujui. Lanjutkan?',
      confirmLabel: 'Approve',
    });
    if (!ok) return;

    setProcessingId(id);
    try {
      await approvePayment(id);
      setPayments((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert('Gagal approve pembayaran.');
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(id: string) {
    const reason = await prompt({
      title: 'Alasan Penolakan',
      message: 'Beri tahu member kenapa pembayaran ini ditolak (opsional).',
      placeholder: 'Contoh: nominal transfer tidak sesuai',
      confirmLabel: 'Tolak Pembayaran',
    });

    if (reason === null) return;

    setProcessingId(id);
    try {
      await rejectPayment(id, reason || undefined);
      setPayments((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert('Gagal reject pembayaran.');
    } finally {
      setProcessingId(null);
    }
  }

  if (isLoading) return <p className="text-text-secondary">Memuat...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-text-primary">Verifikasi Pembayaran</h1>

      {payments.length === 0 ? (
        <p className="text-text-secondary">Tidak ada pembayaran yang menunggu verifikasi.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {payments.map((payment) => (
            <div key={payment.id} className="neu-flat rounded-xl overflow-hidden">
              <div className="p-2">
                <img
                  src={`${import.meta.env.VITE_API_URL}${payment.proofImageUrl}`}
                  alt="Bukti pembayaran"
                  className="w-full aspect-video object-cover rounded-lg neu-pressed"
                />
              </div>

              <div className="p-4 flex flex-col gap-2">
                <div>
                  <p className="font-bold text-text-primary">{payment.user?.fullName}</p>
                  <p className="text-sm text-text-secondary">{payment.user?.email}</p>
                </div>

                <div className="text-sm text-text-secondary">
                  <p>Paket: {payment.membership?.plan?.name}</p>
                  <p className="font-mono">Rp{Number(payment.amount).toLocaleString('id-ID')}</p>
                </div>

                <div className="flex gap-2 mt-2">
                  <Button onClick={() => handleApprove(payment.id)} disabled={processingId === payment.id} className="flex-1">
                    Approve
                  </Button>
                  <Button onClick={() => handleReject(payment.id)} disabled={processingId === payment.id} variant="secondary" className="flex-1">
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}