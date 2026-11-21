import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaHeart, FaRegHeart, FaStar } from 'react-icons/fa';
import api, { errMsg } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import StarRating from '../components/StarRating';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';
import useTitle from '../utils/useTitle';
import { discountPercent, formatDate, money, onImgError, PLACEHOLDER } from '../utils/helpers';

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { has, toggle } = useWishlist();

  const [product, setProduct] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [imgIndex, setImgIndex] = useState(0);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('description');
  const [myReview, setMyReview] = useState({ rating: 5, comment: '' });
  const [sending, setSending] = useState(false);

  useTitle(product?.name);

  const loadReviews = (id) => api.get(`/reviews/product/${id}`).then((r) => setReviews(r.data)).catch(() => {});

  useEffect(() => {
    setProduct(null);
    setNotFound(false);
    setImgIndex(0);
    setSize('');
    setColor('');
    setQty(1);
    window.scrollTo(0, 0);
    api
      .get(`/products/${slug}`)
      .then((r) => {
        setProduct(r.data);
        loadReviews(r.data._id);
        api.get(`/products?category=${r.data.category?.slug}&limit=5`).then((x) => setRelated(x.data.items.filter((p) => p._id !== r.data._id).slice(0, 4))).catch(() => {});
      })
      .catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Link to="/shop" className="btn-primary mt-6">Back to Shop</Link>
      </div>
    );
  }
  if (!product) return <Spinner />;

  const off = discountPercent(product);
  const needSize = product.sizes.length > 0 && !size;
  const needColor = product.colors.length > 0 && !color;

  // Size/Color বাছাই হয়েছে কিনা দেখে Cart-এ যোগ করে
  const validate = () => {
    if (product.stock === 0) return toast.error('This product is out of stock') && false;
    if (needSize) return toast.error('Please select a size') && false;
    if (needColor) return toast.error('Please select a color') && false;
    return true;
  };
  const handleAdd = () => validate() && addToCart(product, { size, color, quantity: qty });
  const handleBuyNow = () => {
    if (!validate()) return;
    addToCart(product, { size, color, quantity: qty });
    navigate('/checkout');
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post('/reviews', { product: product._id, ...myReview });
      toast.success('Thanks for your review!');
      setMyReview({ rating: 5, comment: '' });
      loadReviews(product._id);
      api.get(`/products/${slug}`).then((r) => setProduct(r.data));
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setSending(false);
    }
  };

  const images = product.images.length ? product.images : [{ url: PLACEHOLDER }];

  return (
    <div className="container-x py-8">
      <nav className="mb-6 text-sm text-gray-500">
        <Link to="/" className="hover:text-ink">Home</Link> / <Link to="/shop" className="hover:text-ink">Shop</Link> /{' '}
        <Link to={`/shop?category=${product.category?.slug}`} className="hover:text-ink">{product.category?.name}</Link>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex gap-2 sm:flex-col">
            {images.map((img, i) => (
              <button key={i} onClick={() => setImgIndex(i)} className={`h-20 w-16 overflow-hidden rounded border-2 ${i === imgIndex ? 'border-ink' : 'border-transparent'}`}>
                <img src={img.url} alt="" onError={onImgError} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <div className="relative flex-1 overflow-hidden rounded-xl bg-gray-100">
            <img src={images[imgIndex].url} alt={product.name} onError={onImgError} className="aspect-[4/5] w-full object-cover" />
            {off > 0 && <span className="absolute left-3 top-3 rounded bg-red-600 px-2.5 py-1 text-sm font-semibold text-white">-{off}%</span>}
          </div>
        </div>

        {/* Info */}
        <div>
          {product.brand && <p className="text-sm uppercase tracking-wide text-gray-500">{product.brand.name}</p>}
          <h1 className="mt-1 font-display text-3xl font-bold">{product.name}</h1>
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
            <StarRating value={product.ratingAvg} /> <span>{product.ratingAvg || 0} ({product.numReviews} reviews)</span>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold">{money(product.finalPrice)}</span>
            {off > 0 && <span className="text-lg text-gray-400 line-through">{money(product.price)}</span>}
          </div>

          {product.sizes.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-semibold">Size {size && <span className="font-normal text-gray-500">: {size}</span>}</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button key={s} onClick={() => setSize(s)} className={`min-w-[3rem] rounded-md border px-3 py-2 text-sm ${size === s ? 'border-ink bg-ink text-white' : 'border-gray-300 hover:border-ink'}`}>{s}</button>
                ))}
              </div>
            </div>
          )}
          {product.colors.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-sm font-semibold">Color {color && <span className="font-normal text-gray-500">: {color}</span>}</p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button key={c} onClick={() => setColor(c)} className={`rounded-md border px-3 py-2 text-sm ${color === c ? 'border-ink bg-ink text-white' : 'border-gray-300 hover:border-ink'}`}>{c}</button>
                ))}
              </div>
            </div>
          )}

          <p className={`mt-5 text-sm font-medium ${product.stock === 0 ? 'text-red-600' : product.stock <= 5 ? 'text-orange-600' : 'text-green-700'}`}>
            {product.stock === 0 ? 'Out of stock' : product.stock <= 5 ? `Only ${product.stock} left!` : 'In stock'}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-md border">
              <button className="px-3 py-2 text-lg" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease">−</button>
              <span className="w-10 text-center text-sm font-semibold">{qty}</span>
              <button className="px-3 py-2 text-lg" onClick={() => setQty(Math.min(product.stock || 1, qty + 1))} aria-label="Increase">+</button>
            </div>
            <button className="btn-primary flex-1 py-3" onClick={handleAdd} disabled={product.stock === 0}>Add to Cart</button>
            <button className="btn-outline p-3" onClick={() => toggle(product._id)} aria-label="Wishlist">
              {has(product._id) ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
            </button>
          </div>
          <button className="btn-brand mt-3 w-full py-3" onClick={handleBuyNow} disabled={product.stock === 0}>Buy Now</button>
          <p className="mt-4 text-xs text-gray-500">Payment: Cash on Delivery</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-14">
        <div className="flex gap-6 border-b">
          {[['description', 'Description'], ['reviews', `Reviews (${reviews.length})`]].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={`-mb-px border-b-2 pb-3 text-sm font-semibold ${tab === k ? 'border-ink' : 'border-transparent text-gray-500'}`}>{l}</button>
          ))}
        </div>

        {tab === 'description' && <p className="mt-6 max-w-3xl whitespace-pre-line leading-relaxed text-gray-700">{product.description || 'No description yet.'}</p>}

        {tab === 'reviews' && (
          <div className="mt-6 grid gap-10 lg:grid-cols-2">
            <div className="space-y-5">
              {reviews.length === 0 && <p className="text-gray-500">No reviews yet. Be the first to review!</p>}
              {reviews.map((r) => (
                <div key={r._id} className="border-b pb-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{r.user?.name || 'Customer'}</p>
                    <span className="text-xs text-gray-400">{formatDate(r.createdAt)}</span>
                  </div>
                  <StarRating value={r.rating} size={13} />
                  {r.comment && <p className="mt-1 text-sm text-gray-700">{r.comment}</p>}
                </div>
              ))}
            </div>
            <div>
              {user ? (
                <form onSubmit={submitReview} className="card space-y-4 p-5">
                  <h3 className="font-semibold">Write a review</h3>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button type="button" key={n} onClick={() => setMyReview({ ...myReview, rating: n })} aria-label={`${n} stars`}>
                        <FaStar size={24} className={n <= myReview.rating ? 'text-amber-500' : 'text-gray-300'} />
                      </button>
                    ))}
                  </div>
                  <textarea className="input" rows="4" placeholder="Share your experience..." value={myReview.comment} onChange={(e) => setMyReview({ ...myReview, comment: e.target.value })} />
                  <button className="btn-primary" disabled={sending}>{sending ? 'Submitting...' : 'Submit Review'}</button>
                </form>
              ) : (
                <div className="card p-5 text-sm">
                  Please <Link to="/login" state={{ from: `/product/${slug}` }} className="font-semibold text-brand-dark underline">login</Link> to write a review.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-display text-2xl font-bold">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {related.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
