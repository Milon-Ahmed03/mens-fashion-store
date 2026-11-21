import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiDownload } from 'react-icons/fi';
import api, { errMsg } from '../services/api';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import Spinner from '../components/Spinner';
import { ALL_STATUSES, exportCSV, formatDate, money } from '../utils/helpers';

export default function Orders() {
  const [data, setData] = useState({ items: [], pages: 1, total: 0 });
  const [filters, setFilters] = useState({ status: '', search: '', from: '', to: '' });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const qs = useCallback(() => new URLSearchParams(Object.entries(filters).filter(([, v]) => v)).toString(), [filters]);

  const load = useCallback(() => {
    setLoading(true);
    api.get(`/orders?${qs()}&page=${page}&limit=12`).then((r) => setData(r.data)).catch((e) => toast.error(errMsg(e))).finally(() => setLoading(false));
  }, [qs, page]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const setFilter = (k) => (e) => { setFilters({ ...filters, [k]: e.target.value }); setPage(1); };

  // তালিকা থেকেই Status বদলানো যায়
  const changeStatus = async (order, status) => {
    try {
      await api.put(`/orders/${order._id}/status`, { status });
      toast.success(`Order marked as ${status}`);
      load();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const exportAll = async () => {
    try {
      const { data: all } = await api.get(`/orders?${qs()}&limit=5000`);
      exportCSV('orders.csv', all.items.map((o) => ({
        Order: o.orderNumber, Date: formatDate(o.createdAt), Customer: o.shippingAddress.fullName, Phone: o.shippingAddress.phone,
        Address: `${o.shippingAddress.street}, ${o.shippingAddress.city}`, Items: o.items.reduce((n, i) => n + i.quantity, 0),
        Subtotal: o.subtotal, Discount: o.discount, Shipping: o.shippingCharge, Total: o.total, Status: o.status,
      })));
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  return (
    <div>
      <PageHeader title="Orders" subtitle={`${data.total} orders`}>
        <button className="btn-outline btn-sm" onClick={exportAll}><FiDownload /> CSV</button>
      </PageHeader>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input className="input" placeholder="Search order no, name, phone" value={filters.search} onChange={setFilter('search')} />
        <select className="input" value={filters.status} onChange={setFilter('status')}>
          <option value="">All statuses</option>
          {ALL_STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
        <input type="date" className="input" value={filters.from} onChange={setFilter('from')} aria-label="From date" />
        <input type="date" className="input" value={filters.to} onChange={setFilter('to')} aria-label="To date" />
      </div>

      <div className="card overflow-x-auto">
        {loading ? <Spinner className="py-12" /> : (
          <table className="w-full">
            <thead><tr><th className="th">Order</th><th className="th">Date</th><th className="th">Customer</th><th className="th">Total</th><th className="th">Status</th><th className="th" /></tr></thead>
            <tbody className="divide-y">
              {data.items.map((o) => {
                const locked = ['cancelled', 'returned'].includes(o.status);
                return (
                  <tr key={o._id}>
                    <td className="td font-medium">{o.orderNumber}</td>
                    <td className="td">{formatDate(o.createdAt)}</td>
                    <td className="td">{o.shippingAddress.fullName}<span className="block text-xs text-gray-500">{o.shippingAddress.phone}</span></td>
                    <td className="td font-semibold">{money(o.total)}</td>
                    <td className="td">
                      <select className="input w-36 py-1.5 capitalize" value={o.status} disabled={locked} onChange={(e) => changeStatus(o, e.target.value)}>
                        {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="td text-right"><Link to={`/admin/orders/${o._id}`} className="btn-outline btn-sm">Details</Link></td>
                  </tr>
                );
              })}
              {data.items.length === 0 && <tr><td colSpan="6" className="td py-10 text-center text-gray-500">No orders found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
      <Pagination page={page} pages={data.pages} onChange={setPage} />
    </div>
  );
}
