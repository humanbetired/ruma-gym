import { useState } from 'react';
import { getFinancialReport } from '../../api/report';
import type { FinancialReport } from '../../types/report';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Wallet, Dumbbell, UserCheck, ShoppingCart, FileDown } from 'lucide-react';

function getDefaultDateRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0],
  };
}

export function FinancialReportPage() {
  const defaultRange = getDefaultDateRange();
  const [fromDate, setFromDate] = useState(defaultRange.from);
  const [toDate, setToDate] = useState(defaultRange.to);
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');

  async function handleGenerate() {
    setError('');
    setIsLoading(true);
    try {
      const data = await getFinancialReport(fromDate, toDate);
      setReport(data);
    } catch {
      setError('Gagal memuat laporan.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleExportPdf() {
    if (!report) return;
    setIsExporting(true);
    try {
      const { exportFinancialReportPdf } = await import('../../utils/exportFinancialReportPdf');
      exportFinancialReportPdf(report);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6 text-text-primary">Laporan Keuangan</h1>

      <div className="neu-flat rounded-xl p-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <Input type="date" label="Dari Tanggal" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          <Input type="date" label="Sampai Tanggal" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          <Button onClick={handleGenerate} disabled={isLoading}>
            {isLoading ? 'Memuat...' : 'Tampilkan Laporan'}
          </Button>
        </div>
        {error && <p className="text-sm text-error mt-3">{error}</p>}
      </div>

      {report && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-text-secondary">
              Periode: {new Date(report.period.from).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
              {' - '}
              {new Date(report.period.to).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
            </p>
            <Button variant="secondary" onClick={handleExportPdf} disabled={isExporting}>
              <FileDown size={16} className="inline mr-2" />
              {isExporting ? 'Menyiapkan...' : 'Export PDF'}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="neu-flat rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Dumbbell size={16} className="text-primary" />
                <p className="text-sm text-text-secondary">Membership</p>
              </div>
              <p className="text-xl font-bold font-mono text-text-primary">
                Rp{report.summary.membership.total.toLocaleString('id-ID')}
              </p>
              <p className="text-xs text-text-secondary mt-1">{report.summary.membership.count} transaksi</p>
            </div>

            <div className="neu-flat rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <UserCheck size={16} className="text-primary" />
                <p className="text-sm text-text-secondary">Drop-in</p>
              </div>
              <p className="text-xl font-bold font-mono text-text-primary">
                Rp{report.summary.dropIn.total.toLocaleString('id-ID')}
              </p>
              <p className="text-xs text-text-secondary mt-1">{report.summary.dropIn.count} transaksi</p>
            </div>

            <div className="neu-flat rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart size={16} className="text-primary" />
                <p className="text-sm text-text-secondary">Warung</p>
              </div>
              <p className="text-xl font-bold font-mono text-text-primary">
                Rp{report.summary.warung.total.toLocaleString('id-ID')}
              </p>
              <p className="text-xs text-text-secondary mt-1">{report.summary.warung.count} transaksi</p>
            </div>
          </div>

          <div className="neu-pressed rounded-xl p-5 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet size={20} className="text-secondary" />
              <p className="font-bold text-text-primary">Total Pendapatan</p>
            </div>
            <p className="text-2xl font-bold font-mono text-secondary">
              Rp{report.summary.grandTotal.toLocaleString('id-ID')}
            </p>
          </div>

          {report.details.membership.length > 0 && (
            <ReportSection title="Rincian Membership">
              {report.details.membership.map((item, idx) => (
                <ReportRow
                  key={idx}
                  date={item.date}
                  description={`${item.memberName}: ${item.planName}`}
                  amount={item.amount}
                />
              ))}
            </ReportSection>
          )}

          {report.details.dropIn.length > 0 && (
            <ReportSection title="Rincian Drop-in Visitor">
              {report.details.dropIn.map((item, idx) => (
                <ReportRow key={idx} date={item.date} description={item.visitorName} amount={item.amount} />
              ))}
            </ReportSection>
          )}

          {report.details.warung.length > 0 && (
            <ReportSection title="Rincian Warung">
              {report.details.warung.map((item, idx) => (
                <ReportRow key={idx} date={item.date} description={item.items} amount={item.amount} />
              ))}
            </ReportSection>
          )}
        </>
      )}
    </div>
  );
}

function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="neu-flat rounded-xl p-5 mb-4">
      <h3 className="font-bold text-text-primary mb-3">{title}</h3>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

function ReportRow({ date, description, amount }: { date: string; description: string; amount: number }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-0">
      <div className="min-w-0">
        <p className="text-sm text-text-primary truncate">{description}</p>
        <p className="text-xs text-text-secondary">
          {new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
        </p>
      </div>
      <p className="text-sm font-mono font-medium text-text-primary shrink-0">Rp{amount.toLocaleString('id-ID')}</p>
    </div>
  );
}