import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import api, { errMsg } from '../services/api';
import { useConfirm } from '../components/ConfirmDialog';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import { formatDate, money } from '../utils/helpers';

const EMPTY = { code: '', type: 'percent', value: '', minOrder: '', maxDiscount: '', usageLimit: '', expiresAt: '', isActive: true };

export default function Coupons() {
  const { ask, dialog } = useConfirm();
  const [coupons, setCoupons] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    api.get('/coupons').then((r) => setCoupons(r.data)).catch((e) => toast.error(errMsg(e)));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const open = (c) => {
    setEditing(c);
    setForm(c ? { code: c.code, type: c.type, value: c.value, minOrder: c.minOrder || '', maxDiscount: c.maxDiscount || '', usageLimit: c.usageLimit || '', expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '', isActive: c.isActive } : EMPTY);
    setModal(true);
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const save = async (e) => {
    e.preventDefault();
    if (form.type === 'percent' && Number(form.value) > 100) return toast.error('Percent cannot be more than 100');
    setSaving(true);
    const payload = {
      code: form.code, type: form.type, value: Number(form.value), minOrder: Number(form.minOrder) || 0, maxDiscount: Number(form.maxDiscount) || 0,
      usageLimit: Number(form.usageLimit) || 0, expiresAt: form.expiresAt ? new Date(`${form.expiresAt}T23:59:59`) : null, isActive: form.isActive,
    };
    try {
      if (editing) await api.put(`/coupons/${editing._id}`, payload);
      else await api.post('/coupons', payload);
      toast.success('Coupon saved');
      setModal(false);
      load();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = (c) =>
    ask({ title: 'Delete coupon?', message: `Coupon ${c.code} will be deleted.`, confirmText: 'Delete' }, async () => {
      try {
        await api.delete(`/coupons/${c._id}`);
        toast.success('Coupon deleted');
        load();
      } catch (err) {
        toast.error(errMsg(err));
      }
    });

  return (
    <div>
      {dialog}
      <PageHeader title="Coupons">
        <button className="btn-primary btn-sm" onClick={() => open(null)}><FiPlus /> Add Coupon</button>
      </PageHeader>
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead><tr><th className="th">Code</th><th className="th">Discount</th><th className="th">Min Order</th><th className="th">Used</th><th className="th">Expires</th><th className="th">Status</th><th className="th text-right">Actions</th></tr></thead>
          <tbody className="divide-y">
            {coupons.map((c) => (
              <tr key={c._id}>
                <td className="td font-mono font-bold">{c.code}</td>
                <td className="td">{c.type === 'percent' ? `${c.value}%${c.maxDiscount ? ` (max ${money(c.maxDiscount)})` : ''}` : money(c.value)}</td>
                <td className="td">{c.minOrder ? money(c.minOrder) : '-'}</td>
                <td className="td">{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ''}</td>
                <td className="td">{c.expiresAt ? formatDate(c.expiresAt) : 'Never'}</td>
                <td className="td"><span className={`rounded-full px-2 py-0.5 text-xs ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{c.isActive ? 'Active' : 'Off'}</span></td>
                <td className="td text-right">
                  <button onClick={() => open(c)} className="mr-2 text-blue-600" aria-label="Edit"><FiEdit2 /></button>
                  <button onClick={() => remove(c)} className="text-red-600" aria-label="Delete"><FiTrash2 /></button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && <tr><td colSpan="7" className="td py-10 text-center text-gray-500">No coupons yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Coupon' : 'Add Coupon'}>
        <form onSubmit={save} className="space-y-4">
          <div><label className="label">Coupon Code *</label><input required className="input uppercase" value={form.code} onChange={set('code')} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Type</label><select className="input" value={form.type} onChange={set('type')}><option value="percent">Percent (%)</option><option value="fixed">Fixed amount (৳)</option></select></div>
            <div><label className="label">Value *</label><input required type="number" min="0" className="input" value={form.value} onChange={set('value')} /></div>
            <div><label className="label">Minimum Order (৳)</label><input type="number" min="0" className="input" value={form.minOrder} onChange={set('minOrder')} /></div>
            <div><label className="label">Max Discount (৳)</label><input type="number" min="0" className="input" disabled={form.type !== 'percent'} value={form.maxDiscount} onChange={set('maxDiscount')} /></div>
            <div><label className="label">Usage Limit</label><input type="number" min="0" className="input" placeholder="Empty = unlimited" value={form.usageLimit} onChange={set('usageLimit')} /></div>
            <div><label className="label">Expiry Date</label><input type="date" className="input" value={form.expiresAt} onChange={set('expiresAt')} /></div>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={set('isActive')} /> Active</label>
          <button className="btn-primary w-full" disabled={saving}>{saving ? 'Saving...' : 'Save Coupon'}</button>
        </form>
      </Modal>
    </div>
  );
}
