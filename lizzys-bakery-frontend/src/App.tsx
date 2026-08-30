import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AccountPage from './pages/Account/AccountPage';
import MenuPage from './pages/Menu/MenuPage';
import ProductDetailPage from './pages/ProductDetail/ProductDetailPage';
import HomePage from './pages/Home/HomePage';
import CartPage from './pages/Cart/CartPage';
import CustomCakePage from './pages/CustomCake/CustomCakePage';
import StaffPage from './pages/Staff/StaffPage';
import MenuManagementPage from './pages/Admin/MenuManagementPage';
import CheckoutPage from './pages/Checkout/CheckoutPage';
import OrdersPage from './pages/Admin/OrdersPage';

function App() {
  return (
    // min-h-screen gives us a full height backdrop container layout 
    // flex-col + flex-1 forces the footer down to the screen bottom if page content is short
    <div className="min-h-screen flex flex-col bg-bakery-cream">
      {/* Main Global Navigation */}
      <Navbar />

      {/* Dynamic Screen Viewer Content Area */}
      <main className="flex-1">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
           <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/menu"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <MenuManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/custom-cake" element={<CustomCakePage />} />
          <Route path="/staff" element={<StaffPage />} />
        </Routes>
      </main>

      {/* Global Bottom Footer Layout */}
      <Footer />
    </div>
  );
}

export default App;