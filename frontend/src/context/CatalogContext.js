// Category ও Brand তালিকা (Navbar, Shop, Footer সব জায়গায় লাগে)
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const CatalogContext = createContext();
export const useCatalog = () => useContext(CatalogContext);

export function CatalogProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const reload = useCallback(() => {
    api.get('/categories').then((r) => setCategories(r.data)).catch(() => {});
    api.get('/brands').then((r) => setBrands(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const active = categories.filter((c) => c.isActive);
  const topCategories = active.filter((c) => !c.parent);
  const childrenOf = (id) => active.filter((c) => c.parent === id);

  return (
    <CatalogContext.Provider value={{ categories, brands: brands.filter((b) => b.isActive), topCategories, childrenOf, reloadCatalog: reload }}>
      {children}
    </CatalogContext.Provider>
  );
}
