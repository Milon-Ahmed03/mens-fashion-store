// সব Route (পেজের ঠিকানা) এখানে
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import CustomerLayout from './components/CustomerLayout';
import { AdminRoute, ProtectedRoute } from './components/ProtectedRoute';
import Spinner from './components/Spinner';

import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import MyOrders from './pages/MyOrders';
import OrderDetails from './pages/OrderDetails';
import Wishlist from './pages/Wishlist';
import TrackOrder from './pages/TrackOrder';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

// Admin পেজ আলাদা ফাইলে লোড হয় (Customer-দের সাইট দ্রুত থাকে)
const AdminLayout = lazy(() => import('./admin/AdminLayout'));
const AdminLogin = lazy(() => import('./admin/AdminLogin'));
const Dashboard = lazy(() => import('./admin/Dashboard'));
const AdminProducts = lazy(() => import('./admin/Products'));
const ProductForm = lazy(() => import('./admin/ProductForm'));
const Categories = lazy(() => import('./admin/Categories'));
const Brands = lazy(() => import('./admin/Brands'));
const Inventory = lazy(() => import('./admin/Inventory'));
const AdminOrders = lazy(() => import('./admin/Orders'));
const AdminOrderDetail = lazy(() => import('./admin/OrderDetail'));
const Customers = lazy(() => import('./admin/Customers'));
const Coupons = lazy(() => import('./admin/Coupons'));
const Discounts = lazy(() => import('./admin/Discounts'));
const Reviews = lazy(() => import('./admin/Reviews'));
const Banners = lazy(() => import('./admin/Banners'));
const HomepageContent = lazy(() => import('./admin/HomepageContent'));
const ShippingSettings = lazy(() => import('./admin/ShippingSettings'));
const StoreSettings = lazy(() => import('./admin/StoreSettings'));
const Reports = lazy(() => import('./admin/Reports'));
const AdminProfile = lazy(() => import('./admin/AdminProfile'));
const Messages = lazy(() => import('./admin/Messages'));

export default function App() {
  const guard = (el) => <ProtectedRoute>{el}</ProtectedRoute>;
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        {/* Customer Website */}
        <Route element={<CustomerLayout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="product/:slug" element={<ProductDetails />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={guard(<Checkout />)} />
          <Route path="order-success/:id" element={guard(<OrderSuccess />)} />
          <Route path="orders" element={guard(<MyOrders />)} />
          <Route path="orders/:id" element={guard(<OrderDetails />)} />
          <Route path="profile" element={guard(<Profile />)} />
          <Route path="wishlist" element={guard(<Wishlist />)} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="track-order" element={<TrackOrder />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Admin Dashboard */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id/edit" element={<ProductForm />} />
          <Route path="categories" element={<Categories />} />
          <Route path="brands" element={<Brands />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
          <Route path="customers" element={<Customers />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="discounts" element={<Discounts />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="banners" element={<Banners />} />
          <Route path="homepage" element={<HomepageContent />} />
          <Route path="shipping" element={<ShippingSettings />} />
          <Route path="settings" element={<StoreSettings />} />
          <Route path="reports" element={<Reports />} />
          <Route path="messages" element={<Messages />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
