import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useWishlist } from '../context/WishlistContext';
import StarRating from './StarRating';
import { discountPercent, money, onImgError, PLACEHOLDER } from '../utils/helpers';

export default function ProductCard({ product }) {
  const { has, toggle } = useWishlist();
  const liked = has(product._id);
  const off = discountPercent(product);
  const first = product.images?.[0]?.url || PLACEHOLDER;
  const second = product.images?.[1]?.url;

  return (
    <div className="group">
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-gray-100">
        <Link to={`/product/${product.slug}`}>
          <img src={first} alt={product.name} loading="lazy" onError={onImgError} className={`h-full w-full object-cover transition duration-500 ${second ? 'group-hover:opacity-0' : 'group-hover:scale-105'}`} />
          {second && <img src={second} alt="" loading="lazy" onError={onImgError} className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-100" />}
        </Link>
        {off > 0 && <span className="absolute left-2 top-2 rounded bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">-{off}%</span>}
        {product.stock === 0 && <span className="absolute bottom-2 left-2 rounded bg-ink px-2 py-0.5 text-xs font-semibold text-white">Out of stock</span>}
        <button
          onClick={() => toggle(product._id)}
          aria-label="Wishlist"
          className="absolute right-2 top-2 rounded-full bg-white p-2 text-gray-700 shadow transition hover:scale-110"
        >
          {liked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
        </button>
      </div>
      <div className="mt-3">
        <p className="text-xs uppercase tracking-wide text-gray-500">{product.brand?.name || product.category?.name}</p>
        <Link to={`/product/${product.slug}`} className="mt-0.5 block truncate font-medium hover:text-brand-dark">
          {product.name}
        </Link>
        <div className="mt-1 flex items-center gap-2">
          <span className="font-semibold">{money(product.finalPrice)}</span>
          {off > 0 && <span className="text-sm text-gray-400 line-through">{money(product.price)}</span>}
        </div>
        {product.numReviews > 0 && (
          <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
            <StarRating value={product.ratingAvg} size={12} /> ({product.numReviews})
          </div>
        )}
      </div>
    </div>
  );
}
