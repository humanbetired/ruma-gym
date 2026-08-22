import { useEffect, useState } from 'react';
import { getMyKta } from '../../api/users';
import type { KtaData } from '../../api/users';
import { Download} from 'lucide-react';
import axios from 'axios';
import jsPDF from 'jspdf';

export function KtaPage() {
  const [kta, setKta] = useState<KtaData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    getMyKta()
      .then(setKta)
      .catch((err) => {
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError('Gagal memuat data KTA.');
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  async function handleDownloadPdf() {
    if (!kta) return;

    try {
      setIsDownloading(true);

      const width = 85.6;
      const height = 54;

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [width, height],
      });

      pdf.setFillColor(15, 15, 15);
      pdf.rect(0, 0, width, height, 'F');

      pdf.setDrawColor(193, 157, 88);
      pdf.setLineWidth(0.4);
      pdf.roundedRect(
        2,
        2,
        width - 4,
        height - 4,
        2,
        2,
        'S',
      );

      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8.5);
      pdf.text('RUMA', 7, 10);

      pdf.setTextColor(193, 157, 88);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(4);

      pdf.text(
        'GYM & FITNESS',
        7,
        13.5,
      );

      pdf.setTextColor(130, 130, 130);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(3.5);

      pdf.text(
        'MEMBER CARD',
        width - 7,
        13,
        { align: 'right' },
      );

      pdf.setTextColor(193, 157, 88);
      pdf.setFont('courier', 'bold');
      pdf.setFontSize(9);

      pdf.text(
        kta.ktaNumber,
        7,
        23,
      );

      pdf.setTextColor(110, 110, 110);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(3.2);

      pdf.text(
        'MEMBERSHIP NUMBER',
        7,
        26,
      );

      const fullName =
        kta.fullName.length > 25
          ? `${kta.fullName.substring(0, 25)}...`
          : kta.fullName;

      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);

      pdf.text(
        fullName.toUpperCase(),
        7,
        34,
      );

      pdf.setTextColor(110, 110, 110);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(3.2);

      pdf.text(
        'CARDHOLDER',
        7,
        37,
      );

      if (kta.activeMembership) {
        pdf.setTextColor(193, 157, 88);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(4.5);

        pdf.text(
          kta.activeMembership.planName.toUpperCase(),
          7,
          44,
        );

        pdf.setTextColor(145, 145, 145);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(3.3);

        pdf.text(
          `VALID UNTIL ${formatDate(
            kta.activeMembership.endDate,
          ).toUpperCase()}`,
          7,
          47,
        );
      } else {
        pdf.setTextColor(190, 80, 80);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(4);

        pdf.text(
          'NO ACTIVE MEMBERSHIP',
          7,
          45,
        );
      }

      pdf.save(`KTA-${kta.ktaNumber}.pdf`);
    } catch (err) {
      console.error('Gagal membuat PDF:', err);
    } finally {
      setIsDownloading(false);
    }
  }

  if (isLoading) {
    return (
      <p className="text-text-secondary">
        Memuat...
      </p>
    );
  }

  if (error || !kta) {
    return (
      <div className="max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-text-primary">
          Kartu Tanda Anggota
        </h1>

        <div className="neu-pressed rounded-xl p-4 text-sm text-text-secondary">
          {error || 'Data KTA tidak ditemukan.'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Kartu Tanda Anggota
          </h1>
        </div>

        <button
          onClick={handleDownloadPdf}
          disabled={isDownloading}
          className="neu-flat-sm flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-secondary hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <Download size={17} />

          {isDownloading
            ? 'Membuat PDF...'
            : 'Download KTA'}
        </button>
      </div>

      <div className="w-full max-w-140">
        <div className="relative aspect-[1.586/1] overflow-hidden rounded-2xl bg-[#0f0f0f] shadow-2xl border border-[#c19d58]/40">
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full border border-[#c19d58]/10" />

          <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full border border-[#c19d58]/10" />

          <div className="absolute right-0 bottom-0 w-48 h-48 rounded-full bg-[#c19d58]/5 blur-3xl" />

          <div className="relative h-full p-6 md:p-8 flex flex-col">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 flex items-center justify-center text-[#c19d58]">
                  <img src="/logo.png" alt="" />
                </div>

                <div>
                  <p className="text-white font-bold tracking-[0.18em] text-sm">
                    RUMA
                  </p>

                  <p className="text-[#c19d58] text-[8px] tracking-[0.2em]">
                    GYM & FITNESS
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-white/40 text-[8px] tracking-wider">
                  MEMBER CARD
                </p>
              </div>
            </div>

            <div className="mt-auto">
              <p className="text-white/40 text-[8px] tracking-[0.2em] uppercase mt-2">
                Membership Number
              </p>

              <p className="mt-1 text-[#c19d58] font-mono text-lg md:text-xl tracking-[0.16em] font-semibold">
                {kta.ktaNumber}
              </p>

              <div className="mt-4">
                <p className="text-white/40 text-[8px] tracking-[0.2em] uppercase">
                  Cardholder
                </p>

                <p className="text-white md:text-lg font-semibold tracking-wide uppercase truncate">
                  {kta.fullName}
                </p>
              </div>

              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  {kta.activeMembership ? (
                    <>
                      <p className="text-[#c19d58] text-[9px] font-semibold uppercase tracking-wider">
                        {kta.activeMembership.planName}
                      </p>

                      <div className="flex items-center gap-1.5 mt-1 text-white/50 text-[9px]">
                        <span>
                          Valid until{' '}
                          {formatDate(
                            kta.activeMembership.endDate,
                          )}
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-red-400 text-[9px] uppercase tracking-wider">
                      No Active Membership
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between max-w-140">
        <p className="text-xs text-text-secondary">
          Anggota sejak{' '}
          {new Date(kta.createdAt).toLocaleDateString(
            'id-ID',
            {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            },
          )}
        </p>

        <p className="text-xs text-text-secondary">
          Digital Membership Card
        </p>
      </div>
    </div>
  );
}