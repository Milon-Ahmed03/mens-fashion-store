import { useState } from 'react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../services/api';
import OrderTimeline from '../components/OrderTimeline';
import StatusBadge from '../components/StatusBadge';
import useTitle from '../utils/useTitle';
import { formatDate, money } from '../utils/helpers';

export default function TrackOrder() {
  useTitle('Track Order');
  const [form, setForm] = useState({ orderNumber: '', phone: '' });
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setResult(null);
    try {
      const { data } = await api.get('/orders/track', { params: form });
      setResult(data);
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-x max-w-2xl py-12">
      <h1 className="text-center font-display text-3xl font-bold">Track Your Order</h1>
      <p className="mt-2 text-center text-sm text-gray-500">Enter your order number and the phone number used at checkout.</p>
      <form onSubmit={submit} className="card mt-6 grid gap-4 p-6 sm:grid-cols-2">
        <div><label className="label">Order Number</label><input required className="input" placeholder="MF-2611-12345" value={form.orderNumber} onChange={(e) => setForm({ ...form, orderNumber: e.target.value })} /></div>
        <div><label className="label">Phone</label><input required className="input" placeholder="01XXXXXXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        <button className="btn-primary sm:col-span-2" disabled={busy}>{busy ? 'Searching...' : 'Track Order'}</button>
      </form>

      {result && (
        <div className="card mt-6 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-semibold">{result.orderNumber}</p>
              <p className="text-xs text-gray-500">{formatDate(result.createdAt)} · {money(result.total)}</p>
            </div>
            <StatusBadge status={result.status} />
          </div>
          <OrderTimeline status={result.status} history={result.statusHistory} />
        </div>
      )}
    </div>
  );
}
