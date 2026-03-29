import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { Calculator, TrendingUp, AlertTriangle } from 'lucide-react';
import data from '../../data/financials.json';

const PRESETS = {
  base: { revenueGrowth: 15, costGrowth: 12, scGrowth: 5, mgmtGrowth: 10, label: 'Base Case' },
  bull: { revenueGrowth: 25, costGrowth: 10, scGrowth: 0, mgmtGrowth: 5, label: 'Growth Case' },
  bear: { revenueGrowth: 5, costGrowth: 18, scGrowth: 15, mgmtGrowth: 15, label: 'Contraction' },
  stress: { revenueGrowth: -10, costGrowth: 20, scGrowth: 25, mgmtGrowth: 20, label: 'Stress Test' },
};

function Slider({ label, value, onChange, min, max, unit = '%' }) {
  const color = value >= 0 ? 'text-emerald-600' : 'text-red-500';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className={`font-mono font-bold ${color}`}>{value > 0 ? '+' : ''}{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-teal-500" />
    </div>
  );
}

export default function ScenarioView() {
  const [revenueGrowth, setRevenueGrowth] = useState(15);
  const [costGrowth, setCostGrowth] = useState(12);
  const [scGrowth, setScGrowth] = useState(5);
  const [mgmtGrowth, setMgmtGrowth] = useState(10);

  const base = {
    revenue: data.pnl.revenue[6],
    salary: data.detailed_pnl.salary_expenses[3],
    sc: data.detailed_pnl.subcontracting[3],
    mgmt: data.detailed_pnl.mgmt_remuneration[3],
    overhead: 5959651 - 3337913 - 1440000 - 872214,
    profit: data.pnl.net_profit[6]
  };

  const fmt = (n) => n >= 1000000 ? `${(n / 1000000).toFixed(2)}M` : n >= 1000 ? `${(n / 1000).toFixed(0)}K` : n.toFixed(0);

  const projections = useMemo(() => {
    const years = ['2025 (Actual)', '2026 (Proj)', '2027 (Proj)', '2028 (Proj)'];
    let rev = base.revenue, sal = base.salary, sc = base.sc, mgmt = base.mgmt, oh = base.overhead;
    return years.map((year, i) => {
      if (i > 0) {
        rev *= (1 + revenueGrowth / 100);
        sal *= (1 + costGrowth / 100);
        sc *= (1 + scGrowth / 100);
        mgmt *= (1 + mgmtGrowth / 100);
        oh *= 1.05;
      }
      const totalCost = sal + sc + mgmt + oh;
      const profit = rev - totalCost;
      const margin = (profit / rev) * 100;
      return { year: year.split(' ')[0], Revenue: rev, Costs: totalCost, Profit: profit, Margin: margin, label: year };
    });
  }, [revenueGrowth, costGrowth, scGrowth, mgmtGrowth]);

  const breakeven = useMemo(() => {
    const avgFee = base.revenue / data.pipeline.jobs[3];
    const totalFixedCosts = base.salary + base.mgmt + base.overhead;
    const variableCostPerJob = base.sc / data.pipeline.jobs[3];
    const contributionPerJob = avgFee - variableCostPerJob;
    const beJobs = Math.ceil(totalFixedCosts / contributionPerJob);
    return { avgFee: avgFee.toFixed(0), beJobs, currentJobs: data.pipeline.jobs[3], contributionPerJob: contributionPerJob.toFixed(0) };
  }, []);

  const applyPreset = (key) => {
    const p = PRESETS[key];
    setRevenueGrowth(p.revenueGrowth);
    setCostGrowth(p.costGrowth);
    setScGrowth(p.scGrowth);
    setMgmtGrowth(p.mgmtGrowth);
  };

  const chartData = projections.map(p => ({
    year: p.year, Revenue: p.Revenue / 1000000, Costs: p.Costs / 1000000, Profit: p.Profit / 1000000
  }));

  return (
    <div className="mt-6 space-y-6 animate-fade-in">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="glass-card p-6 space-y-5">
          <h3 className="font-display font-bold text-sm flex items-center gap-2">
            <Calculator className="w-4 h-4 text-teal-500" /> Scenario Controls
          </h3>

          <div className="flex flex-wrap gap-2">
            {Object.entries(PRESETS).map(([key, val]) => (
              <button key={key} onClick={() => applyPreset(key)}
                className="btn-outline text-xs py-1.5 px-3">{val.label}</button>
            ))}
          </div>

          <div className="space-y-4 pt-2">
            <Slider label="Revenue Growth" value={revenueGrowth} onChange={setRevenueGrowth} min={-30} max={40} />
            <Slider label="Salary Cost Growth" value={costGrowth} onChange={setCostGrowth} min={-10} max={30} />
            <Slider label="Sub-contract Growth" value={scGrowth} onChange={setScGrowth} min={-20} max={40} />
            <Slider label="Mgmt Remun. Growth" value={mgmtGrowth} onChange={setMgmtGrowth} min={-10} max={30} />
          </div>

          {/* Break-even */}
          <div className="mt-4 p-4 bg-navy-900/5 dark:bg-white/5 rounded-xl space-y-2">
            <h4 className="font-display font-bold text-xs text-teal-500 uppercase tracking-wide">Break-Even Analysis</h4>
            <div className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
              <p>Avg fee/job: <strong className="text-navy-900 dark:text-white">AED {fmt(Number(breakeven.avgFee))}</strong></p>
              <p>Break-even jobs: <strong className="text-navy-900 dark:text-white">{breakeven.beJobs}</strong></p>
              <p>Current jobs (2025): <strong className="text-navy-900 dark:text-white">{breakeven.currentJobs}</strong></p>
              <p>Margin of safety: <strong className="text-emerald-600">{((breakeven.currentJobs - breakeven.beJobs) / breakeven.currentJobs * 100).toFixed(1)}%</strong></p>
            </div>
          </div>
        </div>

        {/* Projection Chart */}
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-500" /> 3-Year Projection (AED M)
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={v => `AED ${v.toFixed(2)}M`} />
              <Legend />
              <Bar dataKey="Revenue" fill="#003366" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Costs" fill="#E74C3C" radius={[4, 4, 0, 0]} opacity={0.7} />
              <Bar dataKey="Profit" fill="#D4A843" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          {/* Projection Table */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/10">
                  <th className="text-left py-2 font-display font-semibold text-gray-500">Year</th>
                  <th className="text-right py-2 font-display font-semibold text-gray-500">Revenue</th>
                  <th className="text-right py-2 font-display font-semibold text-gray-500">Total Costs</th>
                  <th className="text-right py-2 font-display font-semibold text-gray-500">Net Profit</th>
                  <th className="text-right py-2 font-display font-semibold text-gray-500">Margin</th>
                </tr>
              </thead>
              <tbody>
                {projections.map((p, i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-white/5">
                    <td className="py-2 font-medium">{p.label}</td>
                    <td className="py-2 text-right font-mono">AED {fmt(p.Revenue)}</td>
                    <td className="py-2 text-right font-mono">AED {fmt(p.Costs)}</td>
                    <td className={`py-2 text-right font-mono font-bold ${p.Profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      AED {fmt(p.Profit)}
                    </td>
                    <td className={`py-2 text-right font-mono ${p.Margin >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {p.Margin.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {projections[3]?.Profit < 0 && (
            <div className="mt-3 flex items-center gap-2 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">
              <AlertTriangle className="w-4 h-4" />
              Warning: This scenario results in a loss by {projections[3].year}. Consider adjusting variables.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
