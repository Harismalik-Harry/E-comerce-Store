import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ProtectedRoute, CustomerRoute, SellerRoute, GuestRoute } from '@/components/ProtectedRoute';
import MainLayout from '@/layouts/MainLayout';
import SellerLayout from '@/layouts/SellerLayout';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import HomePage from '@/pages/HomePage';
import ProductsPage from '@/pages/ProductsPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import SearchPage from '@/pages/SearchPage';
import CartPage from '@/pages/cart/CartPage';
import CheckoutPage from '@/pages/cart/CheckoutPage';
import OrdersPage from '@/pages/orders/OrdersPage';
import OrderDetailPage from '@/pages/orders/OrderDetailPage';
import NotificationsPage from '@/pages/notifications/NotificationsPage';
import ProfilePage from '@/pages/profile/ProfilePage';
import SellerDashboard from '@/pages/seller/SellerDashboard';
import SellerStore from '@/pages/seller/SellerStore';
import CreateStore from '@/pages/seller/CreateStore';
import SellerRevenue from '@/pages/seller/SellerRevenue';
import SellerProducts from '@/pages/seller/SellerProducts';
import SellerAddProduct from '@/pages/seller/SellerAddProduct';
import SellerEditProduct from '@/pages/seller/SellerEditProduct';
import SellerOrders from '@/pages/seller/SellerOrders';

// ─── Placeholder Pages (will be replaced in later tasks) ───
const Placeholder = ({ title }) => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <h1 className="text-2xl font-bold text-muted-foreground">{title}</h1>
  </div>
);

const StorePage = () => <Placeholder title="🏪 Store Page" />;





function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />

      <Routes>
        {/* ═══ Guest Only (No Navbar/Footer) ═══ */}
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

        {/* ═══ Main Layout (Navbar + Footer) ═══ */}
        <Route element={<MainLayout />}>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/store/:id" element={<StorePage />} />

          {/* Customer Only — sellers cannot access */}
          <Route path="/cart" element={<CustomerRoute><CartPage /></CustomerRoute>} />
          <Route path="/checkout" element={<CustomerRoute><CheckoutPage /></CustomerRoute>} />
          <Route path="/orders" element={<CustomerRoute><OrdersPage /></CustomerRoute>} />
          <Route path="/orders/:id" element={<CustomerRoute><OrderDetailPage /></CustomerRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        </Route>

        {/* ═══ Seller Layout (Sidebar) ═══ */}
        <Route element={<SellerRoute><SellerLayout /></SellerRoute>}>
          <Route path="/seller" element={<SellerDashboard />} />
          <Route path="/seller/products" element={<SellerProducts />} />
          <Route path="/seller/products/new" element={<SellerAddProduct />} />
          <Route path="/seller/products/:id/edit" element={<SellerEditProduct />} />
          <Route path="/seller/orders" element={<SellerOrders />} />
          <Route path="/seller/revenue" element={<SellerRevenue />} />
          <Route path="/seller/store" element={<SellerStore />} />
          <Route path="/seller/store/create" element={<CreateStore />} />
        </Route>

        {/* ═══ 404 ═══ */}
        <Route path="*" element={<MainLayout />}>
          <Route path="*" element={<Placeholder title="404 — Page Not Found" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
