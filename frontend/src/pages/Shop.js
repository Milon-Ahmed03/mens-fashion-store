import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiX } from 'react-icons/fi';
import api, { errMsg } from '../services/api';
import { useCatalog } from '../context/CatalogContext';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import Pagination from '../components/Pagination';
import useTitle from '../utils/useTitle';
import { SIZES } from '../utils/helpers';

const SORT_OPTIONS = [
  ['newest', 'Newest'],
  ['price_asc', 'Price: Low to High'],
  ['price_desc', 'Price: High to Low'],
  ['rating', 'Top Rated'],
  ['name', 'Name A-Z'],
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const { topCategories, childrenOf, brands } = useCatalog();
  const [data, setData] = useState({ items: [], pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [price, setPrice] = useState({ min: params.get('minPrice') || '', max: params.get('maxPrice') || '' });

  const get = (k) => params.get(k) || '';
  const category = get('category');
  const search = get('search');
  const page = Number(get('page')) || 1;
  const selectedBrands = get('brand') ? get('brand').split(',') : [];
  const selectedSizes = get('size') ? get('size').split(',') : [];

  useTitle(search ? `Search: ${search}` : 'Shop');

  // URL-এর যেকোনো Filter বদলালে Product আবার আনে
  useEffect(() => {
    setLoading(true);
    setError('');
    api
      .get(`/products?${params.toString()}&limit=12`)
      .then((r) => setData(r.data))
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));
  }, [params]);

  // একটি Filter বদলায়, পেজ আবার ১ হয়ে যায়
  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  const toggleIn = (key, list, value) => setFilter(key, (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]).join(','));
  const applyPrice = () => {
    const next = new URLSearchParams(params);
    price.min ? next.set('minPrice', price.min) : next.delete('minPrice');
    price.max ? next.set('maxPrice', price.max) : next.delete('maxPrice');
    next.delete('page');
    setParams(next);
  };
  const clearAll = () => {
    setPrice({ min: '', max: '' });
    setParams({});
  };
  const hasFilters = [...params.keys()].some((k) => k !== 'page' && k !== 'sort');

  const catLink = (c, sub = false) => (
    <button
      key={c._id}
      onClick={() => setFilter('category', c.slug)}
      className={`block w-full py-1 text-left text-sm hover:text-brand-dark ${sub ? 'pl-4 text-gray-500' : 'font-medium'} ${category === c.slug ? 'font-bold text-brand-dark' : ''}`}
    >
      {c.name}
    </button>
  );

  const filters = (
    <div className="space-y-7">
      <div>
        <h3 className="mb-2 text-sm font-bold uppercase tracking-wide">Categories</h3>
        <button onClick={() => setFilter('category', '')} className={`block py-1 text-sm ${!category ? 'font-bold text-brand-dark' : ''}`}>All Products</button>
        {topCategories.map((c) => (
          <div key={c._id}>
            {catLink(c)}
            {childrenOf(c._id).map((s) => catLink(s, true))}
          </div>
        ))}
      </div>
      <div>
        <h3 className="mb-2 text-sm font-bold uppercase tracking-wide">Brands</h3>
        {brands.map((b) => (
          <label key={b._id} className="flex cursor-pointer items-center gap-2 py-1 text-sm">
            <input type="checkbox" checked={selectedBrands.includes(b.slug)} onChange={() => toggleIn('brand', selectedBrands, b.slug)} />
            {b.name}
          </label>
        ))}
      </div>
      <div>
        <h3 className="mb-2 text-sm font-bold uppercase tracking-wide">Price (৳)</h3>
        <div className="flex items-center gap-2">
          <input type="number" min="0" placeholder="Min" className="input" value={price.min} onChange={(e) => setPrice({ ...price, min: e.target.value })} />
          <input type="number" min="0" placeholder="Max" className="input" value={price.max} onChange={(e) => setPrice({ ...price, max: e.target.value })} />
        </div>
        <button onClick={applyPrice} className="btn-outline btn-sm mt-2 w-full">Apply</button>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-bold uppercase tracking-wide">Size</h3>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <button key={s} onClick={() => toggleIn('size', selectedSizes, s)} className={`min-w-[2.5rem] rounded border px-2 py-1 text-xs ${selectedSizes.includes(s) ? 'border-ink bg-ink text-white' : 'border-gray-300 hover:border-ink'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <label className="flex cursor-pointer items-center gap-2">
          <input type="checkbox" checked={get('inStock') === 'true'} onChange={(e) => setFilter('inStock', e.target.checked ? 'true' : '')} /> In stock only
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <input type="checkbox" checked={get('onSale') === 'true'} onChange={(e) => setFilter('onSale', e.target.checked ? 'true' : '')} /> On sale
        </label>
      </div>
      {hasFilters && <button onClick={clearAll} className="btn-outline btn-sm w-full">Clear all filters</button>}
    </div>
  );

  return (
    <div className="container-x py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">{search ? `Results for "${search}"` : 'Shop'}</h1>
          <p className="text-sm text-gray-500">{data.total} products</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-outline btn-sm lg:hidden" onClick={() => setShowFilters(true)}><FiFilter /> Filters</button>
          <select className="input w-auto" value={get('sort') || 'newest'} onChange={(e) => setFilter('sort', e.target.value)} aria-label="Sort">
            {SORT_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
        <aside className="hidden lg:block">{filters}</aside>

        {showFilters && (
          <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={() => setShowFilters(false)}>
            <div className="h-full w-80 max-w-[85%] overflow-y-auto bg-white p-5" onClick={(e) => e.stopPropagation()}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">Filters</h2>
                <button onClick={() => setShowFilters(false)} aria-label="Close"><FiX size={22} /></button>
              </div>
              {filters}
            </div>
          </div>
        )}

        <div>
          {error && <p className="rounded bg-red-50 p-4 text-sm text-red-600">{error}</p>}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 xl:grid-cols-3">
            {loading ? <ProductSkeleton count={6} /> : data.items.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
          {!loading && !error && data.items.length === 0 && (
            <div className="py-20 text-center text-gray-500">
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm">Try changing or clearing your filters.</p>
            </div>
          )}
          <Pagination page={data.page || page} pages={data.pages} onChange={(p) => { setFilter('page', String(p)); window.scrollTo(0, 0); }} />
        </div>
      </div>
    </div>
  );
}
