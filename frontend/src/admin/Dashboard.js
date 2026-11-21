import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api, { errMsg } from '../services/api';
import PageHeader from '../components/PageHeader';
import Spinner from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';
import { formatDate, money, onImgError, PLACEHOLDER } from '../utils/helpers';

const PIE_COLORS = ['#eab308', '#3b82f6', '#6366f1', '#a855f7', '#22c55e', '#ef4444', '#6b7280'];

export default function Dashboard() {
  const [s, setS] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/stats').then((r) => setS(r.data)).catch((e) => setError(errMsg(e)));
  }, []);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!s) return <Spinner />;

  const cards = [
    ['Total Sales', money(s.totalSales), 'bg-blue-50 text-blue-700'],
    ['Delivered Revenue', money(s.deliveredRevenue), 'bg-green-50 text-green-700'],
    ['Total Orders', s.totalOrders, 'bg-indigo-50 text-indigo-700'],
    ['Pending Orders', s.pendingOrders, 'bg-yellow-50 text-yellow-700'],
    ['Customers', s.totalCustomers, 'bg-purple-50 text-purple-700'],
    ['Products', s.totalProducts, 'bg-gray-100 text-gray-700'],
    ['Low Stock (≤5)', s.lowStock, 'bg-orange-50 text-orange-700'],
    ['Out of Stock', s.outOfStock, 'bg-red-50 text-red-700'],
  ];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of your store" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(([label, value, color]) => (
          <div key={label} className={`rounded-xl p-4 ${color}`}>
            <p className="text-xs font-medium uppercase tracking-wide opacity-80">{label}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-4 font-semibold">Sales - last 14 days</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={s.salesByDay}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} fontSize={12} />
                <YAxis fontSize={12} width={50} />
                <Tooltip formatter={(v, n) => [n === 'sales' ? money(v) : v, n]} />
                <Area type="monotone" dataKey="sales" stroke="#b08d57" fill="#f6efe3" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-5">
          <h2 className="mb-2 font-semibold">Orders by status</h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={s.statusCounts} dataKey="count" nameKey="_id" innerRadius={45} outerRadius={80}>
                  {s.statusCounts.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs capitalize">
            {s.statusCounts.map((c, i) => (
              <span key={c._id} className="flex items-center gap-1"><i className="inline-block h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />{c._id} ({c.count})</span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card overflow-x-auto lg:col-span-2">
          <div className="flex items-center justify-between p-5 pb-3"><h2 className="font-semibold">Recent Orders</h2><Link to="/admin/orders" className="text-sm text-brand-dark">View all</Link></div>
          <table className="w-full">
            <thead><tr><th className="th">Order</th><th className="th">Customer</th><th className="th">Date</th><th className="th">Total</th><th className="th">Status</th></tr></thead>
            <tbody className="divide-y">
              {s.recentOrders.map((o) => (
                <tr key={o._id}>
                  <td className="td"><Link to={`/admin/orders/${o._id}`} className="font-medium text-brand-dark">{o.orderNumber}</Link></td>
                  <td className="td">{o.user?.name || o.shippingAddress.fullName}</td>
                  <td className="td">{formatDate(o.createdAt)}</td>
                  <td className="td">{money(o.total)}</td>
                  <td className="td"><StatusBadge status={o.status} /></td>
                </tr>
              ))}
              {s.recentOrders.length === 0 && <tr><td className="td text-gray-500" colSpan="5">No orders yet.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="card p-5">
          <h2 className="mb-4 font-semibold">Top Selling Products</h2>
          <div className="space-y-3">
            {s.topProducts.map((p) => (
              <div key={p._id} className="flex items-center gap-3 text-sm">
                <img src={p.image || PLACEHOLDER} alt="" onError={onImgError} className="h-12 w-10 rounded object-cover" />
                <p className="flex-1 truncate">{p.name}</p>
                <span className="font-semibold">{p.sold} sold</span>
              </div>
            ))}
            {s.topProducts.length === 0 && <p className="text-sm text-gray-500">No sales yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
