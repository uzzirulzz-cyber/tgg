import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import useAuthStore from './services/authStore.js'

// Layouts
import MainLayout from './layouts/MainLayout.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'

// Pages
import HomePage from './pages/HomePage.jsx'
import ProductsPage from './pages/ProductsPage.jsx'
import ProductDetailPage from './pages/ProductDetailPage.jsx'
import CategoryPage from './pages/CategoryPage.jsx'
import CartPage from './pages/CartPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import OrdersPage from './pages/OrdersPage.jsx'
import OrderDetailPage from './pages/OrderDetailPage.jsx'
import TicketsPage from './pages/TicketsPage.jsx'
import StaffTrackerPage from './pages/StaffTrackerPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard.jsx'
import AdminProducts from './pages/admin/Products.jsx'
import AdminOrders from './pages/admin/Orders.jsx'
import AdminCustomers from './pages/admin/Customers.jsx'
import AdminInventory from './pages/admin/Inventory.jsx'
import AdminTickets from './pages/admin/Tickets.jsx'
import AdminSettings from './pages/admin/Settings.jsx'
import AdminHomepage from './pages/admin/HomepageBuilder.jsx'

// Components
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AdminRoute from './components/AdminRoute.jsx'

function App() {
  const { fetchProfile, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile()
    }
  }, [isAuthenticated])

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path="/categories/:slug" element={<CategoryPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Customer Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/tickets" element={<TicketsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Admin Routes */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/customers" element={<AdminCustomers />} />
          <Route path="/admin/inventory" element={<AdminInventory />} />
          <Route path="/admin/tickets" element={<AdminTickets />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/homepage" element={<AdminHomepage />} />
          <Route path="/admin/tracker" element={<StaffTrackerPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
