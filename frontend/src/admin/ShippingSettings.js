import { useState } from 'react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../services/api';
import { useSettings } from '../context/SettingsContext';
import PageHeader from '../components/PageHeader';

export default function ShippingSettings() {
  const { settings, reloadSettings } = useSettings();
  const [form, setForm] = useState({ ...settings.shipping });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings', { shipping: { insideDhaka: Number(form.insideDhaka) || 0, outsideDhaka: Number(form.outsideDhaka) || 0, freeShippingOver: Number(form.freeShippingOver) || 0 } });
      reloadSettings();
      toast.success('Shipping charges updated');
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="max-w-xl">
      <PageHeader title="Shipping Charges" />
      <div className="card space-y-4 p-5">
        <div><label className="label">Inside Dhaka (৳)</label><input type="number" min="0" className="input" value={form.insideDhaka} onChange={set('insideDhaka')} /></div>
        <div><label className="label">Outside Dhaka (৳)</label><input type="number" min="0" className="input" value={form.outsideDhaka} onChange={set('outsideDhaka')} /></div>
        <div><label className="label">Free shipping on orders over (৳)</label><input type="number" min="0" className="input" value={form.freeShippingOver} onChange={set('freeShippingOver')} /><p className="mt-1 text-xs text-gray-500">Set 0 to turn free shipping off.</p></div>
        <button className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
      </div>
    </form>
  );
}
