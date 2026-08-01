import { Link } from 'react-router-dom'

const ProductsPage = () => {
  return (
    <div className="min-h-screen bg-primary-dark px-4 py-16 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-semibold">Products</h1>
        <p className="mt-2 text-slate-400">Browse our catalog.</p>
        <div className="mt-8 rounded-2xl border border-white/10 bg-primary-light/80 p-6">
          <p className="text-sm text-slate-400">Product listings are being prepared for the next release.</p>
          <Link to="/" className="mt-4 inline-flex text-accent-blue">Return home</Link>
        </div>
      </div>
    </div>
  )
}

export default ProductsPage
