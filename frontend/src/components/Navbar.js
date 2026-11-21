import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiHeart, FiMenu, FiSearch, FiShoppingBag, FiUser, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCatalog } from '../context/CatalogContext';
import { useSettings } from '../context/SettingsContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { ids } = useWishlist();
  const { topCategories, childrenOf } = useCatalog();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [q, setQ] = useState('');

  const search = (e) => {
    e.preventDefault();
    navigate(`/shop?search=${encodeURIComponent(q.trim())}`);
    setMenuOpen(false);
  };
  const handleLogout = async () => {
    await logout();
    setUserOpen(false);
    navigate('/');
  };
  const linkClass = ({ isActive }) => `text-sm font-medium transition hover:text-brand-dark ${isActive ? 'text-brand-dark' : 'text-gray-700'}`;
  const menuItem = 'block px-4 py-2 text-sm hover:bg-gray-50';

  const searchForm = (
    <form onSubmit={search} className="flex w-full items-center rounded-full border border-gray-300 bg-gray-50 px-4 focus-within:border-ink">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search shirts, jeans, hoodies..." className="w-full bg-transparent py-2 text-sm outline-none" />
      <button type="submit" aria-label="Search"><FiSearch /></button>
    </form>
  );

  return (
    <header className="sticky top-0 z-40 border-b bg-white">
      <div className="bg-ink py-1.5 text-center text-xs text-white">
        {settings.shipping.freeShippingOver > 0 ? `Free delivery on orders over ৳${settings.shipping.freeShippingOver}` : 'Cash on Delivery available all over Bangladesh'}
      </div>
      <div className="container-x flex h-16 items-center gap-4">
        <button className="lg:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight sm:text-2xl">
          <img src="/logo-icon.png" alt={settings.storeName} className="h-9 w-9 sm:h-10 sm:w-10" />
          <span>{settings.storeName}</span>
        </Link>

        <nav className="ml-6 hidden items-center gap-6 lg:flex">
          <NavLink to="/" end className={linkClass}>Home</NavLink>
          <NavLink to="/shop" end className={linkClass}>Shop</NavLink>
          {topCategories.slice(0, 5).map((c) => (
            <div key={c._id} className="group relative">
              <Link to={`/shop?category=${c.slug}`} className="text-sm font-medium text-gray-700 hover:text-brand-dark">{c.name}</Link>
              {childrenOf(c._id).length > 0 && (
                <div className="invisible absolute left-0 top-full z-10 min-w-[11rem] rounded-md border bg-white py-2 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
                  {childrenOf(c._id).map((s) => (
                    <Link key={s._id} to={`/shop?category=${s.slug}`} className={menuItem}>{s.name}</Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="ml-auto hidden max-w-xs flex-1 md:block">{searchForm}</div>

        <div className="ml-auto flex items-center gap-4 md:ml-0">
          <Link to="/wishlist" className="relative" aria-label="Wishlist">
            <FiHeart size={22} />
            {ids.length > 0 && <span className="absolute -right-2 -top-2 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-brand px-1 text-[10px] text-white">{ids.length}</span>}
          </Link>
          <Link to="/cart" className="relative" aria-label="Cart">
            <FiShoppingBag size={22} />
            {count > 0 && <span className="absolute -right-2 -top-2 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-brand px-1 text-[10px] text-white">{count}</span>}
          </Link>
          {user ? (
            <div className="relative">
              <button onClick={() => setUserOpen(!userOpen)} className="flex items-center gap-1 text-sm font-medium" aria-label="Account">
                <FiUser size={22} />
                <span className="hidden max-w-[6rem] truncate sm:block">{user.name.split(' ')[0]}</span>
              </button>
              {userOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-md border bg-white py-2 shadow-lg" onClick={() => setUserOpen(false)}>
                  {user.role === 'admin' && <Link to="/admin" className={`${menuItem} font-semibold text-brand-dark`}>Admin Dashboard</Link>}
                  <Link to="/profile" className={menuItem}>My Profile</Link>
                  <Link to="/orders" className={menuItem}>My Orders</Link>
                  <Link to="/wishlist" className={menuItem}>Wishlist</Link>
                  <Link to="/track-order" className={menuItem}>Track Order</Link>
                  <button onClick={handleLogout} className={`${menuItem} w-full text-left text-red-600`}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn-primary btn-sm">Login</Link>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className="border-t bg-white px-4 py-4 lg:hidden" onClick={(e) => e.target.tagName === 'A' && setMenuOpen(false)}>
          <div className="mb-4 md:hidden">{searchForm}</div>
          <div className="flex flex-col gap-3 text-sm font-medium">
            <Link to="/">Home</Link>
            <Link to="/shop">Shop All</Link>
            {topCategories.map((c) => (
              <div key={c._id}>
                <Link to={`/shop?category=${c.slug}`}>{c.name}</Link>
                {childrenOf(c._id).map((s) => (
                  <Link key={s._id} to={`/shop?category=${s.slug}`} className="ml-4 mt-2 block text-gray-500">{s.name}</Link>
                ))}
              </div>
            ))}
            <Link to="/track-order">Track Order</Link>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact Us</Link>
          </div>
        </div>
      )}
    </header>
  );
}
