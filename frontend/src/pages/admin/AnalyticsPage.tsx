import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getDailyVisits, getPeakHours, getMemberGrowth } from '../../api/analytics';
import { getDropInDailyStats } from '../../api/dropin';
import type { DailyVisit, PeakHour, MemberGrowth } from '../../types/analytics';
import type { DailyDropInStat } from '../../api/dropin';

interface CombinedVisitData {
  date: string;
  memberVisits: number;
  dropInVisits: number;
}

export function AnalyticsPage() {
  const [dailyVisits, setDailyVisits] = useState<DailyVisit[]>([]);
  const [peakHours, setPeakHours] = useState<PeakHour[]>([]);
  const [memberGrowth, setMemberGrowth] = useState<MemberGrowth[]>([]);
  const [dropInStats, setDropInStats] = useState<DailyDropInStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDailyVisits(14), getPeakHours(30), getMemberGrowth(6), getDropInDailyStats(14)])
      .then(([visits, hours, growth, dropIn]) => {
        setDailyVisits(visits);
        setPeakHours(hours);
        setMemberGrowth(growth);
        setDropInStats(dropIn);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <p className="text-text-secondary">Memuat data analytics...</p>;

  const combinedVisitData: CombinedVisitData[] = (() => {
    const dateMap = new Map<string, CombinedVisitData>();

    for (const v of dailyVisits) {
      dateMap.set(v.date, { date: v.date, memberVisits: v.count, dropInVisits: 0 });
    }

    for (const d of dropInStats) {
      const existing = dateMap.get(d.date);
      if (existing) {
        existing.dropInVisits = d.count;
      } else {
        dateMap.set(d.date, { date: d.date, memberVisits: 0, dropInVisits: d.count });
      }
    }

    return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  })();

  const totalDropInRevenue = dropInStats.reduce((sum, d) => sum + d.revenue, 0);
  const gridColor = '#3A3E46';

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-text-primary">Analytics</h1>

      <div className="flex flex-col gap-6">
        <div className="neu-flat rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-text-primary">Kunjungan Harian (14 hari terakhir)</h2>
            <p className="text-sm text-text-secondary">
              Pendapatan drop-in: <span className="font-mono font-semibold text-secondary">Rp{totalDropInRevenue.toLocaleString('id-ID')}</span>
            </p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={combinedVisitData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: '#9A9DA6' }}
                tickFormatter={(value) => new Date(String(value)).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })}
              />
              <YAxis tick={{ fontSize: 12, fill: '#9A9DA6' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#32363E', border: 'none', borderRadius: 12 }}
                labelFormatter={(value) => new Date(String(value)).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
              />
              <Legend />
              <Line type="monotone" dataKey="memberVisits" stroke="#4A7FFF" strokeWidth={2} name="Member" />
              <Line type="monotone" dataKey="dropInVisits" stroke="#FFDA1A" strokeWidth={2} name="Drop-in" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="neu-flat rounded-xl p-5">
          <h2 className="font-bold mb-4 text-text-primary">Jam Ramai Member (30 hari terakhir)</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={peakHours}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="hour" tick={{ fontSize: 12, fill: '#9A9DA6' }} tickFormatter={(h) => `${h}:00`} />
              <YAxis tick={{ fontSize: 12, fill: '#9A9DA6' }} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: '#32363E', border: 'none', borderRadius: 12 }} labelFormatter={(h) => `Jam ${h}:00`} />
              <Bar dataKey="count" fill="#FFDA1A" name="Check-in" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="neu-flat rounded-xl p-5">
          <h2 className="font-bold mb-4 text-text-primary">Pertumbuhan Member (6 bulan terakhir)</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={memberGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9A9DA6' }} />
              <YAxis tick={{ fontSize: 12, fill: '#9A9DA6' }} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: '#32363E', border: 'none', borderRadius: 12 }} />
              <Bar dataKey="count" fill="#4A7FFF" name="Member Baru" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}