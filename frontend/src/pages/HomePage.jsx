import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { 
  Search, ArrowRight, Zap, Shield, Headphones, 
  Star, TrendingUp, Gamepad2, CreditCard, Code, 
  Globe, Megaphone, Bitcoin, Briefcase, ChevronRight
} from 'lucide-react'
import api from '../services/api.js'

const HomePage = () => {
  const { data: homepageData } = useQuery({
    queryKey: ['homepage'],
    queryFn: async () => {
      const { data } = await api.get('/homepage')
      return data.data
    },
  })

  const { data: featuredProducts } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data } = await api.get('/products/featured')
      return data.data
    },
  })

  const { data: trendingProducts } = useQuery({
    queryKey: ['trending-products'],
    queryFn: async () => {
      const { data } = await api.get('/products/trending')
      return data.data
    },
  })

  const categories = [
    { name: 'Gaming Accounts', icon: Gamepad2, color: 'from-purple-500 to-pink-500' },
    { name: 'Game Currency', icon: Zap, color: 'from-yellow-500 to-orange-500' },
    { name: 'Gift Cards', icon: CreditCard, color: 'from-green-500 to-emerald-500' },
    { name: 'Software & SaaS', icon: Code, color: 'from-blue-500 to-cyan-500' },
    { name: 'Web Hosting', icon: Globe, color: 'from-indigo-500 to-purple-500' },
    { name: 'Digital Marketing', icon: Megaphone, color: 'from-pink-500 to-rose-500' },
    { name: 'Web3', icon: Bitcoin, color: 'from-orange-500 to-red-500' },
    { name: 'Business Services', icon: Briefcase, color: 'from-slate-500 to-gray-500' },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzYjgyZjYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

        {/* Animated orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-blue/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-cyan/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-slate-300">Trusted by 50,000+ customers worldwide</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-6">
            Your Digital World.{" "}
            <span className="gradient-text">One Powerful Marketplace.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover premium digital products, subscriptions, software, gaming products, 
            hosting, marketing services and more.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-10">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search products, games, software..."
                className="w-full pl-12 pr-4 py-4 bg-slate-800/80 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition-all"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-accent-blue hover:bg-blue-600 text-white font-medium rounded-xl transition-colors">
                Search
              </button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/products" className="btn-primary flex items-center gap-2 text-lg px-8 py-4">
              Explore Products <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/categories" className="btn-secondary text-lg px-8 py-4">
              Browse Categories
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            <div className="flex items-center gap-2 text-slate-400">
              <Shield className="w-5 h-5 text-accent-blue" />
              <span className="text-sm">Secure Payments</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Zap className="w-5 h-5 text-accent-orange" />
              <span className="text-sm">Instant Delivery</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Headphones className="w-5 h-5 text-accent-cyan" />
              <span className="text-sm">24/7 Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Categories</h2>
            <p className="text-slate-400">Explore our wide range of digital products</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map(cat => (
              <Link
                key={cat.name}
                to={`/categories/${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="group relative p-6 rounded-2xl glass hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <cat.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-sm">{cat.name}</h3>
                <ChevronRight className="w-4 h-4 text-slate-500 absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="py-20 px-4 bg-primary-light/30">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold mb-2">Featured Products</h2>
                <p className="text-slate-400">Handpicked premium digital products</p>
              </div>
              <Link to="/products" className="text-accent-blue hover:text-blue-400 flex items-center gap-1 text-sm font-medium">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending Products */}
      {trendingProducts && trendingProducts.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-orange/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-accent-orange" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Trending Now</h2>
                  <p className="text-slate-400">Most popular this week</p>
                </div>
              </div>
              <Link to="/products" className="text-accent-blue hover:text-blue-400 flex items-center gap-1 text-sm font-medium">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass rounded-3xl p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-cyan/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-slate-400 mb-8 max-w-lg mx-auto">
                Join thousands of satisfied customers and discover the best digital products on the market.
              </p>
              <Link to="/products" className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2">
                Start Shopping <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// Product Card Component
const ProductCard = ({ product }) => {
  const discount = product.salePrice && product.price > 0
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0

  return (
    <Link 
      to={`/products/${product.slug}`}
      className="group card hover:border-slate-600 transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-800">
        {product.images?.[0]?.url ? (
          <img 
            src={product.images[0].url} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-800">
            <Zap className="w-12 h-12 text-slate-600" />
          </div>
        )}
        {discount > 0 && (
          <span className="absolute top-3 left-3 px-2 py-1 bg-accent-orange text-xs font-bold text-white rounded-lg">
            -{discount}%
          </span>
        )}
        <span className="absolute top-3 right-3 px-2 py-1 glass text-xs font-medium text-slate-300 rounded-lg">
          {product.productType === 'digital' ? 'Digital' : product.productType}
        </span>
      </div>

      <div className="p-4">
        <div className="text-xs text-slate-500 mb-1">{product.category?.name}</div>
        <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-accent-blue transition-colors">
          {product.name}
        </h3>

        <div className="flex items-center gap-1 mb-3">
          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
          <span className="text-xs text-slate-400">{product.averageRating || '4.5'} ({product.reviewCount || 0})</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-white">
            ${(product.salePrice || product.price)?.toFixed(2)}
          </span>
          {product.salePrice && (
            <span className="text-sm text-slate-500 line-through">
              ${product.price.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default HomePage
