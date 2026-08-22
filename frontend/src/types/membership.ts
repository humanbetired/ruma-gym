export interface MembershipPlan {
  id: string;
  name: string;
  durationDays: number;
  price: string;
  isActive: boolean;
  ptSessionQuota: number;
}

export interface Membership {
  id: string;
  userId: string;
  planId: string;
  startDate: string | null;
  endDate: string | null;
  status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'EXPIRED';
  ptSessionsRemaining: number;
  createdAt: string;
  plan: MembershipPlan;
  payment?: Payment;
}

export interface Payment {
  id: string;
  membershipId: string;
  userId: string;
  amount: string;
  proofImageUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  user?: { fullName: string; email: string };
  membership?: Membership;
}