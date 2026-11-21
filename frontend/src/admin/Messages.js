import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiTrash2 } from 'react-icons/fi';
import api, { errMsg } from '../services/api';
import { useConfirm } from '../components/ConfirmDialog';
import PageHeader from '../components/PageHeader';
import { formatDateTime } from '../utils/helpers';

// Contact Us ফর্ম থেকে আসা মেসেজ
export default function Messages() {
  const { ask, dialog } = useConfirm();
  const [messages, setMessages] = useState([]);

  const load = useCallback(() => {
    api.get('/contact').then((r) => setMessages(r.data)).catch((e) => toast.error(errMsg(e)));
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const markRead = async (m) => {
    if (m.isRead) return;
    await api.put(`/contact/${m._id}/read`).catch(() => { });
    load();
  };

  const remove = (m) =>
    ask({ title: 'Delete message?', message: 'This message will be deleted.', confirmText: 'Delete' }, async () => {
      try {
        await api.delete(`/contact/${m._id}`);
        load();
      } catch (e) {
        toast.error(errMsg(e));
      }
    });

  return (
    <div>
      {dialog}
      <PageHeader title="Messages" subtitle="From the Contact Us page" />
      <div className="space-y-4">
        {messages.map((m) => (
          <div key={m._id} className={`card p-5 ${m.isRead ? '' : 'border-l-4 border-l-brand'}`} onClick={() => markRead(m)}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{m.subject || '(no subject)'}</p>
                <p className="text-sm text-gray-600">{m.name} · <a className="text-brand-dark" href={`mailto:${m.email}`}>{m.email}</a></p>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                {formatDateTime(m.createdAt)}
                <button onClick={(e) => { e.stopPropagation(); remove(m); }} className="text-red-600" aria-label="Delete"><FiTrash2 size={16} /></button>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-line text-sm text-gray-700">{m.message}</p>
          </div>
        ))}
        {messages.length === 0 && <p className="text-gray-500">No messages yet.</p>}
      </div>
    </div>
  );
}
