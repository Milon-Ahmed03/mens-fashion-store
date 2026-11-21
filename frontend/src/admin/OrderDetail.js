import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errMsg } from '../services/api';
import { useSettings } from '../context/SettingsContext';
import { useConfirm } from '../components/ConfirmDialog';
import Invoice from '../components/Invoice';
import OrderTimeline from '../components/OrderTimeline';
import PageHeader from '../components/PageHeader';
import Spinner from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';
import { ALL_STATUSES, formatDateTime, money, onImgError, PLACEHOLDER } from '../utils/helpers';

export default function OrderDetail() {
  const { id } = useParams();
  const { settings } = useSettings();
  const { ask, dialog } = useConfirm();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [invoice, setInvoice] = useState(false);

  useEffect(() => {
    api.get(`/orders/${id}`).then((r) => { setOrder(r.data); setStatus(r.data.status); }).catch((e) => toast.error(errMsg(e)));
  }, [id]);

  const update = async () => {
    try {
      const { data } = await api.put(`/orders/${id}/status`, { status, note });
      setOrder({ ...order, ...data });
      setNote('');
      toast.success('Order status updated');
    } catch (e) {
      toast.error(errMsg(e));
    }
  };
  const handleUpdate = () => {
    if (['cancelled', 'returned'].includes(status)) {
      ask({ title: `Mark as ${status}?`, message: 'Stock will be returned to the products. This cannot be changed later.', confirmText: 'Yes, update' }, update);
    } else update();
  };

  if (!order) return <Spinner />;
  const locked = ['cancelled', 'returned'].includes(order.status);
  const a = order.shippingAddress;

  return (
    <div>
      {dialog}
      <div className="no-print">
        <PageHeader title={`Order ${order.orderNumber}`} subtitle={formatDateTime(order.createdAt)}>
          <StatusBadge status={order.status} />
          <button className="btn-outline btn-sm" onClick={() => setInvoice(!invoice)}>{invoice ? 'Hide Invoice' : 'Invoice'}</button>
          {invoice && <button className="btn-primary btn-sm" onClick={() => window.print()}>Print</button>}
          <Link to="/admin/orders" className="btn-outline btn-sm">Back</Link>
        </PageHeader>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="card divide-y">
              {order.items.map((i, idx) => (
                <div key={idx} className="flex gap-4 p-4 text-sm">
                  <img src={i.image || PLACEHOLDER} alt="" onError={onImgError} className="h-16 w-14 rounded object-cover" />
                  <div className="flex-1"><p className="font-medium">{i.name}</p><p className="text-xs text-gray-500">{[i.size && `Size: ${i.size}`, i.color && `Color: ${i.color}`].filter(Boolean).join(' | ')}</p><p className="text-gray-600">{money(i.price)} × {i.quantity}</p></div>
                  <p className="font-semibold">{money(i.price * i.quantity)}</p>
                </div>
              ))}
              <div className="space-y-1.5 p-4 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>{money(order.subtotal)}</span></div>
                {order.discount > 0 && <div className="flex justify-between text-green-700"><span>Discount {order.couponCode && `(${order.couponCode})`}</span><span>- {money(order.discount)}</span></div>}
                <div className="flex justify-between"><span>Shipping ({order.shippingArea.replace('_', ' ')})</span><span>{money(order.shippingCharge)}</span></div>
                <div className="flex justify-between border-t pt-2 text-base font-bold"><span>Total (COD)</span><span>{money(order.total)}</span></div>
              </div>
            </div>
            <div className="card grid gap-6 p-5 text-sm sm:grid-cols-2">
              <div><h3 className="mb-1 font-semibold">Delivery Address</h3><p>{a.fullName}</p><p>{a.phone}</p><p className="text-gray-600">{a.street}, {a.city} {a.district} {a.postalCode}</p></div>
              <div><h3 className="mb-1 font-semibold">Customer Account</h3><p>{order.user?.name}</p><p className="text-gray-600">{order.user?.email}</p>{order.note && <p className="mt-2 text-gray-600"><b>Note:</b> {order.note}</p>}</div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card space-y-3 p-5">
              <h3 className="font-semibold">Update Status</h3>
              <select className="input capitalize" value={status} disabled={locked} onChange={(e) => setStatus(e.target.value)}>
                {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <input className="input" placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} disabled={locked} />
              <button className="btn-primary w-full" disabled={locked || status === order.status} onClick={handleUpdate}>Update</button>
              {locked && <p className="text-xs text-gray-500">A {order.status} order cannot be changed.</p>}
            </div>
            <div className="card p-5"><h3 className="mb-4 font-semibold">Tracking</h3><OrderTimeline status={order.status} history={order.statusHistory} /></div>
          </div>
        </div>
      </div>
      {invoice && <div className="mt-8"><Invoice order={order} settings={settings} /></div>}
    </div>
  );
}
