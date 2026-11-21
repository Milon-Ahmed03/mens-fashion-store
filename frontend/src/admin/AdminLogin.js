import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../services/api';
import useTitle from '../utils/useTitle';

export default function AdminLogin() {
  useTitle('Admin Login');
  const { user, adminLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);

  if (user && user.role === 'admin') return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await adminLogin(form.email, form.password);
      navigate('/admin', { replace: true });
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-xl bg-white p-8 shadow-xl">
        <h1 className="font-display text-2xl font-bold">Admin Login</h1>
        <p className="mb-6 text-sm text-gray-500">Sign in to manage your store</p>
        <div className="space-y-4">
          <div><label className="label">Email</label><input type="email" required className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><label className="label">Password</label><input type="password" required className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
          <button className="btn-primary w-full py-3" disabled={busy}>{busy ? 'Signing in...' : 'Login'}</button>
        </div>
      </form>
    </div>
  );
}
