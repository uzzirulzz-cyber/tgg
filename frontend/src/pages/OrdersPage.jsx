import { Link } from 'react-router-dom'

const OrdersPage = () => {
  return (
    <div className="min-h-screen bg-primary-dark px-4 py-16 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-primary-light/80 p-8">
        <h1 className="text-3xl font-semibold">Orders</h1>
        <p className="mt-2 text-slate-400">Your order history will appear here.</p>
        <Link to="/" className="mt-6 inline-flex text-accent-blue">Back home</Link>
      </div>
    </div>
  )
}

export default OrdersPage
