import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Spinner from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';
import useTitle from '../utils/useTitle';
import { formatDate, money } from '../utils/helpers';

export default function MyOrders() {
  useTitle('My Orders');
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    api.get('/orders/my').then((r) => setOrders(r.data)).catch(() => setOrders([]));
  }, []);

  if (!orders) return <Spinner />;
  return (
    <div className="container-x py-8">
      <h1 className="mb-6 font-display text-3xl font-bold">Order History</h1>
      {orders.length === 0 ? (
        <div className="py-16 text-center text-gray-500">
          <p>You have not placed any orders yet.</p>
          <Link to="/shop" className="btn-primary mt-4">Start Shopping</Link>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead><tr><th className="th">Order</th><th className="th">Date</th><th className="th">Items</th><th className="th">Total</th><th className="th">Status</th><th className="th" /></tr></thead>
            <tbody className="divide-y">
              {orders.map((o) => (
                <tr key={o._id}>
                  <td className="td font-medium">{o.orderNumber}</td>
                  <td className="td">{formatDate(o.createdAt)}</td>
                  <td className="td">{o.items.reduce((n, i) => n + i.quantity, 0)}</td>
                  <td className="td font-semibold">{money(o.total)}</td>
                  <td className="td"><StatusBadge status={o.status} /></td>
                  <td className="td text-right"><Link to={`/orders/${o._id}`} className="btn-outline btn-sm">Details</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
