import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';
import useTitle from '../utils/useTitle';

export default function Wishlist() {
  useTitle('My Wishlist');
  const { ids } = useWishlist(); // ID বদলালে (Heart চাপলে) তালিকাও নতুন হয়
  const [items, setItems] = useState(null);

  useEffect(() => {
    api.get('/wishlist').then((r) => setItems(r.data)).catch(() => setItems([]));
  }, [ids]);

  if (!items) return <Spinner />;
  return (
    <div className="container-x py-8">
      <h1 className="mb-6 font-display text-3xl font-bold">My Wishlist</h1>
      {items.length === 0 ? (
        <div className="py-16 text-center text-gray-500">
          <p>Your wishlist is empty.</p>
          <Link to="/shop" className="btn-primary mt-4">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}
