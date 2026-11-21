import { useState } from 'react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../services/api';
import { useSettings } from '../context/SettingsContext';
import useTitle from '../utils/useTitle';

export default function Contact() {
  useTitle('Contact Us');
  const { settings } = useSettings();
  const empty = { name: '', email: '', subject: '', message: '' };
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post('/contact', form);
      toast.success(data.message);
      setForm(empty);
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-x py-12">
      <h1 className="text-center font-display text-4xl font-bold">Contact Us</h1>
      <p className="mt-2 text-center text-gray-500">Questions about an order or a product? Send us a message.</p>
      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
        <form onSubmit={submit} className="card space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label">Your Name</label><input required className="input" value={form.name} onChange={set('name')} /></div>
            <div><label className="label">Email</label><input type="email" required className="input" value={form.email} onChange={set('email')} /></div>
          </div>
          <div><label className="label">Subject</label><input className="input" value={form.subject} onChange={set('subject')} /></div>
          <div><label className="label">Message</label><textarea required rows="5" className="input" value={form.message} onChange={set('message')} /></div>
          <button className="btn-primary" disabled={busy}>{busy ? 'Sending...' : 'Send Message'}</button>
        </form>
        <div className="card h-fit space-y-3 p-6 text-sm">
          <h3 className="text-lg font-semibold">Store Info</h3>
          {settings.address && <p><b>Address:</b> {settings.address}</p>}
          {settings.phone && <p><b>Phone:</b> {settings.phone}</p>}
          {settings.email && <p><b>Email:</b> {settings.email}</p>}
          {!settings.address && !settings.phone && !settings.email && <p className="text-gray-500">Contact details will appear here once the store owner adds them in settings.</p>}
        </div>
      </div>
    </div>
  );
}
