import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errMsg } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import useTitle from '../utils/useTitle';
import { money, onImgError, PLACEHOLDER } from '../utils/helpers';

export default function Checkout() {
  useTitle('Checkout');
  const { user } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    district: user?.address?.district || '',
    postalCode: user?.address?.postalCode || '',
  });
  const [area, setArea] = useState('inside_dhaka');
  const [note, setNote] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState(null); // { code, discount }
  const [placing, setPlacing] = useState(false);

  if (items.length === 0) return <Navigate to="/cart" replace />;

  // Shipping হিসাব (Server-ও একই নিয়মে আবার হিসাব করে)
  const ship = settings.shipping;
  const discount = coupon ? coupon.discount : 0;
  let shipping = area === 'outside_dhaka' ? ship.outsideDhaka : ship.insideDhaka;
  if (ship.freeShippingOver > 0 && subtotal - discount >= ship.freeShippingOver) shipping = 0;
  const total = subtotal - discount + shipping;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    try {
      const { data } = await api.post('/coupons/validate', { code: couponInput, subtotal });
      setCoupon(data);
      toast.success(`Coupon applied: -${money(data.discount)}`);
    } catch (e) {
      setCoupon(null);
      toast.error(errMsg(e));
    }
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    setPlacing(true);
    try {
      const { data } = await api.post('/orders', {
        items: items.map((i) => ({ product: i.product, size: i.size, color: i.color, quantity: i.quantity })),
        shippingAddress: form,
        shippingArea: area,
        couponCode: coupon ? coupon.code : '',
        note,
      });
      clearCart();
      navigate(`/order-success/${data._id}`, { replace: true });
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="container-x py-8">
      <h1 className="mb-6 font-display text-3xl font-bold">Checkout</h1>
      <form onSubmit={placeOrder} className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="card p-5">
            <h2 className="mb-4 text-lg font-semibold">Delivery Address</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="label">Full Name *</label><input className="input" required value={form.fullName} onChange={set('fullName')} /></div>
              <div><label className="label">Phone *</label><input className="input" required value={form.phone} onChange={set('phone')} placeholder="01XXXXXXXXX" /></div>
              <div className="sm:col-span-2"><label className="label">Address *</label><input className="input" required value={form.street} onChange={set('street')} placeholder="House, road, area" /></div>
              <div><label className="label">City *</label><input className="input" required value={form.city} onChange={set('city')} /></div>
              <div><label className="label">District</label><input className="input" value={form.district} onChange={set('district')} /></div>
              <div><label className="label">Postal Code</label><input className="input" value={form.postalCode} onChange={set('postalCode')} /></div>
            </div>
            <div className="mt-4"><label className="label">Order Note (optional)</label><textarea className="input" rows="2" value={note} onChange={(e) => setNote(e.target.value)} /></div>
          </div>

          <div className="card p-5">
            <h2 className="mb-4 text-lg font-semibold">Delivery Area</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[['inside_dhaka', 'Inside Dhaka', ship.insideDhaka], ['outside_dhaka', 'Outside Dhaka', ship.outsideDhaka]].map(([v, l, c]) => (
                <label key={v} className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 ${area === v ? 'border-ink bg-gray-50' : ''}`}>
                  <span className="flex items-center gap-2"><input type="radio" name="area" checked={area === v} onChange={() => setArea(v)} /> {l}</span>
                  <span className="text-sm font-semibold">{money(c)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="mb-2 text-lg font-semibold">Payment Method</h2>
            <div className="rounded-lg border border-ink bg-gray-50 p-4 text-sm"><b>Cash on Delivery</b><p className="text-gray-600">Pay with cash when your order arrives.</p></div>
          </div>
        </div>

        <div className="card h-fit p-5">
          <h2 className="text-lg font-semibold">Your Order</h2>
          <div className="mt-4 max-h-64 space-y-3 overflow-y-auto">
            {items.map((i) => (
              <div key={i.key} className="flex gap-3 text-sm">
                <img src={i.image || PLACEHOLDER} alt="" onError={onImgError} className="h-16 w-12 rounded object-cover" />
                <div className="flex-1"><p className="font-medium">{i.name}</p><p className="text-xs text-gray-500">{[i.size, i.color].filter(Boolean).join(' / ')} × {i.quantity}</p></div>
                <span className="font-semibold">{money(i.price * i.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex gap-2">
            <input className="input" placeholder="Coupon code" value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} />
            <button type="button" className="btn-outline" onClick={applyCoupon}>Apply</button>
          </div>

          <div className="mt-5 space-y-2 border-t pt-4 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{money(subtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-700"><span>Discount ({coupon.code})</span><span>- {money(discount)}</span></div>}
            <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'Free' : money(shipping)}</span></div>
            <div className="flex justify-between border-t pt-3 text-lg font-bold"><span>Total</span><span>{money(total)}</span></div>
          </div>
          <button className="btn-primary mt-5 w-full py-3" disabled={placing}>{placing ? 'Placing order...' : 'Place Order (Cash on Delivery)'}</button>
          <Link to="/cart" className="mt-3 block text-center text-sm text-gray-600 hover:underline">Back to cart</Link>
        </div>
      </form>
    </div>
  );
}
