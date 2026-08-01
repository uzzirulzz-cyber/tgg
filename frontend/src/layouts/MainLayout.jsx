import { Outlet, Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { 
  ShoppingCart, Search, Menu, X, User, LogOut, 
  ChevronDown, Zap, Shield, Headphones 
} from 'lucide-react'
import useAuthStore from '../services/authStore.js'
import useCartStore from '../services/cartStore.js'

const MainLayout = () => {
  const { user, isAuthenticated, logout } = useAuthStore()
  const { getItemCount } = useCartStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
    window.scrollTo(0, 0)
  }, [location])

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Gaming', href: '/categories/gaming' },
    { label: 'Software', href: '/categories/software' },
    { label: 'Gift Cards', href: '/categories/gift-cards' },
  ]

  return (
    <div className="min-h-screen bg-primary-dark">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-accent-blue to-accent-cyan rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <span className="text-lg lg:text-xl font-bold tracking-tight">
                PlayBeat<span className="text-accent-blue">.</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-2 lg:gap-4">
              <button className="p-2 text-slate-300 hover:text-white transition-colors">
                <Search className="w-5 h-5" />
              </button>

              <Link to="/cart" className="relative p-2 text-slate-300 hover:text-white transition-colors">
                <ShoppingCart className="w-5 h-5" />
                {getItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-orange text-xs font-bold text-white rounded-full flex items-center justify-center">
                    {getItemCount()}
                  </span>
                )}
              </Link>

              {isAuthenticated ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 p-2 text-slate-300 hover:text-white transition-colors">
                    <div className="w-8 h-8 rounded-full bg-accent-blue/20 flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium">{user?.name?.split(' ')[0]}</span>
                    <ChevronDown className="w-4 h-4 hidden sm:block" />
                  </button>

                  <div className="absolute right-0 top-full mt-2 w-48 glass rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-2">
                      <Link to="/profile" className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5">Profile</Link>
                      <Link to="/orders" className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5">My Orders</Link>
                      <Link to="/tickets" className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5">Support</Link>
                      {['admin', 'super_admin', 'manager'].includes(user?.role) && (
                        <Link to="/admin" className="block px-4 py-2 text-sm text-accent-blue hover:bg-white/5">Admin Panel</Link>
                      )}
                      <hr className="my-2 border-white/10" />
                      <button 
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Sign In</Link>
                  <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-300 hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden glass border-t border-white/10">
            <div className="px-4 py-4 space-y-2">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg"
                >
                  {link.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <div className="pt-2 space-y-2">
                  <Link to="/login" className="block w-full text-center py-2 text-slate-300 border border-white/10 rounded-lg">Sign In</Link>
                  <Link to="/register" className="block w-full text-center py-2 btn-primary">Get Started</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-16 lg:pt-20">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-primary-light mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-cyan rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold">PlayBeat<span className="text-accent-blue">.</span></span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Your Digital World. One Powerful Marketplace. Premium digital products delivered instantly.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/categories/gaming" className="hover:text-white transition-colors">Gaming</Link></li>
                <li><Link to="/categories/software" className="hover:text-white transition-colors">Software</Link></li>
                <li><Link to="/categories/gift-cards" className="hover:text-white transition-colors">Gift Cards</Link></li>
                <li><Link to="/categories/web-hosting" className="hover:text-white transition-colors">Web Hosting</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/tickets" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/tickets" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><span className="hover:text-white transition-colors">FAQ</span></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Trust</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Shield className="w-4 h-4 text-accent-blue" />
                  <span>Secure Payments</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Zap className="w-4 h-4 text-accent-orange" />
                  <span>Instant Delivery</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Headphones className="w-4 h-4 text-accent-cyan" />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 text-center text-sm text-slate-500">
            © 2024 PlayBeat Digital. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default MainLayout
