import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errMsg } from '../services/api';
import { useSettings } from '../context/SettingsContext';
import { useConfirm } from '../components/ConfirmDialog';
import Spinner from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';
import OrderTimeline from '../components/OrderTimeline';
import Invoice from '../components/Invoice';
import useTitle from '../utils/useTitle';
import { formatDateTime, money, onImgError, PLACEHOLDER } from '../utils/helpers';

export default function OrderDetails() {
  const { id } = useParams();
  const { settings } = useSettings();
  const { ask, dialog } = useConfirm();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [showInvoice, setShowInvoice] = useState(false);

  useTitle(order ? `Order ${order.orderNumber}` : 'Order');

  useEffect(() => {
    api.get(`/orders/${id}`).then((r) => setOrder(r.data)).catch((e) => setError(errMsg(e)));
  }, [id]);

  const cancel = () =>
    ask({ title: 'Cancel this order?', message: 'This cannot be undone.', confirmText: 'Yes, cancel order' }, async () => {
      try {
        const { data } = await api.put(`/orders/${id}/cancel`);
        setOrder({ ...order, ...data });
        toast.success('Order cancelled');
      } catch (e) {
        toast.error(errMsg(e));
      }
    });

  if (error) return <div className="container-x py-20 text-center text-red-600">{error}</div>;
  if (!order) return <Spinner />;

  return (
    <div className="container-x py-8">
      {dialog}
      <div className="no-print">
        <Link to="/orders" className="text-sm text-gray-500 hover:underline">← All orders</Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold">Order {order.orderNumber}</h1>
            <p className="text-sm text-gray-500">Placed on {formatDateTime(order.createdAt)}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={order.status} />
            <button className="btn-outline btn-sm" onClick={() => setShowInvoice(!showInvoice)}>{showInvoice ? 'Hide Invoice' : 'View Invoice'}</button>
            {['pending', 'confirmed'].includes(order.status) && <button className="btn-danger btn-sm" onClick={cancel}>Cancel Order</button>}
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <div className="card divide-y">
              {order.items.map((i, idx) => (
                <div key={idx} className="flex gap-4 p-4">
                  <img src={i.image || PLACEHOLDER} alt="" onError={onImgError} className="h-20 w-16 rounded object-cover" />
                  <div className="flex-1 text-sm">
                    <p className="font-medium">{i.name}</p>
                    <p className="text-xs text-gray-500">{[i.size && `Size: ${i.size}`, i.color && `Color: ${i.color}`].filter(Boolean).join(' | ')}</p>
                    <p className="mt-1 text-gray-600">{money(i.price)} × {i.quantity}</p>
                  </div>
                  <p className="font-semibold">{money(i.price * i.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="card p-5 text-sm">
              <h2 className="mb-2 font-semibold">Delivery Address</h2>
              <p>{order.shippingAddress.fullName} · {order.shippingAddress.phone}</p>
              <p className="text-gray-600">{order.shippingAddress.street}, {order.shippingAddress.city} {order.shippingAddress.district}</p>
              <p className="mt-2 text-gray-500">Payment: Cash on Delivery</p>
            </div>
            <div className="card space-y-2 p-5 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{money(order.subtotal)}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-green-700"><span>Discount</span><span>- {money(order.discount)}</span></div>}
              <div className="flex justify-between"><span>Shipping</span><span>{money(order.shippingCharge)}</span></div>
              <div className="flex justify-between border-t pt-2 text-base font-bold"><span>Total</span><span>{money(order.total)}</span></div>
            </div>
          </div>
          <div className="card h-fit p-5">
            <h2 className="mb-4 font-semibold">Order Tracking</h2>
            <OrderTimeline status={order.status} history={order.statusHistory} />
          </div>
        </div>
      </div>

      {showInvoice && (
        <div className="mt-8">
          <div className="no-print mb-3 text-right"><button className="btn-primary btn-sm" onClick={() => window.print()}>Print Invoice</button></div>
          <Invoice order={order} settings={settings} />
        </div>
      )}
    </div>
  );
}
