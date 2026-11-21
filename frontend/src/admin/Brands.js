import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import api, { errMsg } from '../services/api';
import { useCatalog } from '../context/CatalogContext';
import { useConfirm } from '../components/ConfirmDialog';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';

export default function Brands() {
  const { reloadCatalog } = useCatalog();
  const { ask, dialog } = useConfirm();
  const [brands, setBrands] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', isActive: true });
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    api.get('/brands').then((r) => setBrands(r.data)).catch((e) => toast.error(errMsg(e)));
    reloadCatalog();
  }, [reloadCatalog]);

  useEffect(() => {
    load();
  }, [load]);

  const open = (b) => {
    setEditing(b);
    setForm(b ? { name: b.name, isActive: b.isActive } : { name: '', isActive: true });
    setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await api.put(`/brands/${editing._id}`, form);
      else await api.post('/brands', form);
      toast.success('Brand saved');
      setModal(false);
      load();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = (b) =>
    ask({ title: 'Delete brand?', message: `"${b.name}" will be deleted.`, confirmText: 'Delete' }, async () => {
      try {
        await api.delete(`/brands/${b._id}`);
        toast.success('Brand deleted');
        load();
      } catch (err) {
        toast.error(errMsg(err));
      }
    });

  return (
    <div>
      {dialog}
      <PageHeader title="Brands">
        <button className="btn-primary btn-sm" onClick={() => open(null)}><FiPlus /> Add Brand</button>
      </PageHeader>
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead><tr><th className="th">Name</th><th className="th">Status</th><th className="th text-right">Actions</th></tr></thead>
          <tbody className="divide-y">
            {brands.map((b) => (
              <tr key={b._id}>
                <td className="td font-medium">{b.name}</td>
                <td className="td"><span className={`rounded-full px-2 py-0.5 text-xs ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{b.isActive ? 'Active' : 'Hidden'}</span></td>
                <td className="td text-right">
                  <button onClick={() => open(b)} className="mr-2 text-blue-600" aria-label="Edit"><FiEdit2 /></button>
                  <button onClick={() => remove(b)} className="text-red-600" aria-label="Delete"><FiTrash2 /></button>
                </td>
              </tr>
            ))}
            {brands.length === 0 && <tr><td colSpan="3" className="td py-10 text-center text-gray-500">No brands yet.</td></tr>}
          </tbody>
        </table>
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Brand' : 'Add Brand'}>
        <form onSubmit={save} className="space-y-4">
          <div><label className="label">Brand Name *</label><input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Visible in store</label>
          <button className="btn-primary w-full" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </form>
      </Modal>
    </div>
  );
}
