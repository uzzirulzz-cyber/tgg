import { Outlet, Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard, Package, ShoppingCart, Users, Warehouse,
  Ticket, Settings, Home, Menu, X, ChevronLeft, ChevronRight,
  BarChart3, Image, Activity
} from 'lucide-react'
import useAuthStore from '../services/authStore.js'

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user, logout } = useAuthStore()
  const location = useLocation()

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: Package, label: 'Products', href: '/admin/products' },
    { icon: ShoppingCart, label: 'Orders', href: '/admin/orders' },
    { icon: Users, label: 'Customers', href: '/admin/customers' },
    { icon: Warehouse, label: 'Inventory', href: '/admin/inventory' },
    { icon: Ticket, label: 'Tickets', href: '/admin/tickets' },
    { icon: Activity, label: 'Tracker', href: '/admin/tracker' },
    { icon: Image, label: 'Homepage', href: '/admin/homepage' },
    { icon: BarChart3, label: 'Analytics', href: '/admin' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
  ]

  const isActive = (href) => location.pathname === href

  return (
    <div className="min-h-screen bg-primary-dark flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 bg-primary-light border-r border-white/5 transition-all duration-300 ${
        sidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full lg:w-20 lg:translate-x-0'
      }`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center px-4 border-b border-white/5">
            <Link to="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-cyan rounded-lg flex items-center justify-center shrink-0">
                <LayoutDashboard className="w-4 h-4 text-white" />
              </div>
              {(sidebarOpen || window.innerWidth < 1024) && (
                <span className="font-bold text-lg">Admin</span>
              )}
            </Link>
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="ml-auto lg:block hidden p-1 text-slate-400 hover:text-white"
            >
              {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
            {menuItems.map(item => (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-accent-blue/10 text-accent-blue'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>

          {/* Bottom */}
          <div className="p-3 border-t border-white/5 space-y-2">
            <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
              <Home className="w-5 h-5" />
              {sidebarOpen && <span>Back to Store</span>}
            </Link>
            <button 
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
            >
              <X className="w-5 h-5" />
              {sidebarOpen && <span>Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 glass border-b border-white/5 flex items-center justify-between px-4 lg:px-8">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <span className="text-sm text-slate-400">{user?.name}</span>
            <div className="w-8 h-8 rounded-full bg-accent-blue/20 flex items-center justify-center">
              <span className="text-sm font-medium text-accent-blue">
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
