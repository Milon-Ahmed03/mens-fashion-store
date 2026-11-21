import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram } from 'react-icons/fa';
import { useSettings } from '../context/SettingsContext';
import { useCatalog } from '../context/CatalogContext';

export default function Footer() {
  const { settings } = useSettings();
  const { topCategories } = useCatalog();
  return (
    <footer className="mt-20 bg-ink text-gray-300">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>

          <div className="flex items-center gap-2">
            <img src="/logo-icon.png" alt={settings.storeName} className="h-9 w-9" />
            <h3 className="font-display text-xl font-bold text-white">{settings.storeName}</h3>
          </div>

          <p className="mt-3 text-sm">{settings.tagline}</p>
          <div className="mt-4 flex gap-3">
            {settings.facebook && <a href={settings.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="rounded-full bg-white/10 p-2 hover:bg-brand"><FaFacebookF /></a>}
            {settings.instagram && <a href={settings.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="rounded-full bg-white/10 p-2 hover:bg-brand"><FaInstagram /></a>}
          </div>
        </div>
        <div>
          <h4 className="mb-3 font-semibold text-white">Shop</h4>
          <ul className="space-y-2 text-sm">
            {topCategories.slice(0, 6).map((c) => (
              <li key={c._id}><Link to={`/shop?category=${c.slug}`} className="hover:text-white">{c.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold text-white">Help</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/track-order" className="hover:text-white">Track Order</Link></li>
            <li><Link to="/orders" className="hover:text-white">My Orders</Link></li>
            <li><Link to="/wishlist" className="hover:text-white">Wishlist</Link></li>
            <li><Link to="/about" className="hover:text-white">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold text-white">Contact</h4>
          <ul className="space-y-2 text-sm">
            {settings.address && <li>{settings.address}</li>}
            {settings.phone && <li>{settings.phone}</li>}
            {settings.email && <li>{settings.email}</li>}
            <li className="pt-2 text-xs text-gray-400">Payment: Cash on Delivery</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} {settings.storeName}. All rights reserved.
      </div>
    </footer>
  );
}
