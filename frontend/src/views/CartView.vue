<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const cart   = useCartStore()
const auth   = useAuthStore()

const TAX_RATE     = 0.10
const DELIVERY_FEE = 2.99

// Load cart when entering page
onMounted(() => {
  if (auth.isLoggedIn) {
    cart.fetchCart()
  }
})

const subtotal = computed(() => cart.total)
const tax      = computed(() => subtotal.value * TAX_RATE)
const total    = computed(() => subtotal.value + tax.value + DELIVERY_FEE)

function proceedToCheckout() {
  if (!auth.isLoggedIn) {
    router.push('/login')
  } else {
    router.push('/checkout')
  }
}
</script>

<template>
  <div class="cart-page">
    <h1>Your Cart</h1>

    <!-- Empty cart -->
    <div v-if="cart.items.length === 0" class="empty-cart">
      <p>🛒 Your cart is empty</p>
      <RouterLink to="/catalogue" class="btn-shop">Start Shopping</RouterLink>
    </div>

    <!-- Cart content -->
    <div v-else class="cart-layout">

      <!-- Items list -->
      <div class="cart-items">
        <div
          v-for="item in cart.items"
          :key="item.productId"
          class="cart-item"
        >
          <div class="item-info">
            <h3>{{ item.name }}</h3>
            <p class="item-unit">${{ item.unitPrice.toFixed(2) }} each</p>
          </div>

          <div class="item-controls">
            <!-- Decrease -->
            <button
              class="qty-btn"
              @click="cart.updateQuantity(item.productId, item.quantity - 1)"
            >−</button>

            <span class="qty-display">{{ item.quantity }}</span>

            <!-- Increase -->
            <button
              class="qty-btn"
              @click="cart.updateQuantity(item.productId, item.quantity + 1)"
            >+</button>
          </div>

          <div class="item-total">
            ${{ (item.unitPrice * item.quantity).toFixed(2) }}
          </div>

          <!-- Remove -->
          <button
            class="btn-remove"
            @click="cart.removeItem(item.productId)"
          >✕</button>
        </div>
      </div>

      <!-- Order summary -->
      <div class="cart-summary">
        <h2>Order Summary</h2>

        <div class="summary-row">
          <span>Subtotal ({{ cart.count }} items)</span>
          <span>${{ subtotal.toFixed(2) }}</span>
        </div>

        <div class="summary-row">
          <span>Tax (10%)</span>
          <span>${{ tax.toFixed(2) }}</span>
        </div>

        <div class="summary-row">
          <span>Delivery Fee</span>
          <span>${{ DELIVERY_FEE.toFixed(2) }}</span>
        </div>

        <div class="summary-divider"></div>

        <div class="summary-row summary-total">
          <span>Total</span>
          <span>${{ total.toFixed(2) }}</span>
        </div>

        <button class="btn-checkout" @click="proceedToCheckout">
          {{ auth.isLoggedIn ? 'Proceed to Checkout' : 'Login to Checkout' }}
        </button>

        <RouterLink to="/catalogue" class="btn-continue">
          ← Continue Shopping
        </RouterLink>

        <button class="btn-clear-cart" @click="cart.clearCart()">
          Clear Cart
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
h1 { font-size: 1.8rem; color: #2c3e50; margin-bottom: 1.5rem; }

.empty-cart {
  text-align: center;
  padding: 4rem 2rem;
  color: #888;
}
.empty-cart p  { font-size: 1.2rem; margin-bottom: 1.5rem; }

.btn-shop {
  display: inline-block;
  padding: 0.75rem 2rem;
  background: #2c3e50;
  color: white;
  border-radius: 8px;
  text-decoration: none;
}
.btn-shop:hover { background: #3498db; }

.cart-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 2rem;
}

/* Items */
.cart-items { display: flex; flex-direction: column; gap: 1rem; }

.cart-item {
  background: white;
  border-radius: 10px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.item-info { flex: 1; }
.item-info h3 { margin-bottom: 0.2rem; }

.item-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.qty-btn {
  width: 30px;
  height: 30px;
  border: 1px solid #ddd;
  background: #f5f5f5;
  border-radius: 6px;
  cursor: pointer;
}

.qty-display {
  font-weight: 600;
  min-width: 24px;
  text-align: center;
}

.item-total {
  font-weight: 700;
  color: #27ae60;
  min-width: 60px;
  text-align: right;
}

.btn-remove {
  background: none;
  border: none;
  color: #bbb;
  cursor: pointer;
}
.btn-remove:hover { color: #e74c3c; }

/* Summary */
.cart-summary {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.summary-divider { border-top: 1px solid #eee; margin: 1rem 0; }

.summary-total {
  font-weight: 700;
}

.btn-checkout {
  width: 100%;
  padding: 0.85rem;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 8px;
  margin-top: 1rem;
  cursor: pointer;
}

.btn-continue {
  display: block;
  text-align: center;
  margin-top: 0.75rem;
  color: #3498db;
}

.btn-clear-cart {
  width: 100%;
  padding: 0.6rem;
  margin-top: 0.75rem;
  border: 1px solid #eee;
  background: none;
  border-radius: 6px;
  color: #aaa;
}
</style>