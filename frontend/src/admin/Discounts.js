import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errMsg } from '../services/api';
import { useCatalog } from '../context/CatalogContext';
import { useConfirm } from '../components/ConfirmDialog';
import PageHeader from '../components/PageHeader';
import { discountPercent, money } from '../utils/helpers';

// Discount Management: সব Product বা একটি Category-তে একসাথে ডিসকাউন্ট দেওয়া/তুলে নেওয়া
export default function Discounts() {
  const { categories } = useCatalog();
  const { ask, dialog } = useConfirm();
  const [category, setCategory] = useState('all');
  const [percent, setPercent] = useState('');
  const [onSale, setOnSale] = useState([]);

  const load = useCallback(() => {
    api.get('/products?admin=true&onSale=true&limit=200').then((r) => setOnSale(r.data.items)).catch(() => { });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const apply = (value) => {
    const label = category === 'all' ? 'ALL products' : categories.find((c) => c._id === category)?.name;
    ask(
      { title: value === 0 ? 'Remove discounts?' : 'Apply discount?', message: value === 0 ? `Discount will be removed from ${label}.` : `${value}% discount will be applied to ${label}. Existing discount prices will be replaced.`, confirmText: 'Yes, continue' },
      async () => {
        try {
          const { data } = await api.post('/products/bulk-discount', { category, percent: value });
          toast.success(data.message);
          load();
        } catch (e) {
          toast.error(errMsg(e));
        }
      }
    );
  };

  return (
    <div>
      {dialog}
      <PageHeader title="Discount Management" subtitle="Set sale prices in bulk. For a single product, edit the product." />
      <div className="card mb-6 grid gap-4 p-5 sm:grid-cols-[1fr_160px_auto_auto]">
        <div>
          <label className="label">Apply to</label>
          <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All products</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.parent ? '— ' : ''}{c.name}</option>)}
          </select>
        </div>
        <div><label className="label">Discount %</label><input type="number" min="1" max="90" className="input" value={percent} onChange={(e) => setPercent(e.target.value)} /></div>
        <button className="btn-primary self-end" disabled={!percent} onClick={() => apply(Number(percent))}>Apply</button>
        <button className="btn-outline self-end" onClick={() => apply(0)}>Remove discount</button>
      </div>

      <h2 className="mb-3 font-semibold">Products on sale ({onSale.length})</h2>
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead><tr><th className="th">Product</th><th className="th">Price</th><th className="th">Sale Price</th><th className="th">Off</th><th className="th" /></tr></thead>
          <tbody className="divide-y">
            {onSale.map((p) => (
              <tr key={p._id}>
                <td className="td font-medium">{p.name}</td>
                <td className="td text-gray-500 line-through">{money(p.price)}</td>
                <td className="td font-semibold">{money(p.discountPrice)}</td>
                <td className="td">{discountPercent(p)}%</td>
                <td className="td text-right"><Link to={`/admin/products/${p._id}/edit`} className="btn-outline btn-sm">Edit</Link></td>
              </tr>
            ))}
            {onSale.length === 0 && <tr><td colSpan="5" className="td py-10 text-center text-gray-500">No products are on sale.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
