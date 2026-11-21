import { Link } from 'react-router-dom';
import useTitle from '../utils/useTitle';

export default function NotFound() {
  useTitle('Page not found');
  return (
    <div className="container-x py-24 text-center">
      <p className="font-display text-7xl font-bold text-brand">404</p>
      <h1 className="mt-2 text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-gray-500">The page you are looking for does not exist.</p>
      <Link to="/" className="btn-primary mt-6">Go Home</Link>
    </div>
  );
}
