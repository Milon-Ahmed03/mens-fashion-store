import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useSettings } from '../context/SettingsContext';
import { useCatalog } from '../context/CatalogContext';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import useTitle from '../utils/useTitle';

export default function Home() {
  useTitle('');
  const { settings } = useSettings();
  const { topCategories } = useCatalog();
  const h = settings.homepage;
  const [banners, setBanners] = useState([]);
  const [slide, setSlide] = useState(0);
  const [featured, setFeatured] = useState(null);
  const [latest, setLatest] = useState(null);

  useEffect(() => {
    api.get('/banners').then((r) => setBanners(r.data)).catch(() => {});
    api.get('/products?featured=true&limit=8').then((r) => setFeatured(r.data.items)).catch(() => setFeatured([]));
    api.get('/products?sort=newest&limit=8').then((r) => setLatest(r.data.items)).catch(() => setLatest([]));
  }, []);

  // ব্যানার নিজে নিজে বদলায়
  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(() => setSlide((s) => (s + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  const b = banners[slide];

  const Section = ({ title, items, link }) => (
    <section className="container-x mt-16">
      <div className="mb-6 flex items-end justify-between">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">{title}</h2>
        <Link to={link} className="text-sm font-semibold text-brand-dark hover:underline">View all</Link>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {items === null ? <ProductSkeleton count={4} /> : items.map((p) => <ProductCard key={p._id} product={p} />)}
      </div>
      {items && items.length === 0 && <p className="py-8 text-center text-gray-500">No products yet.</p>}
    </section>
  );

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink">
        {b && <img key={b._id} src={b.image} alt={b.title} className="absolute inset-0 h-full w-full object-cover opacity-50" />}
        <div className="container-x relative flex min-h-[420px] items-center py-16 sm:min-h-[520px]">
          <div className="max-w-xl text-white">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-brand">New Collection</p>
            <h1 className="font-display text-4xl font-bold leading-tight sm:text-6xl">{b ? b.title : h.heroTitle}</h1>
            <p className="mt-4 text-lg text-gray-200">{b ? b.subtitle : h.heroSubtitle}</p>
            <Link to={b ? b.link : '/shop'} className="btn-brand mt-8 px-8 py-3">{b ? b.buttonText : 'Shop Now'}</Link>
          </div>
        </div>
        {banners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {banners.map((_, i) => (
              <button key={i} onClick={() => setSlide(i)} aria-label={`Slide ${i + 1}`} className={`h-2 rounded-full transition-all ${i === slide ? 'w-6 bg-brand' : 'w-2 bg-white/60'}`} />
            ))}
          </div>
        )}
      </section>

      {/* Trust bar */}
      <section className="border-b bg-gray-50">
        <div className="container-x grid grid-cols-2 gap-4 py-5 text-center text-xs font-medium text-gray-600 sm:grid-cols-4 sm:text-sm">
          <span>Cash on Delivery</span>
          <span>Easy Order Tracking</span>
          <span>Premium Quality</span>
          <span>Fast Delivery</span>
        </div>
      </section>

      {h.showCategories && topCategories.length > 0 && (
        <section className="container-x mt-16">
          <h2 className="mb-6 text-center font-display text-2xl font-bold sm:text-3xl">Shop by Category</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {topCategories.map((c) => (
              <Link key={c._id} to={`/shop?category=${c.slug}`} className="rounded-lg border bg-white px-3 py-6 text-center text-sm font-semibold transition hover:border-ink hover:bg-brand-light">
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {h.showFeatured && <Section title={h.featuredTitle} items={featured} link="/shop?featured=true" />}

      {h.showPromo && (
        <section className="container-x mt-16">
          <div className="rounded-2xl bg-brand-light px-6 py-12 text-center sm:py-16">
            <h2 className="font-display text-3xl font-bold">{h.promoTitle}</h2>
            <p className="mx-auto mt-3 max-w-xl text-gray-600">{h.promoText}</p>
            <Link to="/shop" className="btn-primary mt-6">Explore Now</Link>
          </div>
        </section>
      )}

      {h.showNewArrivals && <Section title={h.newArrivalsTitle} items={latest} link="/shop?sort=newest" />}
    </div>
  );
}
