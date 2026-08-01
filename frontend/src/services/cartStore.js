import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      discount: 0,

      addItem: (product, variant = null, quantity = 1) => {
        const items = get().items
        const existingIndex = items.findIndex(
          item => item.productId === product._id && item.variantId === (variant?._id || null)
        )

        if (existingIndex >= 0) {
          const updated = [...items]
          updated[existingIndex].quantity += quantity
          set({ items: updated })
        } else {
          set({
            items: [...items, {
              productId: product._id,
              variantId: variant?._id || null,
              name: product.name,
              image: product.images?.[0]?.url,
              price: variant ? (variant.salePrice || variant.price) : (product.salePrice || product.price),
              originalPrice: variant ? variant.price : product.price,
              quantity,
              variantName: variant?.name,
            }],
          })
        }
      },

      removeItem: (productId, variantId) => {
        set({
          items: get().items.filter(
            item => !(item.productId === productId && item.variantId === variantId)
          ),
        })
      },

      updateQuantity: (productId, variantId, quantity) => {
        if (quantity < 1) {
          get().removeItem(productId, variantId)
          return
        }
        set({
          items: get().items.map(item =>
            item.productId === productId && item.variantId === variantId
              ? { ...item, quantity }
              : item
          ),
        })
      },

      clearCart: () => set({ items: [], coupon: null, discount: 0 }),

      applyCoupon: (coupon) => set({ coupon, discount: coupon.discountAmount }),
      removeCoupon: () => set({ coupon: null, discount: 0 }),

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      },

      getTotal: () => {
        const subtotal = get().getSubtotal()
        const discount = get().discount
        return Math.max(0, subtotal - discount)
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },
    }),
    {
      name: 'playbeat-cart',
    }
  )
)

export default useCartStore
