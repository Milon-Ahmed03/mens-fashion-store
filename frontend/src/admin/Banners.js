import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import api, { errMsg } from '../services/api';
import { useConfirm } from '../components/ConfirmDialog';
import ImageUploader from '../components/ImageUploader';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import { onImgError } from '../utils/helpers';

const EMPTY = { title: '', subtitle: '', buttonText: 'Shop Now', link: '/shop', order: 0, isActive: true, images: [] };

export default function Banners() {
  const { ask, dialog } = useConfirm();
  const [banners, setBanners] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    api.get('/banners/all').then((r) => setBanners(r.data)).catch((e) => toast.error(errMsg(e)));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const open = (b) => {
    setEditing(b);
    setForm(b ? { title: b.title, subtitle: b.subtitle, buttonText: b.buttonText, link: b.link, order: b.order, isActive: b.isActive, images: [{ url: b.image, publicId: b.imagePublicId }] } : EMPTY);
    setModal(true);
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const save = async (e) => {
    e.preventDefault();
    if (form.images.length === 0) return toast.error('Please upload a banner image');
    setSaving(true);
    const { images, ...rest } = form;
    const payload = { ...rest, order: Number(form.order) || 0, image: images[0].url, imagePublicId: images[0].publicId || '' };
    try {
      if (editing) await api.put(`/banners/${editing._id}`, payload);
      else await api.post('/banners', payload);
      toast.success('Banner saved');
      setModal(false);
      load();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = (b) =>
    ask({ title: 'Delete banner?', message: `"${b.title}" will be deleted.`, confirmText: 'Delete' }, async () => {
      try {
        await api.delete(`/banners/${b._id}`);
        toast.success('Banner deleted');
        load();
      } catch (err) {
        toast.error(errMsg(err));
      }
    });

  return (
    <div>
      {dialog}
      <PageHeader title="Banners" subtitle="Homepage slider banners (lowest order number shows first)">
        <button className="btn-primary btn-sm" onClick={() => open(null)}><FiPlus /> Add Banner</button>
      </PageHeader>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {banners.map((b) => (
          <div key={b._id} className="card overflow-hidden">
            <img src={b.image} alt={b.title} onError={onImgError} className="h-40 w-full object-cover" />
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div><p className="font-semibold">{b.title}</p><p className="text-xs text-gray-500">{b.subtitle}</p></div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{b.isActive ? 'Active' : 'Off'}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-gray-500">Order: {b.order}</span>
                <span>
                  <button onClick={() => open(b)} className="mr-3 text-blue-600" aria-label="Edit"><FiEdit2 /></button>
                  <button onClick={() => remove(b)} className="text-red-600" aria-label="Delete"><FiTrash2 /></button>
                </span>
              </div>
            </div>
          </div>
        ))}
        {banners.length === 0 && <p className="text-gray-500">No banners yet.</p>}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Banner' : 'Add Banner'} wide>
        <form onSubmit={save} className="space-y-4">
          <div><label className="label">Banner Image * (wide image works best)</label><ImageUploader images={form.images} multiple={false} onChange={(images) => setForm({ ...form, images })} /></div>
          <div><label className="label">Title *</label><input required className="input" value={form.title} onChange={set('title')} /></div>
          <div><label className="label">Subtitle</label><input className="input" value={form.subtitle} onChange={set('subtitle')} /></div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div><label className="label">Button Text</label><input className="input" value={form.buttonText} onChange={set('buttonText')} /></div>
            <div><label className="label">Button Link</label><input className="input" value={form.link} onChange={set('link')} /></div>
            <div><label className="label">Order</label><input type="number" className="input" value={form.order} onChange={set('order')} /></div>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={set('isActive')} /> Active</label>
          <button className="btn-primary w-full" disabled={saving}>{saving ? 'Saving...' : 'Save Banner'}</button>
        </form>
      </Modal>
    </div>
  );
}
