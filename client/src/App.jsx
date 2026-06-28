import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CustomerLayout from './components/CustomerLayout';
import AdminLayout from './components/AdminLayout';
import Home from './pages/customer/Home';
import CustomerView from './pages/customer/CustomerGiftRewardView'
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductList from './pages/admin/AdminProductList';
import CustomerProduct from './pages/customer/CustomerProduct';
import Products from './pages/customer/Products';
import AdminProductEdit from './pages/admin/AdminProductEdit';
import Cart from './pages/customer/Cart';
import Profile from './pages/customer/Profile';
import DesignStudio from './pages/customer/DesignStudio';
import HomeDecor from './pages/customer/HomeDecor';
import BuinessEssentials from './pages/customer/BusinessEssentials';
import AdminOrders from './pages/admin/AdminOrders';
import Orders from './pages/customer/Orders';
import Settings from './pages/customer/Settings';
import ScrollToTop from './components/ScrollToTop';
import AdminCategoryNew from './pages/admin/AdminCategoryNew';
import OrderDetails from './pages/customer/OrderDetails';


const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  return token ? children : <Navigate to="/admin/login" />;
};

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:slug" element={<CustomerProduct />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/design-studio" element={<DesignStudio />} />
          <Route path="/home-decor" element={<HomeDecor />} />
          <Route path="/business-essentials" element={<BuinessEssentials />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/order/:id" element={<OrderDetails />} />
        </Route>


        <Route path="/gift/:linkId" element={<CustomerView />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/admin/orders" replace />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminProductList />} />
          <Route path="products/new" element={<AdminProducts />} />
          <Route path="categories/new" element={<AdminCategoryNew />} />
          <Route path="products/edit/:id" element={<AdminProductEdit />} />
          <Route path="campaigns" element={<AdminDashboard />} />
        </Route>


        <Route path="*" element={
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>404 - Page Not Found</h2>
            <p>Please Check your link URL and try again.</p>
          </div>
        } />
      </Routes>
    </Router>
  );
}