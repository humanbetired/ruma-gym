export interface DropInVisit {
  id: string;
  visitorName: string;
  visitorPhone: string | null;
  amount: string;
  checkInTime: string;
  checkOutTime: string | null;
  recordedBy: string;
  recordedByUser?: { fullName: string };
  createdAt: string;
}