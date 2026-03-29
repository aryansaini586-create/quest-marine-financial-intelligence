import { TrendingUp, TrendingDown, Users, DollarSign, Clock, FileText, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import data from '../../data/financials.json';

const fmt = (n) => n >= 1000000 ? (n / 1000000).toFixed(2) + 'M' : n >= 1000 ? (n / 1000).toFixed(0) + 'K' : n?.toFixed(0);
const pct = (n) => (n * 100).toFixed(1) + '%';

const COLORS = ['#003366', '#007B8A', '#D4A843', '#4A90D9', '#2ECC71', '#E74C3C', '#9B59B6', '#F39C12', '#1ABC9C', '#E67E22', '#3498DB', '#95A5A6'];

function KPI({ label, value, change, icon: Icon, trend, badge }) {
  const isUp = change > 0;
  return (
    <div className="kpi-card">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</span>
        {badge && <span className="badge-unaudited text-[10px]">⚠️ {badge}</span>}
        {!badge && Icon && <Icon className="w-4 h-4 text-gray-400" />}
      </div>
      <div className="font-display text-2xl font-bold text-navy-900 dark:text-white">{value}</div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${(trend === 'good' ? isUp : !isUp) ? 'text-emerald-600' : 'text-red-500'}`}>
          {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {isUp ? '+' : ''}{typeof change === 'number' ? change.toFixed(1) : change}%
        </div>
      )}
    </div>
  );
}

export default function DashboardView() {
  const { pnl, pipeline, balance_sheet: bs, detailed_pnl: dp } = data;
  const rev24 = pnl.revenue[5], rev23 = pnl.revenue[4], rev25 = pnl.revenue[6];
  const np24 = pnl.net_profit[5], np23 = pnl.net_profit[4], np25 = pnl.net_profit[6];
  const revGrowth24 = ((rev24 - rev23) / rev23) * 100;
  const revGrowth25 = ((rev25 - rev24) / rev24) * 100;
  const margin24 = (np24 / rev24) * 100;
  const margin25 = (np25 / rev25) * 100;
  const revPerEmp24 = rev24 / 18;
  const revPerEmp25 = rev25 / 16;
  const dso24 = (bs.trade_receivables_gross[2] / rev24) * 365;

  const revenueChartData = pnl.years.map((y, i) => ({
    year: y, Revenue: pnl.revenue[i] / 1000000, Profit: pnl.net_profit[i] / 1000000
  }));

  const marginData = ['2022','2023','2024'].map((y, i) => ({
    year: y,
    'Gross Margin': ((pnl.gross_profit[i+3] / pnl.revenue[i+3]) * 100),
    'Net Margin': ((pnl.net_profit[i+3] / pnl.revenue[i+3]) * 100)
  }));

  const costData = [
    { name: 'Salaries', value: dp.salary_expenses[2], color: '#003366' },
    { name: 'Mgmt Remun.', value: dp.mgmt_remuneration[2], color: '#007B8A' },
    { name: 'Sub-contract', value: dp.subcontracting[2], color: '#D4A843' },
    { name: 'Payroll Admin', value: dp.payroll_admin[2], color: '#4A90D9' },
    { name: 'Survey Exp', value: dp.survey_expenses[2], color: '#2ECC71' },
    { name: 'Rent', value: dp.office_rent[2], color: '#E74C3C' },
    { name: 'Insurance', value: dp.insurance[2], color: '#9B59B6' },
    { name: 'Other', value: dp.selling_bdm[2] + dp.travelling[2] + dp.office_expenses[2] + dp.other_expenses[2] + dp.communication[2] + dp.utility[2] + dp.bank_charges[2] + dp.legal_professional[2], color: '#95A5A6' },
  ];

  const geoData = Object.entries(data.geographic_revenue.data).map(([country, vals]) => ({
    country, value: vals[2]
  })).filter(d => d.value > 0).sort((a, b) => b.value - a.value);

  const pipelineData = pipeline.years.map((y, i) => ({
    year: y, Enquiries: pipeline.enquiries[i], Jobs: pipeline.jobs[i], Invoiced: pipeline.invoiced[i]
  }));

  return (
    <div className="mt-6 space-y-6 animate-fade-in">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Revenue 2025" value={`AED ${fmt(rev25)}`} change={revGrowth25} icon={DollarSign} trend="good" badge="Unaudited" />
        <KPI label="Net Profit 2025" value={`AED ${fmt(np25)}`} change={((np25 - np24) / np24 * 100)} icon={TrendingUp} trend="good" badge="Unaudited" />
        <KPI label="Rev/Employee" value={`AED ${fmt(revPerEmp25)}`} change={((revPerEmp25 - revPerEmp24) / revPerEmp24 * 100)} icon={Users} trend="good" badge="2025" />
        <KPI label="DSO (2024)" value={`${dso24.toFixed(0)} days`} icon={Clock} trend="bad" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue & Profit Trend */}
        <div className="glass-card p-6">
          <h3 className="font-display font-bold text-sm mb-4">Revenue & Profit Trend (AED M)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueChartData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#003366" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#003366" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => `AED ${v.toFixed(2)}M`} />
              <Legend />
              <Area type="monotone" dataKey="Revenue" stroke="#003366" fill="url(#colorRev)" strokeWidth={2.5} />
              <Area type="monotone" dataKey="Profit" stroke="#D4A843" fill="#D4A843" fillOpacity={0.1} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Cost Breakdown */}
        <div className="glass-card p-6">
          <h3 className="font-display font-bold text-sm mb-4">Cost Structure 2024</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={costData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {costData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip formatter={(v) => `AED ${fmt(v)}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Margin Trend */}
        <div className="glass-card p-6">
          <h3 className="font-display font-bold text-sm mb-4">Margin Trends (%)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={marginData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} domain={[0, 60]} />
              <Tooltip formatter={(v) => `${v.toFixed(1)}%`} />
              <Legend />
              <Line type="monotone" dataKey="Gross Margin" stroke="#007B8A" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Net Margin" stroke="#D4A843" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Geographic Revenue */}
        <div className="glass-card p-6">
          <h3 className="font-display font-bold text-sm mb-4">Revenue by Geography 2024</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={geoData.slice(0, 8)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => fmt(v)} />
              <YAxis type="category" dataKey="country" width={80} tick={{ fontSize: 11 }} />
              <Tooltip formatter={v => `AED ${fmt(v)}`} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {geoData.slice(0, 8).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pipeline */}
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="font-display font-bold text-sm mb-4">Enquiry → Job → Invoice Pipeline</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={pipelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Enquiries" fill="#003366" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Jobs" fill="#007B8A" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Invoiced" fill="#D4A843" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
