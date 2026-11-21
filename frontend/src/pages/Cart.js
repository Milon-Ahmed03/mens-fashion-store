import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2 } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useConfirm } from '../components/ConfirmDialog';
import useTitle from '../utils/useTitle';
import { money, onImgError, PLACEHOLDER } from '../utils/helpers';

export default function Cart() {
  useTitle('Shopping Cart');
  const { items, updateQty, removeItem, clearCart, subtotal } = useCart();
  const navigate = useNavigate();
  const { ask, dialog } = useConfirm();

  if (items.length === 0) {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="font-display text-3xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-gray-500">Looks like you have not added anything yet.</p>
        <Link to="/shop" className="btn-primary mt-6">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container-x py-8">
      {dialog}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Shopping Cart</h1>
        <button className="text-sm text-red-600 hover:underline" onClick={() => ask('Remove all items from your cart?', clearCart)}>Clear cart</button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {items.map((i) => (
            <div key={i.key} className="card flex gap-4 p-4">
              <Link to={`/product/${i.slug}`} className="h-28 w-24 shrink-0 overflow-hidden rounded-md bg-gray-100">
                <img src={i.image || PLACEHOLDER} alt={i.name} onError={onImgError} className="h-full w-full object-cover" />
              </Link>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between gap-2">
                  <div>
                    <Link to={`/product/${i.slug}`} className="font-medium hover:text-brand-dark">{i.name}</Link>
                    <p className="text-xs text-gray-500">{[i.size && `Size: ${i.size}`, i.color && `Color: ${i.color}`].filter(Boolean).join(' | ')}</p>
                  </div>
                  <button onClick={() => removeItem(i.key)} className="text-gray-400 hover:text-red-600" aria-label="Remove"><FiTrash2 /></button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded-md border">
                    <button className="px-3 py-1" onClick={() => updateQty(i.key, i.quantity - 1)} aria-label="Decrease">−</button>
                    <span className="w-8 text-center text-sm">{i.quantity}</span>
                    <button className="px-3 py-1" onClick={() => updateQty(i.key, i.quantity + 1)} aria-label="Increase">+</button>
                  </div>
                  <p className="font-semibold">{money(i.price * i.quantity)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card h-fit p-5">
          <h2 className="text-lg font-semibold">Order Summary</h2>
          <div className="mt-4 flex justify-between text-sm"><span>Subtotal</span><span className="font-semibold">{money(subtotal)}</span></div>
          <p className="mt-2 text-xs text-gray-500">Shipping and coupon discount are calculated at checkout.</p>
          <button className="btn-primary mt-5 w-full py-3" onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
          <Link to="/shop" className="mt-3 block text-center text-sm text-gray-600 hover:underline">Continue shopping</Link>
        </div>
      </div>
    </div>
  );
}
