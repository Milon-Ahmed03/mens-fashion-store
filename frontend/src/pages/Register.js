import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authError, useAuth } from '../context/AuthContext';
import useTitle from '../utils/useTitle';

export default function Register() {
  useTitle('Create Account');
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    setBusy(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created!');
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      toast.error(authError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-x flex justify-center py-16">
      <div className="card w-full max-w-md p-8">
        <h1 className="font-display text-3xl font-bold">Create account</h1>
        <p className="mt-1 text-sm text-gray-500">Join us to track orders and save favourites</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div><label className="label">Full Name</label><input required className="input" value={form.name} onChange={set('name')} /></div>
          <div><label className="label">Email</label><input type="email" required className="input" value={form.email} onChange={set('email')} /></div>
          <div><label className="label">Password</label><input type="password" required className="input" value={form.password} onChange={set('password')} /></div>
          <div><label className="label">Confirm Password</label><input type="password" required className="input" value={form.confirm} onChange={set('confirm')} /></div>
          <button className="btn-primary w-full py-3" disabled={busy}>{busy ? 'Creating...' : 'Register'}</button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">Already have an account? <Link to="/login" className="font-semibold text-brand-dark hover:underline">Login</Link></p>
      </div>
    </div>
  );
}
