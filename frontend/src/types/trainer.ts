export interface TrainerProfile {
  id: string;
  userId: string;
  bio: string | null;
  specialty: string | null;
  photoUrl: string | null;
  isActive: boolean;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  facebookUrl: string | null;
  whatsappUrl: string | null;
  user?: { fullName: string; email?: string; phone?: string };
}

export interface TrainerSchedule {
  id: string;
  trainerId: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export interface PtBooking {
  id: string;
  memberId: string;
  trainerId: string;
  scheduleId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  notes: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  trainer?: TrainerProfile;
  member?: { fullName: string; phone?: string; email?: string };
  schedule?: TrainerSchedule;
}