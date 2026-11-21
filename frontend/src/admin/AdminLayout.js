import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  FiBarChart2, FiBox, FiDollarSign, FiGrid, FiHome, FiImage, FiLayers, FiLogOut, FiMenu, FiMessageSquare, FiPackage,
  FiPercent, FiSettings, FiShoppingCart, FiStar, FiTag, FiTruck, FiUser, FiUsers, FiX,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import useTitle from '../utils/useTitle';

const LINKS = [
  ['/admin', 'Dashboard', FiGrid, true],
  ['/admin/products', 'Products', FiBox],
  ['/admin/categories', 'Categories', FiLayers],
  ['/admin/brands', 'Brands', FiTag],
  ['/admin/inventory', 'Inventory', FiPackage],
  ['/admin/orders', 'Orders', FiShoppingCart],
  ['/admin/customers', 'Customers', FiUsers],
  ['/admin/coupons', 'Coupons', FiPercent],
  ['/admin/discounts', 'Discounts', FiDollarSign],
  ['/admin/reviews', 'Reviews', FiStar],
  ['/admin/banners', 'Banners', FiImage],
  ['/admin/homepage', 'Homepage Content', FiHome],
  ['/admin/shipping', 'Shipping Charges', FiTruck],
  ['/admin/settings', 'Store Settings', FiSettings],
  ['/admin/reports', 'Sales Reports', FiBarChart2],
  ['/admin/messages', 'Messages', FiMessageSquare],
  ['/admin/profile', 'My Profile', FiUser],
];

export default function AdminLayout() {
  useTitle('Admin');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {open && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-ink text-gray-300 transition-transform lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 shrink-0 items-center justify-between px-5">
          <span className="font-display text-xl font-bold text-white">Admin Panel</span>
          <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><FiX size={22} /></button>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4" onClick={() => setOpen(false)}>
          {LINKS.map(([to, label, Icon, end]) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition ${isActive ? 'bg-brand text-white' : 'hover:bg-white/10 hover:text-white'}`}
            >
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-white px-4 sm:px-6">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><FiMenu size={24} /></button>
          <div className="ml-auto flex items-center gap-4 text-sm">
            <Link to="/" target="_blank" className="text-gray-600 hover:text-ink">View Store</Link>
            <span className="hidden text-gray-500 sm:block">{user?.name}</span>
            <button onClick={handleLogout} className="flex items-center gap-1 text-red-600"><FiLogOut /> Logout</button>
          </div>
        </header>
        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
