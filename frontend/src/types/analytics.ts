export interface DailyVisit {
  date: string;
  count: number;
}

export interface PeakHour {
  hour: number;
  count: number;
}

export interface MemberGrowth {
  month: string;
  count: number;
}

export interface MemberStats {
  totalVisits: number;
  averageDurationMinutes: number;
  totalDurationMinutes: number;
  recentVisits: { durationMinutes: number | null; createdAt: string }[];
}