import { FaRegStar, FaStar, FaStarHalfAlt } from 'react-icons/fa';

// rating সংখ্যা অনুযায়ী তারা দেখায়
export default function StarRating({ value = 0, size = 14 }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-500">
      {[1, 2, 3, 4, 5].map((n) =>
        value >= n ? <FaStar key={n} size={size} /> : value >= n - 0.5 ? <FaStarHalfAlt key={n} size={size} /> : <FaRegStar key={n} size={size} />
      )}
    </span>
  );
}
