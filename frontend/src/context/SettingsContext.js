// Store Settings (নাম, ফোন, Shipping Charge, Homepage লেখা) সব পেজে পাওয়া যায়
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const SettingsContext = createContext();
export const useSettings = () => useContext(SettingsContext);

const DEFAULTS = {
  storeName: "Men's Fashion Store",
  tagline: '',
  email: '',
  phone: '',
  address: '',
  facebook: '',
  instagram: '',
  aboutText: '',
  shipping: { insideDhaka: 60, outsideDhaka: 120, freeShippingOver: 0 },
  homepage: {
    heroTitle: 'Dress Sharp. Feel Confident.',
    heroSubtitle: '',
    featuredTitle: 'Featured Products',
    newArrivalsTitle: 'New Arrivals',
    promoTitle: '',
    promoText: '',
    showCategories: true,
    showFeatured: true,
    showNewArrivals: true,
    showPromo: true,
  },
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);

  const reload = useCallback(() => {
    api.get('/settings').then((res) => setSettings({ ...DEFAULTS, ...res.data })).catch(() => {});
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return <SettingsContext.Provider value={{ settings, reloadSettings: reload }}>{children}</SettingsContext.Provider>;
}
