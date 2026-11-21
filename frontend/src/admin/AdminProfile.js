import { useState } from 'react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';

export default function AdminProfile() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState({ name: user.name, phone: user.phone || '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [busy, setBusy] = useState('');

  const saveProfile = async (e) => {
    e.preventDefault();
    setBusy('profile');
    try {
      const { data } = await api.put('/auth/profile', profile);
      setUser(data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy('');
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (pw.newPassword !== pw.confirm) return toast.error('New passwords do not match');
    setBusy('password');
    try {
      await api.put('/auth/password', { currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      toast.success('Password changed');
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy('');
    }
  };

  return (
    <div>
      <PageHeader title="My Profile" />
      <div className="grid max-w-4xl gap-6 md:grid-cols-2">
        <form onSubmit={saveProfile} className="card space-y-4 p-5">
          <h2 className="font-semibold">Profile</h2>
          <div><label className="label">Name</label><input required className="input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></div>
          <div><label className="label">Email</label><input className="input bg-gray-100" value={user.email} disabled /></div>
          <div><label className="label">Phone</label><input className="input" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></div>
          <button className="btn-primary" disabled={busy === 'profile'}>Save Profile</button>
        </form>
        <form onSubmit={savePassword} className="card space-y-4 p-5">
          <h2 className="font-semibold">Change Password</h2>
          <div><label className="label">Current Password</label><input type="password" required className="input" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} /></div>
          <div><label className="label">New Password</label><input type="password" required minLength="6" className="input" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /></div>
          <div><label className="label">Confirm New Password</label><input type="password" required className="input" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></div>
          <button className="btn-primary" disabled={busy === 'password'}>Change Password</button>
        </form>
      </div>
    </div>
  );
}
