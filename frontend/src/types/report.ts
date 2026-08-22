export interface FinancialReportCategory {
  total: number;
  count: number;
}

export interface FinancialReportSummary {
  membership: FinancialReportCategory;
  dropIn: FinancialReportCategory;
  warung: FinancialReportCategory;
  grandTotal: number;
}

export interface MembershipDetail {
  date: string;
  memberName: string;
  planName: string;
  amount: number;
}

export interface DropInDetail {
  date: string;
  visitorName: string;
  amount: number;
}

export interface WarungDetail {
  date: string;
  recordedBy: string;
  items: string;
  amount: number;
}

export interface FinancialReport {
  period: { from: string; to: string };
  summary: FinancialReportSummary;
  details: {
    membership: MembershipDetail[];
    dropIn: DropInDetail[];
    warung: WarungDetail[];
  };
}