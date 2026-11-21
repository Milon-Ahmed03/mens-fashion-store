import { useState } from 'react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../services/api';
import { useSettings } from '../context/SettingsContext';
import PageHeader from '../components/PageHeader';

export default function StoreSettings() {
  const { settings, reloadSettings } = useSettings();
  const [form, setForm] = useState({
    storeName: settings.storeName, tagline: settings.tagline, email: settings.email, phone: settings.phone,
    address: settings.address, facebook: settings.facebook, instagram: settings.instagram, aboutText: settings.aboutText,
  });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings', form);
      reloadSettings();
      toast.success('Settings saved');
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="max-w-3xl">
      <PageHeader title="Store Settings"><button className="btn-primary btn-sm" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button></PageHeader>
      <div className="card space-y-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Store Name *</label><input required className="input" value={form.storeName} onChange={set('storeName')} /></div>
          <div><label className="label">Tagline</label><input className="input" value={form.tagline} onChange={set('tagline')} /></div>
          <div><label className="label">Contact Email</label><input type="email" className="input" value={form.email} onChange={set('email')} /></div>
          <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={set('phone')} /></div>
          <div className="sm:col-span-2"><label className="label">Address</label><input className="input" value={form.address} onChange={set('address')} /></div>
          <div><label className="label">Facebook URL</label><input className="input" value={form.facebook} onChange={set('facebook')} /></div>
          <div><label className="label">Instagram URL</label><input className="input" value={form.instagram} onChange={set('instagram')} /></div>
        </div>
        <div><label className="label">About Us text</label><textarea rows="5" className="input" value={form.aboutText} onChange={set('aboutText')} /></div>
      </div>
    </form>
  );
}
