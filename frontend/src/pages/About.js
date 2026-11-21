import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import useTitle from '../utils/useTitle';

export default function About() {
  useTitle('About Us');
  const { settings } = useSettings();
  const values = [
    ['Quality First', 'Fabrics and stitching are checked before anything reaches you.'],
    ['Fair Prices', 'Premium style without premium markups.'],
    ['Easy Ordering', 'Order online, pay with cash when it arrives at your door.'],
  ];
  return (
    <div>
      <section className="bg-ink py-20 text-center text-white">
        <div className="container-x">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">About {settings.storeName}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-gray-300">{settings.tagline}</p>
        </div>
      </section>
      <section className="container-x max-w-3xl py-14">
        <p className="whitespace-pre-line text-lg leading-relaxed text-gray-700">{settings.aboutText}</p>
      </section>
      <section className="container-x grid gap-6 pb-10 sm:grid-cols-3">
        {values.map(([t, d]) => (
          <div key={t} className="card p-6 text-center">
            <h3 className="font-display text-xl font-bold">{t}</h3>
            <p className="mt-2 text-sm text-gray-600">{d}</p>
          </div>
        ))}
      </section>
      <div className="text-center"><Link to="/shop" className="btn-primary">Start Shopping</Link></div>
    </div>
  );
}
