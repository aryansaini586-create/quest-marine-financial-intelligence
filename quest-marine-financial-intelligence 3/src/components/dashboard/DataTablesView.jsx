import { useState } from 'react';
import { Download, AlertTriangle } from 'lucide-react';
import data from '../../data/financials.json';

const fmt = (n) => {
  if (n === null || n === undefined) return '—';
  if (n < 0) return `(${Math.abs(n).toLocaleString()})`;
  return n.toLocaleString();
};

function DataTable({ title, headers, rows, badge }) {
  const exportCSV = () => {
    const csv = [headers.join(','), ...rows.map(r => r.map(c => typeof c === 'string' && c.includes(',') ? `"${c}"` : c).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${title.replace(/\s+/g, '_')}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-card p-5 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-display font-bold text-sm">{title}</h3>
          {badge && <span className="badge-unaudited text-[10px]">⚠️ {badge}</span>}
        </div>
        <button onClick={exportCSV} className="btn-outline text-xs py-1 px-2 flex items-center gap-1">
          <Download className="w-3 h-3" /> CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b-2 border-gray-200 dark:border-white/10">
              {headers.map((h, i) => (
                <th key={i} className={`py-2 px-2 font-display font-semibold text-gray-500 uppercase tracking-wide ${i === 0 ? 'text-left' : 'text-right'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className={`border-b border-gray-100 dark:border-white/5 ${row[0]?.toString().startsWith('**') ? 'font-bold bg-gray-50 dark:bg-white/5' : ''}`}>
                {row.map((cell, ci) => (
                  <td key={ci} className={`py-1.5 px-2 ${ci === 0 ? 'text-left' : 'text-right font-mono'} ${typeof cell === 'number' && cell < 0 ? 'text-red-500' : ''}`}>
                    {typeof cell === 'string' ? cell.replace(/\*\*/g, '') : fmt(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DataTablesView() {
  const [tab, setTab] = useState('pnl');
  const { pnl, balance_sheet: bs, detailed_pnl: dp, pipeline, jobs_by_type: jbt } = data;

  const pnlRows = [
    ['**Revenue**', ...pnl.revenue.map(fmt)],
    ['Cost of Revenue', ...pnl.cost_of_revenue.map(v => v ? fmt(-v) : '—')],
    ['**Gross Profit**', ...pnl.gross_profit.map(fmt)],
    ['Selling Expense', ...pnl.selling_expense.map(v => v ? fmt(-v) : '—')],
    ['Admin Expenses', ...pnl.admin_expenses.map(v => v ? fmt(-v) : '—')],
    ['Other Expenses', ...pnl.other_expenses.map(v => v ? fmt(-v) : '—')],
    ['Mgmt Remuneration', ...pnl.mgmt_remuneration.map(v => v ? fmt(-v) : '—')],
    ['**Net Profit**', ...pnl.net_profit.map(fmt)],
    ['Staff Count', ...pnl.staff_count.map(v => v || '—')],
    ['Rev/Employee', ...pnl.years.map((_, i) => pnl.staff_count[i] ? fmt(Math.round(pnl.revenue[i] / pnl.staff_count[i])) : '—')],
    ['Net Margin %', ...pnl.years.map((_, i) => `${(pnl.net_profit[i] / pnl.revenue[i] * 100).toFixed(1)}%`)],
  ];

  const bsRows = [
    ['**Assets**', '', '', ''],
    ['PP&E', ...bs.ppe.map(fmt)],
    ['Non-current Financial', ...bs.non_current_financial.map(fmt)],
    ['Trade Receivables (net)', ...bs.trade_receivables_net.map(fmt)],
    ['Cash & Equivalents', ...bs.total_cash.map(fmt)],
    ['Prepaid + WIP + Advances', ...bs.years.map((_, i) => fmt(bs.advances_staff[i] + bs.prepaid[i] + bs.wip[i] + (bs.advances_suppliers[i] || 0)))],
    ['**Total Assets**', ...bs.total_assets.map(fmt)],
    ['', '', '', ''],
    ['**Equity & Liabilities**', '', '', ''],
    ['Share Capital', ...bs.share_capital.map(fmt)],
    ['Statutory Reserve', ...bs.statutory_reserve.map(fmt)],
    ['Retained Earnings', ...bs.retained_earnings.map(fmt)],
    ['Shareholder Current A/c', ...bs.shareholder_current_accounts.map(fmt)],
    ['**Total Shareholders Funds**', ...bs.total_shareholders_funds.map(fmt)],
    ['Gratuity Provision', ...bs.gratuity_provision.map(fmt)],
    ['Trade Payables', ...bs.trade_payables.map(fmt)],
    ['**Total Liabilities**', ...bs.total_liabilities.map(fmt)],
  ];

  const detailRows = dp.years.map((_, i) => [
    dp.salary_expenses[i], dp.mgmt_remuneration[i], dp.subcontracting[i], dp.survey_expenses[i],
    dp.payroll_admin[i], dp.office_rent[i], dp.insurance[i] + (dp.insurance_family[i] || 0),
    dp.selling_bdm[i], dp.travelling[i], dp.communication[i], dp.legal_professional[i],
    dp.licence[i], dp.office_expenses[i], dp.other_expenses[i], dp.utility[i],
    dp.bank_charges[i], dp.depreciation[i], dp.forex_loss[i], dp.bad_debts[i],
    dp.leave_salary[i], dp.recruitment[i]
  ]);
  const detailLabels = ['Salaries','Mgmt Remuneration','Sub-contracting','Survey Expenses','Payroll (Admin)','Office Rent','Insurance','Selling/BDM','Travel','Communication','Legal & Prof.','Licence','Office Exp','Other Exp','Utility','Bank Charges','Depreciation','Forex Loss','Bad Debts','Leave Salary','Recruitment'];
  const costRows = detailLabels.map((label, li) => [label, ...detailRows.map(yr => yr[li])]);
  costRows.push(['**Total Indirect**', ...dp.total_indirect]);

  const pipeRows = pipeline.years.map((y, i) => [
    y, pipeline.enquiries[i], pipeline.jobs[i], pipeline.invoiced[i], pipeline.pending[i],
    `${(pipeline.jobs[i] / pipeline.enquiries[i] * 100).toFixed(1)}%`,
    `${(pipeline.invoiced[i] / pipeline.jobs[i] * 100).toFixed(1)}%`
  ]);

  const tabs = [
    { id: 'pnl', label: 'Income Statement' },
    { id: 'bs', label: 'Balance Sheet' },
    { id: 'costs', label: 'Cost Details' },
    { id: 'pipeline', label: 'Pipeline' },
  ];

  return (
    <div className="mt-6 space-y-4 animate-fade-in">
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`nav-tab text-xs ${tab === t.id ? 'nav-tab-active' : 'nav-tab-inactive'}`}>{t.label}</button>
        ))}
      </div>

      {tab === 'pnl' && <DataTable title="Income Statement (7 Years)" badge="2025 Unaudited" headers={['Particulars', ...pnl.years]} rows={pnlRows} />}
      {tab === 'bs' && <DataTable title="Balance Sheet" headers={['Particulars', ...bs.years]} rows={bsRows} />}
      {tab === 'costs' && <DataTable title="Detailed Cost Breakdown" badge="2025 Unaudited" headers={['Expense', ...dp.years.map(y => y === '2025' ? '2025*' : y)]} rows={costRows} />}
      {tab === 'pipeline' && <DataTable title="Enquiry → Job → Invoice Pipeline" headers={['Year','Enquiries','Jobs','Invoiced','Pending','Enq→Job','Job→Inv']} rows={pipeRows} />}
    </div>
  );
}
