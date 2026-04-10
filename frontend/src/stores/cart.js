import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { cartApi } from '../api/cart'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])

  // total price of items in cart
  const total = computed(() =>
    items.value.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  )

  const count = computed(() =>
    items.value.reduce((sum, i) => sum + i.quantity, 0)
  )

  // load cart from backend
  async function fetchCart() {
    const res = await cartApi.get()
    items.value = res.data
  }

  // add item via backend
  async function addItem(product, quantity = 1) {
    try {
      await cartApi.add({
        productId: product.id,
        quantity
      })
      await fetchCart()
    } catch (err) {
      console.error('Add to cart failed:', err)
    }
  }

  // remove item from cart
  async function removeItem(productId) {
    await cartApi.remove(productId)
    await fetchCart()
  }

  // update quantity, if quantity <= 0 then remove item
  async function updateQuantity(productId, quantity) {
    if (quantity <= 0) {
      await removeItem(productId)
      return
    }
    await cartApi.update(productId, { quantity })
    await fetchCart()
  }

  // clear cart on logout
  async function clearCart() {
    await cartApi.clear()
    items.value = []
  }

  return {
    items,
    total,
    count,
    fetchCart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart
  }
})