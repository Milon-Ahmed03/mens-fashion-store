import { Fragment, useState } from 'react';
import toast from 'react-hot-toast';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import api, { errMsg } from '../services/api';
import { useCatalog } from '../context/CatalogContext';
import { useConfirm } from '../components/ConfirmDialog';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';

const EMPTY = { name: '', parent: '', isActive: true };

// Category ও Subcategory ম্যানেজমেন্ট
export default function Categories() {
  const { categories, reloadCatalog } = useCatalog();
  const { ask, dialog } = useConfirm();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const tops = categories.filter((c) => !c.parent);
  const open = (c) => {
    setEditing(c);
    setForm(c ? { name: c.name, parent: c.parent || '', isActive: c.isActive } : EMPTY);
    setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { name: form.name, parent: form.parent || null, isActive: form.isActive };
    try {
      if (editing) await api.put(`/categories/${editing._id}`, payload);
      else await api.post('/categories', payload);
      toast.success('Category saved');
      setModal(false);
      reloadCatalog();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = (c) =>
    ask({ title: 'Delete category?', message: `"${c.name}" will be deleted.`, confirmText: 'Delete' }, async () => {
      try {
        await api.delete(`/categories/${c._id}`);
        toast.success('Category deleted');
        reloadCatalog();
      } catch (err) {
        toast.error(errMsg(err));
      }
    });

  const Row = ({ c, sub }) => (
    <tr>
      <td className={`td ${sub ? 'pl-10 text-gray-600' : 'font-medium'}`}>{sub && '↳ '}{c.name}</td>
      <td className="td text-gray-500">{c.slug}</td>
      <td className="td"><span className={`rounded-full px-2 py-0.5 text-xs ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{c.isActive ? 'Active' : 'Hidden'}</span></td>
      <td className="td text-right">
        <button onClick={() => open(c)} className="mr-2 text-blue-600" aria-label="Edit"><FiEdit2 /></button>
        <button onClick={() => remove(c)} className="text-red-600" aria-label="Delete"><FiTrash2 /></button>
      </td>
    </tr>
  );

  return (
    <div>
      {dialog}
      <PageHeader title="Categories" subtitle="Categories and subcategories">
        <button className="btn-primary btn-sm" onClick={() => open(null)}><FiPlus /> Add Category</button>
      </PageHeader>
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead><tr><th className="th">Name</th><th className="th">URL slug</th><th className="th">Status</th><th className="th text-right">Actions</th></tr></thead>
          <tbody className="divide-y">
            {tops.map((c) => (
              <Fragment key={c._id}>
                <Row c={c} />
                {categories.filter((s) => s.parent === c._id).map((s) => <Row key={s._id} c={s} sub />)}
              </Fragment>
            ))}
            {tops.length === 0 && <tr><td colSpan="4" className="td py-10 text-center text-gray-500">No categories yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={save} className="space-y-4">
          <div><label className="label">Name *</label><input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div>
            <label className="label">Parent Category (leave empty for a main category)</label>
            <select className="input" value={form.parent} onChange={(e) => setForm({ ...form, parent: e.target.value })}>
              <option value="">None (main category)</option>
              {tops.filter((t) => !editing || t._id !== editing._id).map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Visible in store</label>
          <button className="btn-primary w-full" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </form>
      </Modal>
    </div>
  );
}
