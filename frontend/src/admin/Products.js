import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiDownload, FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import api, { errMsg } from '../services/api';
import { useCatalog } from '../context/CatalogContext';
import { useConfirm } from '../components/ConfirmDialog';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import Spinner from '../components/Spinner';
import { exportCSV, money, onImgError, PLACEHOLDER } from '../utils/helpers';

export default function Products() {
  const { categories } = useCatalog();
  const { ask, dialog } = useConfirm();
  const [data, setData] = useState({ items: [], pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [lowStock, setLowStock] = useState(false);
  const [page, setPage] = useState(1);

  const query = useCallback(
    (extra = '') => `/products?admin=true&search=${encodeURIComponent(search)}&category=${category}&lowStock=${lowStock}&sort=newest${extra}`,
    [search, category, lowStock]
  );

  const load = useCallback(() => {
    setLoading(true);
    api.get(query(`&page=${page}&limit=10`)).then((r) => setData(r.data)).catch((e) => toast.error(errMsg(e))).finally(() => setLoading(false));
  }, [query, page]);

  // টাইপ করার সময় প্রতি অক্ষরে রিকোয়েস্ট না পাঠিয়ে একটু অপেক্ষা করে
  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const remove = (p) =>
    ask({ title: 'Delete product?', message: `"${p.name}" will be deleted permanently.`, confirmText: 'Delete' }, async () => {
      try {
        await api.delete(`/products/${p._id}`);
        toast.success('Product deleted');
        load();
      } catch (e) {
        toast.error(errMsg(e));
      }
    });

  const exportAll = async () => {
    try {
      const { data: all } = await api.get(query('&limit=1000'));
      exportCSV('products.csv', all.items.map((p) => ({
        Name: p.name, Category: p.category?.name, Brand: p.brand?.name, Price: p.price, DiscountPrice: p.discountPrice,
        Stock: p.stock, Sizes: p.sizes.join('/'), Colors: p.colors.join('/'), Active: p.isActive ? 'Yes' : 'No',
      })));
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  return (
    <div>
      {dialog}
      <PageHeader title="Products" subtitle={`${data.total} products`}>
        <button className="btn-outline btn-sm" onClick={exportAll}><FiDownload /> CSV</button>
        <Link to="/admin/products/new" className="btn-primary btn-sm"><FiPlus /> Add Product</Link>
      </PageHeader>

      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_200px_auto]">
        <input className="input" placeholder="Search products..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <select className="input" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c._id} value={c._id}>{c.parent ? '— ' : ''}{c.name}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={lowStock} onChange={(e) => { setLowStock(e.target.checked); setPage(1); }} /> Low stock only</label>
      </div>

      <div className="card overflow-x-auto">
        {loading ? <Spinner className="py-12" /> : (
          <table className="w-full">
            <thead><tr><th className="th">Product</th><th className="th">Category</th><th className="th">Price</th><th className="th">Stock</th><th className="th">Status</th><th className="th text-right">Actions</th></tr></thead>
            <tbody className="divide-y">
              {data.items.map((p) => (
                <tr key={p._id}>
                  <td className="td">
                    <div className="flex items-center gap-3">
                      <img src={p.images[0]?.url || PLACEHOLDER} alt="" onError={onImgError} className="h-12 w-10 rounded object-cover" />
                      <div><p className="max-w-[14rem] truncate font-medium">{p.name}</p><p className="text-xs text-gray-500">{p.brand?.name}</p></div>
                    </div>
                  </td>
                  <td className="td">{p.category?.name}</td>
                  <td className="td">{money(p.finalPrice)} {p.discountPrice > 0 && <span className="text-xs text-gray-400 line-through">{money(p.price)}</span>}</td>
                  <td className={`td font-semibold ${p.stock === 0 ? 'text-red-600' : p.stock <= 5 ? 'text-orange-600' : ''}`}>{p.stock}</td>
                  <td className="td"><span className={`rounded-full px-2 py-0.5 text-xs ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{p.isActive ? 'Active' : 'Hidden'}</span></td>
                  <td className="td text-right">
                    <Link to={`/admin/products/${p._id}/edit`} className="mr-2 inline-flex text-blue-600" aria-label="Edit"><FiEdit2 /></Link>
                    <button onClick={() => remove(p)} className="text-red-600" aria-label="Delete"><FiTrash2 /></button>
                  </td>
                </tr>
              ))}
              {data.items.length === 0 && <tr><td colSpan="6" className="td py-10 text-center text-gray-500">No products found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
      <Pagination page={page} pages={data.pages} onChange={setPage} />
    </div>
  );
}
