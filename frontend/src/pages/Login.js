import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FcGoogle } from 'react-icons/fc';
import { authError, useAuth } from '../context/AuthContext';
import useTitle from '../utils/useTitle';

export default function Login() {
  useTitle('Login');
  const { login, googleLogin, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);

  const done = (user) => {
    toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
    navigate(from, { replace: true });
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      done(await login(form.email, form.password));
    } catch (err) {
      toast.error(authError(err));
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    try {
      done(await googleLogin());
    } catch (err) {
      toast.error(authError(err));
    }
  };

  const forgot = async () => {
    if (!form.email) return toast.error('Enter your email first');
    try {
      await resetPassword(form.email);
      toast.success('Password reset email sent. Check your inbox');
    } catch (err) {
      toast.error(authError(err));
    }
  };

  return (
    <div className="container-x flex justify-center py-16">
      <div className="card w-full max-w-md p-8">
        <h1 className="font-display text-3xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-gray-500">Login to your account</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div><label className="label">Email</label><input type="email" required className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><label className="label">Password</label><input type="password" required className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
          <button type="button" onClick={forgot} className="text-sm text-brand-dark hover:underline">Forgot password?</button>
          <button className="btn-primary w-full py-3" disabled={busy}>{busy ? 'Logging in...' : 'Login'}</button>
        </form>
        <div className="my-5 flex items-center gap-3 text-xs text-gray-400"><span className="h-px flex-1 bg-gray-200" />OR<span className="h-px flex-1 bg-gray-200" /></div>
        <button onClick={google} className="btn-outline w-full py-3"><FcGoogle size={20} /> Continue with Google</button>
        <p className="mt-6 text-center text-sm text-gray-600">New here? <Link to="/register" state={{ from }} className="font-semibold text-brand-dark hover:underline">Create an account</Link></p>
      </div>
    </div>
  );
}
