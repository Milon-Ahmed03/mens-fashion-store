import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiDownload } from 'react-icons/fi';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api, { errMsg } from '../services/api';
import PageHeader from '../components/PageHeader';
import Spinner from '../components/Spinner';
import { exportCSV, money } from '../utils/helpers';

const isoDay = (d) => d.toLocaleDateString('en-CA');

export default function Reports() {
  const today = new Date();
  const monthAgo = new Date(Date.now() - 29 * 86400000);
  const [range, setRange] = useState({ from: isoDay(monthAgo), to: isoDay(today) });
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api.get(`/admin/reports/sales?from=${range.from}&to=${range.to}`).then((r) => setReport(r.data)).catch((e) => toast.error(errMsg(e))).finally(() => setLoading(false));
  }, [range]);

  useEffect(() => {
    load();
  }, [load]);

  const s = report?.summary;
  return (
    <div>
      <PageHeader title="Sales Reports" subtitle="Cancelled and returned orders are not counted">
        <button className="btn-outline btn-sm" disabled={!report} onClick={() => exportCSV('sales-report.csv', report.daily.map((d) => ({ Date: d.date, Orders: d.orders, Sales: d.sales })))}><FiDownload /> Daily CSV</button>
        <button className="btn-outline btn-sm" disabled={!report} onClick={() => exportCSV('top-products.csv', report.topProducts.map((p) => ({ Product: p.name, Sold: p.sold, Revenue: p.revenue })))}><FiDownload /> Products CSV</button>
      </PageHeader>

      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div><label className="label">From</label><input type="date" className="input" value={range.from} max={range.to} onChange={(e) => setRange({ ...range, from: e.target.value })} /></div>
        <div><label className="label">To</label><input type="date" className="input" value={range.to} min={range.from} onChange={(e) => setRange({ ...range, to: e.target.value })} /></div>
      </div>

      {loading || !report ? <Spinner /> : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            {[['Orders', s.orders], ['Sales', money(s.sales)], ['Avg. Order', money(s.average)], ['Discounts Given', money(s.discount)], ['Shipping Collected', money(s.shipping)]].map(([l, v]) => (
              <div key={l} className="card p-4"><p className="text-xs uppercase text-gray-500">{l}</p><p className="mt-1 text-xl font-bold">{v}</p></div>
            ))}
          </div>
          <div className="card mt-6 p-5">
            <h2 className="mb-4 font-semibold">Daily sales</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report.daily}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} fontSize={11} />
                  <YAxis fontSize={12} width={55} />
                  <Tooltip formatter={(v, n) => [n === 'sales' ? money(v) : v, n]} />
                  <Bar dataKey="sales" fill="#b08d57" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card mt-6 overflow-x-auto">
            <h2 className="p-5 pb-3 font-semibold">Top products</h2>
            <table className="w-full">
              <thead><tr><th className="th">Product</th><th className="th">Units Sold</th><th className="th">Revenue</th></tr></thead>
              <tbody className="divide-y">
                {report.topProducts.map((p) => <tr key={p._id}><td className="td font-medium">{p.name}</td><td className="td">{p.sold}</td><td className="td">{money(p.revenue)}</td></tr>)}
                {report.topProducts.length === 0 && <tr><td colSpan="3" className="td py-8 text-center text-gray-500">No sales in this period.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
