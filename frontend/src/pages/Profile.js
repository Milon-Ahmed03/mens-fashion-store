import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errMsg } from '../services/api';
import { authError, useAuth } from '../context/AuthContext';
import useTitle from '../utils/useTitle';

export default function Profile() {
  useTitle('My Profile');
  const { user, setUser, resetPassword } = useAuth();
  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone || '',
    street: user.address?.street || '',
    city: user.address?.city || '',
    district: user.address?.district || '',
    postalCode: user.address?.postalCode || '',
  });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { name, phone, ...address } = form;
      const { data } = await api.put('/auth/profile', { name, phone, address });
      setUser(data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const changePassword = async () => {
    try {
      await resetPassword(user.email);
      toast.success('Password reset email sent. Check your inbox');
    } catch (err) {
      toast.error(authError(err));
    }
  };

  return (
    <div className="container-x py-8">
      <h1 className="mb-6 font-display text-3xl font-bold">My Profile</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <form onSubmit={save} className="card space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label">Full Name</label><input required className="input" value={form.name} onChange={set('name')} /></div>
            <div><label className="label">Email</label><input className="input bg-gray-100" value={user.email} disabled /></div>
            <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={set('phone')} /></div>
            <div><label className="label">City</label><input className="input" value={form.city} onChange={set('city')} /></div>
            <div className="sm:col-span-2"><label className="label">Address</label><input className="input" value={form.street} onChange={set('street')} /></div>
            <div><label className="label">District</label><input className="input" value={form.district} onChange={set('district')} /></div>
            <div><label className="label">Postal Code</label><input className="input" value={form.postalCode} onChange={set('postalCode')} /></div>
          </div>
          <button className="btn-primary" disabled={busy}>{busy ? 'Saving...' : 'Save Changes'}</button>
        </form>
        <div className="space-y-3">
          <Link to="/orders" className="btn-outline w-full">Order History</Link>
          <Link to="/wishlist" className="btn-outline w-full">My Wishlist</Link>
          <button onClick={changePassword} className="btn-outline w-full">Change Password (email link)</button>
        </div>
      </div>
    </div>
  );
}
