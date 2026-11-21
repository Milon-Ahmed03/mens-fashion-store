import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiTrash2 } from 'react-icons/fi';
import api, { errMsg } from '../services/api';
import { useConfirm } from '../components/ConfirmDialog';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import Spinner from '../components/Spinner';
import StarRating from '../components/StarRating';
import { formatDate } from '../utils/helpers';

export default function Reviews() {
  const { ask, dialog } = useConfirm();
  const [data, setData] = useState({ items: [], pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api.get(`/reviews?page=${page}`).then((r) => setData(r.data)).catch((e) => toast.error(errMsg(e))).finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = async (r) => {
    try {
      await api.put(`/reviews/${r._id}/approve`);
      toast.success(r.isApproved ? 'Review hidden' : 'Review approved');
      load();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const remove = (r) =>
    ask({ title: 'Delete review?', message: 'This review will be deleted permanently.', confirmText: 'Delete' }, async () => {
      try {
        await api.delete(`/reviews/${r._id}`);
        toast.success('Review deleted');
        load();
      } catch (e) {
        toast.error(errMsg(e));
      }
    });

  return (
    <div>
      {dialog}
      <PageHeader title="Reviews" subtitle={`${data.total} reviews`} />
      <div className="card overflow-x-auto">
        {loading ? <Spinner className="py-12" /> : (
          <table className="w-full">
            <thead><tr><th className="th">Product</th><th className="th">Customer</th><th className="th">Rating</th><th className="th">Comment</th><th className="th">Date</th><th className="th">Status</th><th className="th text-right">Actions</th></tr></thead>
            <tbody className="divide-y">
              {data.items.map((r) => (
                <tr key={r._id}>
                  <td className="td max-w-[10rem] truncate font-medium">{r.product?.name || 'Deleted product'}</td>
                  <td className="td">{r.user?.name}</td>
                  <td className="td"><StarRating value={r.rating} size={12} /></td>
                  <td className="td max-w-xs truncate">{r.comment || '-'}</td>
                  <td className="td">{formatDate(r.createdAt)}</td>
                  <td className="td"><span className={`rounded-full px-2 py-0.5 text-xs ${r.isApproved ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{r.isApproved ? 'Visible' : 'Hidden'}</span></td>
                  <td className="td text-right">
                    <button className="btn-outline btn-sm mr-2" onClick={() => toggle(r)}>{r.isApproved ? 'Hide' : 'Approve'}</button>
                    <button onClick={() => remove(r)} className="text-red-600" aria-label="Delete"><FiTrash2 /></button>
                  </td>
                </tr>
              ))}
              {data.items.length === 0 && <tr><td colSpan="7" className="td py-10 text-center text-gray-500">No reviews yet.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
      <Pagination page={page} pages={data.pages} onChange={setPage} />
    </div>
  );
}
