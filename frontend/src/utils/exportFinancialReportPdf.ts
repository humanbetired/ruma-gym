import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { FinancialReport } from '../types/report';

function formatCurrency(amount: number): string {
  return `Rp${amount.toLocaleString('id-ID')}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function exportFinancialReportPdf(report: FinancialReport) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Laporan Keuangan Ganesha Gym', pageWidth / 2, 18, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const periodText = `Periode: ${formatDate(report.period.from)} — ${formatDate(report.period.to)}`;
  doc.text(periodText, pageWidth / 2, 25, { align: 'center' });

  autoTable(doc, {
    startY: 32,
    head: [['Kategori', 'Jumlah Transaksi', 'Total']],
    body: [
      ['Membership', String(report.summary.membership.count), formatCurrency(report.summary.membership.total)],
      ['Drop-in Visitor', String(report.summary.dropIn.count), formatCurrency(report.summary.dropIn.total)],
      ['Warung', String(report.summary.warung.count), formatCurrency(report.summary.warung.total)],
    ],
    foot: [['Grand Total', '', formatCurrency(report.summary.grandTotal)]],
    theme: 'grid',
    headStyles: { fillColor: [0, 51, 153] },
    footStyles: { fillColor: [255, 218, 26], textColor: [17, 17, 17], fontStyle: 'bold' },
  });

  let currentY = (doc as any).lastAutoTable.finalY + 12;

  if (report.details.membership.length > 0) {
    currentY = addDetailSection(doc, currentY, 'Rincian Membership', ['Tanggal', 'Member', 'Paket', 'Jumlah'], report.details.membership.map((item) => [
      formatDate(item.date),
      item.memberName,
      item.planName,
      formatCurrency(item.amount),
    ]));
  }

  if (report.details.dropIn.length > 0) {
    currentY = addDetailSection(doc, currentY, 'Rincian Drop-in Visitor', ['Tanggal', 'Nama Pengunjung', 'Jumlah'], report.details.dropIn.map((item) => [
      formatDate(item.date),
      item.visitorName,
      formatCurrency(item.amount),
    ]));
  }

  if (report.details.warung.length > 0) {
    addDetailSection(doc, currentY, 'Rincian Warung', ['Tanggal', 'Barang', 'Dicatat Oleh', 'Jumlah'], report.details.warung.map((item) => [
      formatDate(item.date),
      item.items,
      item.recordedBy,
      formatCurrency(item.amount),
    ]));
  }

  const fileName = `Laporan-Keuangan-${report.period.from.split('T')[0]}_${report.period.to.split('T')[0]}.pdf`;
  doc.save(fileName);
}

function addDetailSection(
  doc: jsPDF,
  startY: number,
  title: string,
  head: string[],
  body: string[][],
): number {
  const pageHeight = doc.internal.pageSize.getHeight();

  if (startY > pageHeight - 40) {
    doc.addPage();
    startY = 20;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, startY);

  autoTable(doc, {
    startY: startY + 4,
    head: [head],
    body,
    theme: 'striped',
    headStyles: { fillColor: [42, 45, 52] },
    styles: { fontSize: 9 },
  });

  return (doc as any).lastAutoTable.finalY + 12;
}