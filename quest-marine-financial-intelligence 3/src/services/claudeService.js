import data from '../data/financials.json';

const { pnl, detailed_pnl: dp, balance_sheet: bs, pipeline, jobs_by_type: jbt, geographic_revenue: geo, monthly_revenue: mr, receivables_ageing: ra } = data;

const fmt = (n) => {
  if (n === null || n === undefined) return 'N/A';
  if (Math.abs(n) >= 1000000) return `AED ${(n / 1000000).toFixed(2)}M`;
  if (Math.abs(n) >= 1000) return `AED ${(n / 1000).toFixed(0)}K`;
  return `AED ${n.toFixed(0)}`;
};
const yoy = (c, p) => p ? `${((c - p) / p * 100).toFixed(1)}%` : '';

const R = {
  revenue_trend: () => {
    let l = ['**Quest Marine Revenue Trend (7 Years)**\n'];
    pnl.years.forEach((y, i) => {
      const g = i > 0 ? ` (${yoy(pnl.revenue[i], pnl.revenue[i-1])} YoY)` : '';
      const b = y === '2025' ? ' ⚠️ Unaudited' : '';
      l.push(`- **${y}**: ${fmt(pnl.revenue[i])}${g}${b}`);
    });
    l.push('\n**Insight:** Revenue grew 90% over 7 years (AED 4.11M → 7.80M). Growth accelerated to 18-19% in 2024-2025.');
    l.push('\n**Challenge:** Costs grew faster than revenue in 2022-2024, compressing margins. 2025 shows recovery.');
    return l.join('\n');
  },
  profit_trend: () => {
    let l = ['**Net Profit Trend**\n'];
    pnl.years.forEach((y, i) => {
      const m = `${(pnl.net_profit[i] / pnl.revenue[i] * 100).toFixed(1)}% margin`;
      l.push(`- **${y}**: ${fmt(pnl.net_profit[i])} (${m})${y==='2025'?' ⚠️':''}`);
    });
    l.push('\n**Critical:** Profit DECLINED from AED 750K (2019) to AED 327K (2024) despite revenue growing. Classic margin compression.');
    l.push('\n**Recovery:** 2025 profit doubled to AED 678K. Root cause of decline: staff costs + mgmt remuneration grew from ~AED 3.2M to ~AED 4.8M.');
    return l.join('\n');
  },
  rev_per_emp: () => {
    let l = ['**Revenue per Employee**\n'];
    pnl.years.forEach((y, i) => { if (pnl.staff_count[i]) l.push(`- **${y}**: ${fmt(pnl.revenue[i]/pnl.staff_count[i])} (${pnl.staff_count[i]} staff)${y==='2025'?' ⚠️':''}`); });
    l.push('\n**Analysis:** Dropped from AED 446K (2022) to AED 363K (2024) as headcount grew 50%. Recovered to AED 487K in 2025 after optimization to 16 staff.');
    return l.join('\n');
  },
  cost_structure: () => {
    const y = 2;
    const items = [['Salaries',dp.salary_expenses[y]],['Mgmt Remuneration',dp.mgmt_remuneration[y]],['Sub-contracting',dp.subcontracting[y]],['Payroll Admin',dp.payroll_admin[y]],['Survey Expenses',dp.survey_expenses[y]],['Rent',dp.office_rent[y]],['Insurance',dp.insurance[y]],['Travel',dp.travelling[y]],['Bad Debts',dp.bad_debts[y]],['Forex Loss',dp.forex_loss[y]]].sort((a,b)=>b[1]-a[1]);
    let l = ['**Cost Breakdown — 2024**\n'];
    items.forEach(([n,v]) => { if(v>0) l.push(`- **${n}**: ${fmt(v)} (${(v/pnl.revenue[5]*100).toFixed(1)}% of revenue)`); });
    l.push('\n**Key:** Staff costs + mgmt remuneration = 62% of revenue. This is the main profitability lever.');
    return l.join('\n');
  },
  cash: () => {
    const dso = (bs.trade_receivables_gross[2]/pnl.revenue[5])*365;
    let l = ['**Cash & Receivables Analysis**\n'];
    bs.years.forEach((y,i) => l.push(`- **${y}**: Cash ${fmt(bs.total_cash[i])} | Receivables ${fmt(bs.trade_receivables_net[i])} | Payables ${fmt(bs.trade_payables[i])}`));
    l.push(`\n**DSO:** ${dso.toFixed(0)} days — clients take ~4.4 months to pay.`);
    l.push('**Operating Cash Flow 2024:** Nearly zero (-AED 319). Receivables grew AED 454K, absorbing all profit.');
    l.push('\n**Action:** Tighten collections. Consider early payment discounts. Monitor aged receivables > 6 months.');
    return l.join('\n');
  },
  geo: () => {
    let l = ['**Revenue by Geography (2024)**\n'];
    Object.entries(geo.data).map(([c,v])=>[c,v[2]]).filter(e=>e[1]>0).sort((a,b)=>b[1]-a[1]).forEach(([c,v])=>l.push(`- **${c}**: ${fmt(v)} (${(v/pnl.revenue[5]*100).toFixed(1)}%)`));
    l.push('\n**Trend:** UK declining (46%→35%), Singapore growing (6%→11%). New markets: Italy, USA opened in 2024.');
    return l.join('\n');
  },
  pipe: () => {
    let l = ['**Enquiry → Job → Invoice Pipeline**\n'];
    pipeline.years.forEach((y,i) => l.push(`- **${y}**: ${pipeline.enquiries[i]} enq → ${pipeline.jobs[i]} jobs (${(pipeline.jobs[i]/pipeline.enquiries[i]*100).toFixed(0)}%) → ${pipeline.invoiced[i]} inv | Pending: ${pipeline.pending[i]}`));
    l.push('\n**Growth:** Enquiries up 72% (729→1252) from 2023 to 2025. Business development working.');
    return l.join('\n');
  },
  jobs: () => {
    let l = ['**Jobs by Service Type**\n'];
    jbt.types.map((t,i)=>[t,jbt['2022'][i],jbt['2023'][i],jbt['2024'][i],jbt['2025'][i]]).sort((a,b)=>b[4]-a[4]).slice(0,8).forEach(([t,a,b,c,d])=>l.push(`- **${t}**: ${a}→${b}→${c}→${d}`));
    l.push('\n**Growth Engine:** Hull & P&I Damage Surveys: 102→413 (4x in 3 years). Cargo Damage declining.');
    return l.join('\n');
  },
  breakeven: () => {
    const j=pipeline.jobs[3], af=pnl.revenue[6]/j, sc=dp.subcontracting[3]/j;
    const fc=dp.salary_expenses[3]+dp.mgmt_remuneration[3]+dp.payroll_admin[3]+dp.office_rent[3]+dp.insurance[3]+dp.communication[3]+dp.legal_professional[3]+dp.licence[3]+dp.office_expenses[3]+dp.other_expenses[3]+dp.utility[3]+dp.bank_charges[3]+dp.depreciation[3];
    const be=Math.ceil(fc/(af-sc));
    let l = ['**Break-Even Analysis (2025 ⚠️)**\n',`- Avg fee/job: ${fmt(af)}`,`- Variable cost/job: ${fmt(sc)}`,`- Contribution/job: ${fmt(af-sc)}`,`- Fixed costs: ${fmt(fc)}`,`- **Break-even: ${be} jobs**`,`- Actual: ${j} jobs`,`- **Safety margin: ${((j-be)/j*100).toFixed(1)}%**`];
    return l.join('\n');
  },
  health: () => {
    let l = ['**Financial Health Summary**\n','**Strengths:**','- Revenue at ATH: AED 6.54M (+18%)','- Zero debt','- Strong current ratio: 8.7x','- Growing client base: 57 clients','- Geographic diversification improving\n','**Concerns:**','- Net margin compressed to 5% (was 14.5%)','- Operating cash flow nearly zero','- DSO ~130 days','- Bad debts: AED 64K (new in 2024)','- Staff costs growing faster than revenue\n','**2025 ⚠️:** Strong recovery — AED 7.80M revenue, AED 678K profit, margin 8.7%'];
    return l.join('\n');
  },
  zscore: () => {
    const ta=bs.total_assets[2],wc=(bs.trade_receivables_net[2]+bs.total_cash[2])-bs.trade_payables[2];
    const re=bs.retained_earnings[2],ebit=pnl.net_profit[5]+(pnl.depreciation[5]||0);
    const eq=bs.equity_funds[2],tl=bs.total_liabilities[2],s=pnl.revenue[5];
    const x1=wc/ta,x2=re/ta,x3=ebit/ta,x4=eq/tl,x5=s/ta;
    const z=0.717*x1+0.847*x2+3.107*x3+0.420*x4+0.998*x5;
    const zone=z>2.9?'Safe Zone':z>1.23?'Grey Zone':'Distress Zone';
    let l = [`**Altman Z'-Score (2024): ${z.toFixed(2)} — ${zone}**\n`,`- X1: ${x1.toFixed(3)} | X2: ${x2.toFixed(3)} | X3: ${x3.toFixed(3)} | X4: ${x4.toFixed(3)} | X5: ${x5.toFixed(3)}`,'\n**⚠️ Disclaimer:** Z-Score was designed for manufacturing firms. QM is asset-light (PPE=AED 27K). The high score is driven by Sales/Assets ratio. Better health indicators: Rev/Employee, margin trend, DSO.'];
    return l.join('\n');
  },
  monthly: () => {
    let l = ['**Monthly Revenue 2025 ⚠️**\n'];
    mr['2025'].months.forEach((m,i)=>l.push(`- **${m}**: ${fmt(mr['2025'].sales[i])}`));
    l.push('\n**Pattern:** Aug & Dec strongest. Apr weakest. Revenue fairly well-distributed — no extreme seasonality.');
    return l.join('\n');
  },
  scenario_hire: () => {
    const as=dp.salary_expenses[3]/16, rps=pnl.revenue[6]/12;
    let l = ['**Scenario: Add 3 Surveyors**\n',`- Cost/surveyor: ~${fmt(as)}/yr`,`- Additional cost: ~${fmt(as*3)}`,`- Rev/surveyor: ~${fmt(rps)}`,`- Year 1 (70% productivity): +${fmt(rps*3*0.7)} revenue`,`- Net impact Y1: ${fmt(rps*3*0.7-as*3)}`,'\n**Advice:** Only hire if pipeline supports it. Current enquiry growth (+22% YoY) suggests demand exists. Hire 1-2 first.'];
    return l.join('\n');
  },
};

