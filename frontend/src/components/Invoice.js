import { formatDate, money } from '../utils/helpers';

// Invoice: Customer ও Admin দুজনেই Print করতে পারে (id="invoice" অংশটাই প্রিন্ট হয়)
export default function Invoice({ order, settings }) {
  const a = order.shippingAddress;
  return (
    <div id="invoice" className="mx-auto max-w-3xl rounded-xl border bg-white p-8 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-6">
        <div>
          <h2 className="font-display text-2xl font-bold">{settings.storeName}</h2>
          <p className="mt-1 text-sm text-gray-500">{settings.address}</p>
          <p className="text-sm text-gray-500">
            {settings.phone} {settings.email && `| ${settings.email}`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold uppercase tracking-wide">Invoice</p>
          <p className="text-sm">#{order.orderNumber}</p>
          <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
        </div>
      </div>

      <div className="grid gap-6 py-6 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase text-gray-500">Bill / Ship To</p>
          <p className="mt-1 font-medium">{a.fullName}</p>
          <p className="text-sm text-gray-600">{a.phone}</p>
          <p className="text-sm text-gray-600">
            {a.street}, {a.city} {a.district && `, ${a.district}`} {a.postalCode}
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-xs font-semibold uppercase text-gray-500">Payment</p>
          <p className="mt-1 font-medium">Cash on Delivery</p>
          <p className="text-sm capitalize text-gray-600">Status: {order.status}</p>
        </div>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-y bg-gray-50 text-left">
            <th className="px-3 py-2">Item</th>
            <th className="px-3 py-2 text-right">Price</th>
            <th className="px-3 py-2 text-right">Qty</th>
            <th className="px-3 py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((i, idx) => (
            <tr key={idx} className="border-b">
              <td className="px-3 py-2">
                {i.name}
                <span className="block text-xs text-gray-500">{[i.size && `Size: ${i.size}`, i.color && `Color: ${i.color}`].filter(Boolean).join(' | ')}</span>
              </td>
              <td className="px-3 py-2 text-right">{money(i.price)}</td>
              <td className="px-3 py-2 text-right">{i.quantity}</td>
              <td className="px-3 py-2 text-right">{money(i.price * i.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="ml-auto mt-6 w-full max-w-xs space-y-1.5 text-sm">
        <div className="flex justify-between"><span>Subtotal</span><span>{money(order.subtotal)}</span></div>
        {order.discount > 0 && <div className="flex justify-between text-green-700"><span>Discount {order.couponCode && `(${order.couponCode})`}</span><span>- {money(order.discount)}</span></div>}
        <div className="flex justify-between"><span>Shipping</span><span>{money(order.shippingCharge)}</span></div>
        <div className="flex justify-between border-t pt-2 text-base font-bold"><span>Total</span><span>{money(order.total)}</span></div>
      </div>

      <p className="mt-8 text-center text-xs text-gray-500">Thank you for shopping with {settings.storeName}!</p>
    </div>
  );
}
