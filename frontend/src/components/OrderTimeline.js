import { FiCheck } from 'react-icons/fi';
import { ORDER_STATUSES, formatDateTime } from '../utils/helpers';

// Order Tracking: অর্ডার কোন ধাপে আছে তা দেখায়
export default function OrderTimeline({ status, history = [] }) {
  if (status === 'cancelled' || status === 'returned') {
    return <div className="rounded-lg bg-red-50 p-4 text-sm font-medium capitalize text-red-700">This order was {status}.</div>;
  }
  const current = ORDER_STATUSES.indexOf(status);
  return (
    <ol className="space-y-0">
      {ORDER_STATUSES.map((s, i) => {
        const done = i <= current;
        const entry = [...history].reverse().find((h) => h.status === s);
        return (
          <li key={s} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${done ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {done ? <FiCheck /> : i + 1}
              </span>
              {i < ORDER_STATUSES.length - 1 && <span className={`h-8 w-0.5 ${i < current ? 'bg-green-600' : 'bg-gray-200'}`} />}
            </div>
            <div className="pb-4">
              <p className={`text-sm font-semibold capitalize ${done ? 'text-ink' : 'text-gray-400'}`}>{s}</p>
              {entry && done && <p className="text-xs text-gray-500">{formatDateTime(entry.date)}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