const KW = [
  {k:['revenue trend','revenue growth','sales trend','top line','revenue over'],f:'revenue_trend'},
  {k:['profit trend','profit decline','net profit','bottom line','profitability','margin decline','why profit','driving margin'],f:'profit_trend'},
  {k:['revenue per employee','per employee','efficiency','productivity','rev/emp'],f:'rev_per_emp'},
  {k:['cost structure','cost breakdown','break down cost','biggest cost','biggest expense','where money'],f:'cost_structure'},
  {k:['cash position','cash flow','liquidity','operating cash','bank balance'],f:'cash'},
  {k:['dso','days sales','collection','receivable','ageing','aging','clients pay'],f:'cash'},
  {k:['geographic','geography','country','region','where revenue','uk revenue','singapore'],f:'geo'},
  {k:['pipeline','enquiry','enquiries','conversion','invoiced','pending'],f:'pipe'},
  {k:['job type','service type','service mix','hull','cargo damage','survey type','what services'],f:'jobs'},
  {k:['break even','breakeven','break-even','how many jobs','minimum jobs'],f:'breakeven'},
  {k:['health','overall','summary','how are we','current status','strengths','weakness','financial health'],f:'health'},
  {k:['z-score','zscore','z score','altman','bankruptcy','distress'],f:'zscore'},
  {k:['monthly','seasonality','month by month','which month'],f:'monthly'},
  {k:['benchmark','compare','industry','peers','competitor','abl'],f:'health'},
  {k:['add surveyor','hire','new surveyor','add 3','more staff','recruit'],f:'scenario_hire'},
  {k:['sub-contract','subcontract','outsourc'],f:'cost_structure'},
  {k:['dividend','payout','distribution'],f:'profit_trend'},
];

