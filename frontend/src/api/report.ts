import { api } from './axios';
import type { FinancialReport } from '../types/report';

export async function getFinancialReport(from: string, to: string): Promise<FinancialReport> {
  const res = await api.get<FinancialReport>('/analytics/financial-report', {
    params: { from, to },
  });
  return res.data;
}