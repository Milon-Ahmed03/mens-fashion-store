import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errMsg } from '../services/api';
import { useCatalog } from '../context/CatalogContext';
import ImageUploader from '../components/ImageUploader';
import PageHeader from '../components/PageHeader';
import Spinner from '../components/Spinner';
import { SIZES } from '../utils/helpers';

const EMPTY = { name: '', description: '', price: '', discountPrice: '', category: '', brand: '', stock: '', sizesText: '', colorsText: '', isFeatured: false, isActive: true, images: [] };

// নতুন Product যোগ ও পুরনো Product Edit - একই ফর্ম
export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { topCategories, childrenOf, brands } = useCatalog();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/products/id/${id}`).then(({ data: p }) => {
      setForm({
        name: p.name, description: p.description, price: p.price, discountPrice: p.discountPrice || '', category: p.category?._id || '', brand: p.brand?._id || '',
        stock: p.stock, sizesText: p.sizes.join(', '), colorsText: p.colors.join(', '), isFeatured: p.isFeatured, isActive: p.isActive, images: p.images,
      });
    }).catch((e) => { toast.error(errMsg(e)); navigate('/admin/products'); }).finally(() => setLoading(false));
  }, [id, navigate]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const sizeList = form.sizesText.split(',').map((s) => s.trim()).filter(Boolean);
  const toggleSize = (s) => {
    const next = sizeList.includes(s) ? sizeList.filter((x) => x !== s) : [...sizeList, s];
    setForm({ ...form, sizesText: next.join(', ') });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (form.discountPrice && Number(form.discountPrice) >= Number(form.price)) return toast.error('Discount price must be lower than the price');
    setSaving(true);
    const payload = {
      name: form.name, description: form.description, price: Number(form.price), discountPrice: Number(form.discountPrice) || 0,
      category: form.category, brand: form.brand, stock: Number(form.stock) || 0, sizes: form.sizesText, colors: form.colorsText,
      isFeatured: form.isFeatured, isActive: form.isActive, images: form.images,
    };
    try {
      if (id) await api.put(`/products/${id}`, payload);
      else await api.post('/products', payload);
      toast.success(id ? 'Product updated' : 'Product added');
      navigate('/admin/products');
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <form onSubmit={submit}>
      <PageHeader title={id ? 'Edit Product' : 'Add Product'}>
        <Link to="/admin/products" className="btn-outline btn-sm">Cancel</Link>
        <button className="btn-primary btn-sm" disabled={saving}>{saving ? 'Saving...' : 'Save Product'}</button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card space-y-4 p-5">
            <div><label className="label">Product Name *</label><input required className="input" value={form.name} onChange={set('name')} /></div>
            <div><label className="label">Description</label><textarea rows="5" className="input" value={form.description} onChange={set('description')} /></div>
          </div>

          <div className="card p-5">
            <label className="label">Product Images (first image is the main image)</label>
            <ImageUploader images={form.images} onChange={(images) => setForm({ ...form, images })} />
          </div>

          <div className="card space-y-4 p-5">
            <div>
              <label className="label">Available Sizes (comma separated)</label>
              <input className="input" placeholder="S, M, L, XL" value={form.sizesText} onChange={set('sizesText')} />
              <div className="mt-2 flex flex-wrap gap-2">
                {SIZES.map((s) => (
                  <button type="button" key={s} onClick={() => toggleSize(s)} className={`min-w-[2.5rem] rounded border px-2 py-1 text-xs ${sizeList.includes(s) ? 'border-ink bg-ink text-white' : 'border-gray-300'}`}>{s}</button>
                ))}
              </div>
            </div>
            <div><label className="label">Available Colors (comma separated)</label><input className="input" placeholder="Black, Navy, White" value={form.colorsText} onChange={set('colorsText')} /></div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card space-y-4 p-5">
            <div><label className="label">Price (৳) *</label><input type="number" min="0" required className="input" value={form.price} onChange={set('price')} /></div>
            <div><label className="label">Discount Price (৳)</label><input type="number" min="0" className="input" placeholder="Leave empty for no discount" value={form.discountPrice} onChange={set('discountPrice')} /></div>
            <div><label className="label">Stock Quantity *</label><input type="number" min="0" required className="input" value={form.stock} onChange={set('stock')} /></div>
          </div>
          <div className="card space-y-4 p-5">
            <div>
              <label className="label">Category *</label>
              <select required className="input" value={form.category} onChange={set('category')}>
                <option value="">Select category</option>
                {topCategories.map((c) => (
                  <optgroup key={c._id} label={c.name}>
                    <option value={c._id}>{c.name}</option>
                    {childrenOf(c._id).map((s) => <option key={s._id} value={s._id}>{c.name} → {s.name}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Brand</label>
              <select className="input" value={form.brand} onChange={set('brand')}>
                <option value="">No brand</option>
                {brands.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
            </div>
          </div>
          <div className="card space-y-3 p-5 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.isFeatured} onChange={set('isFeatured')} /> Featured on homepage</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={set('isActive')} /> Visible in store</label>
          </div>
        </div>
      </div>
    </form>
  );
}