export async function sendMessage(messages) {
  const q = messages[messages.length - 1]?.content?.toLowerCase() || '';
  if (['hi','hello','hey','good morning','good afternoon','good evening'].some(g => q.startsWith(g)))
    return "Hello! I'm Quest Marine's Financial Intelligence Assistant with 7 years of data.\n\nTry asking:\n- \"What is our revenue trend?\"\n- \"Break down our cost structure\"\n- \"How many jobs to break even?\"\n- \"What's our Z-Score?\"\n- \"Show monthly revenue\"";
  for (const e of KW) { if (e.k.some(k => q.includes(k))) return R[e.f](); }
  if (q.includes('revenue')||q.includes('sales')) return R.revenue_trend();
  if (q.includes('profit')||q.includes('margin')) return R.profit_trend();
  if (q.includes('cost')||q.includes('expense')) return R.cost_structure();
  if (q.includes('employee')||q.includes('staff')) return R.rev_per_emp();
  if (q.includes('cash')||q.includes('bank')) return R.cash();
  if (q.includes('job')||q.includes('survey')) return R.jobs();
  return "I can analyze Quest Marine's financials! Ask about:\n\n**📊 Financial:** Revenue trends, profit analysis, cost breakdown, revenue per employee, cash position, DSO\n**🗺️ Geographic:** Revenue by country\n**📈 Pipeline:** Enquiry→Job→Invoice conversion\n**🔮 Scenarios:** Break-even, hiring impact, Z-Score\n**📅 Monthly:** Revenue seasonality\n\nJust type your question!";
}
