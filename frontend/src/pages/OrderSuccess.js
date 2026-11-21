import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import api from '../services/api';
import Spinner from '../components/Spinner';
import useTitle from '../utils/useTitle';
import { money } from '../utils/helpers';

export default function OrderSuccess() {
  useTitle('Order Placed');
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then((r) => setOrder(r.data)).catch(() => {});
  }, [id]);

  if (!order) return <Spinner />;
  return (
    <div className="container-x py-16 text-center">
      <FiCheckCircle className="mx-auto text-green-600" size={64} />
      <h1 className="mt-4 font-display text-3xl font-bold">Thank you! Your order is placed</h1>
      <p className="mt-2 text-gray-600">Order number: <b>{order.orderNumber}</b></p>
      <p className="text-gray-600">Total to pay on delivery: <b>{money(order.total)}</b></p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to={`/orders/${order._id}`} className="btn-primary">View Order</Link>
        <Link to="/shop" className="btn-outline">Continue Shopping</Link>
      </div>
    </div>
  );
}
