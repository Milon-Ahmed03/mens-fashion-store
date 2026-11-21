// Wishlist: লগইন করা ইউজারের পছন্দের তালিকা (Database-এ সংরক্ষিত)
import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();
export const useWishlist = () => useContext(WishlistContext);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [ids, setIds] = useState([]);

  useEffect(() => {
    if (!user) {
      setIds([]);
      return;
    }
    api.get('/wishlist/ids').then((r) => setIds(r.data)).catch(() => {});
  }, [user]);

  const toggle = async (productId) => {
    if (!user) {
      toast.error('Please login to use wishlist');
      return;
    }
    try {
      const { data } = await api.post(`/wishlist/${productId}`);
      setIds(data.wishlist);
      toast.success(data.added ? 'Added to wishlist' : 'Removed from wishlist');
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  return <WishlistContext.Provider value={{ ids, toggle, has: (id) => ids.includes(id) }}>{children}</WishlistContext.Provider>;
}
