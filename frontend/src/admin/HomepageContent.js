import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errMsg } from '../services/api';
import { useSettings } from '../context/SettingsContext';
import PageHeader from '../components/PageHeader';

// Homepage Content Management: লেখা বদলানো ও সেকশন চালু/বন্ধ
export default function HomepageContent() {
  const { settings, reloadSettings } = useSettings();
  const [form, setForm] = useState({ ...settings.homepage });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings', { homepage: form });
      reloadSettings();
      toast.success('Homepage updated');
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  const toggles = [['showCategories', 'Category blocks'], ['showFeatured', 'Featured products'], ['showPromo', 'Promo banner'], ['showNewArrivals', 'New arrivals']];

  return (
    <form onSubmit={save}>
      <PageHeader title="Homepage Content" subtitle="Slider images are managed from Banners">
        <Link to="/admin/banners" className="btn-outline btn-sm">Manage Banners</Link>
        <button className="btn-primary btn-sm" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
      </PageHeader>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card space-y-4 p-5">
          <h2 className="font-semibold">Texts</h2>
          <div><label className="label">Hero Title (used when there are no banners)</label><input className="input" value={form.heroTitle} onChange={set('heroTitle')} /></div>
          <div><label className="label">Hero Subtitle</label><input className="input" value={form.heroSubtitle} onChange={set('heroSubtitle')} /></div>
          <div><label className="label">Featured Section Title</label><input className="input" value={form.featuredTitle} onChange={set('featuredTitle')} /></div>
          <div><label className="label">New Arrivals Title</label><input className="input" value={form.newArrivalsTitle} onChange={set('newArrivalsTitle')} /></div>
          <div><label className="label">Promo Title</label><input className="input" value={form.promoTitle} onChange={set('promoTitle')} /></div>
          <div><label className="label">Promo Text</label><textarea rows="2" className="input" value={form.promoText} onChange={set('promoText')} /></div>
        </div>
        <div className="card h-fit space-y-3 p-5 text-sm">
          <h2 className="font-semibold">Show / hide sections</h2>
          {toggles.map(([k, l]) => <label key={k} className="flex items-center gap-2"><input type="checkbox" checked={!!form[k]} onChange={set(k)} /> {l}</label>)}
          <p className="pt-2 text-xs text-gray-500">Tip: mark products as "Featured" in the product form to show them in the featured section.</p>
        </div>
      </div>
    </form>
  );
}
