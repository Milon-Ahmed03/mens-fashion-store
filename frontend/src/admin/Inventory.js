import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../services/api';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import Spinner from '../components/Spinner';
import { onImgError, PLACEHOLDER } from '../utils/helpers';

// Stock / Inventory: এক জায়গা থেকেই সব প্রোডাক্টের স্টক বদলানো যায়
export default function Inventory() {
  const [data, setData] = useState({ items: [], pages: 1, total: 0 });
  const [edits, setEdits] = useState({}); // { productId: নতুন স্টক }
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | low | out
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    const extra = filter === 'low' ? '&lowStock=true' : '';
    api
      .get(`/products?admin=true&search=${encodeURIComponent(search)}&sort=stock_asc&page=${page}&limit=12${extra}`)
      .then((r) => setData(filter === 'out' ? { ...r.data, items: r.data.items.filter((p) => p.stock === 0) } : r.data))
      .catch((e) => toast.error(errMsg(e)))
      .finally(() => setLoading(false));
  }, [search, filter, page]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const save = async (p) => {
    const stock = Number(edits[p._id]);
    if (Number.isNaN(stock) || stock < 0) return toast.error('Enter a valid stock number');
    try {
      await api.put(`/products/${p._id}`, { stock });
      toast.success('Stock updated');
      setEdits((e) => { const n = { ...e }; delete n[p._id]; return n; });
      load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  return (
    <div>
      <PageHeader title="Inventory" subtitle="Update stock quantity of your products" />
      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_200px]">
        <input className="input" placeholder="Search products..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <select className="input" value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}>
          <option value="all">All products</option>
          <option value="low">Low stock (5 or less)</option>
          <option value="out">Out of stock</option>
        </select>
      </div>
      <div className="card overflow-x-auto">
        {loading ? <Spinner className="py-12" /> : (
          <table className="w-full">
            <thead><tr><th className="th">Product</th><th className="th">Current Stock</th><th className="th">New Stock</th><th className="th" /></tr></thead>
            <tbody className="divide-y">
              {data.items.map((p) => (
                <tr key={p._id}>
                  <td className="td"><div className="flex items-center gap-3"><img src={p.images[0]?.url || PLACEHOLDER} alt="" onError={onImgError} className="h-12 w-10 rounded object-cover" /><span className="font-medium">{p.name}</span></div></td>
                  <td className={`td font-semibold ${p.stock === 0 ? 'text-red-600' : p.stock <= 5 ? 'text-orange-600' : 'text-green-700'}`}>{p.stock === 0 ? 'Out of stock' : p.stock}</td>
                  <td className="td"><input type="number" min="0" className="input w-28" value={edits[p._id] ?? ''} placeholder={String(p.stock)} onChange={(e) => setEdits({ ...edits, [p._id]: e.target.value })} /></td>
                  <td className="td text-right"><button className="btn-primary btn-sm" disabled={edits[p._id] === undefined || edits[p._id] === ''} onClick={() => save(p)}>Update</button></td>
                </tr>
              ))}
              {data.items.length === 0 && <tr><td colSpan="4" className="td py-10 text-center text-gray-500">No products found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
      <Pagination page={page} pages={data.pages} onChange={setPage} />
    </div>
  );
}
