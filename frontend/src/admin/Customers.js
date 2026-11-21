import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiDownload } from 'react-icons/fi';
import api, { errMsg } from '../services/api';
import { useConfirm } from '../components/ConfirmDialog';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import Spinner from '../components/Spinner';
import { exportCSV, formatDate, money } from '../utils/helpers';

export default function Customers() {
  const { ask, dialog } = useConfirm();
  const [data, setData] = useState({ items: [], pages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api.get(`/customers?search=${encodeURIComponent(search)}&page=${page}&limit=12`).then((r) => setData(r.data)).catch((e) => toast.error(errMsg(e))).finally(() => setLoading(false));
  }, [search, page]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const toggleBlock = (c) =>
    ask(
      { title: c.isBlocked ? 'Unblock customer?' : 'Block customer?', message: c.isBlocked ? `${c.name} will be able to login and order again.` : `${c.name} will not be able to login or place orders.`, confirmText: c.isBlocked ? 'Unblock' : 'Block' },
      async () => {
        try {
          await api.put(`/customers/${c._id}/block`);
          toast.success(c.isBlocked ? 'Customer unblocked' : 'Customer blocked');
          load();
        } catch (e) {
          toast.error(errMsg(e));
        }
      }
    );

  const exportAll = async () => {
    try {
      const { data: all } = await api.get(`/customers?search=${encodeURIComponent(search)}&limit=5000`);
      exportCSV('customers.csv', all.items.map((c) => ({ Name: c.name, Email: c.email, Phone: c.phone, Orders: c.orders, TotalSpent: c.spent, Joined: formatDate(c.createdAt), Blocked: c.isBlocked ? 'Yes' : 'No' })));
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  return (
    <div>
      {dialog}
      <PageHeader title="Customers" subtitle={`${data.total} customers`}>
        <button className="btn-outline btn-sm" onClick={exportAll}><FiDownload /> CSV</button>
      </PageHeader>
      <input className="input mb-4 sm:max-w-sm" placeholder="Search name, email, phone" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      <div className="card overflow-x-auto">
        {loading ? <Spinner className="py-12" /> : (
          <table className="w-full">
            <thead><tr><th className="th">Customer</th><th className="th">Phone</th><th className="th">Orders</th><th className="th">Total Spent</th><th className="th">Joined</th><th className="th">Status</th><th className="th" /></tr></thead>
            <tbody className="divide-y">
              {data.items.map((c) => (
                <tr key={c._id}>
                  <td className="td font-medium">{c.name}<span className="block text-xs font-normal text-gray-500">{c.email}</span></td>
                  <td className="td">{c.phone || '-'}</td>
                  <td className="td">{c.orders}</td>
                  <td className="td">{money(c.spent)}</td>
                  <td className="td">{formatDate(c.createdAt)}</td>
                  <td className="td"><span className={`rounded-full px-2 py-0.5 text-xs ${c.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{c.isBlocked ? 'Blocked' : 'Active'}</span></td>
                  <td className="td text-right"><button className={`btn-sm ${c.isBlocked ? 'btn-outline' : 'btn-danger'}`} onClick={() => toggleBlock(c)}>{c.isBlocked ? 'Unblock' : 'Block'}</button></td>
                </tr>
              ))}
              {data.items.length === 0 && <tr><td colSpan="7" className="td py-10 text-center text-gray-500">No customers found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
      <Pagination page={page} pages={data.pages} onChange={setPage} />
    </div>
  );
}
