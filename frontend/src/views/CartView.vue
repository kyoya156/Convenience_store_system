<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore  } from '@/stores/cart'
import { useAuthStore  } from '@/stores/auth'

const router = useRouter()
const cart   = useCartStore()
const auth   = useAuthStore()

const TAX_RATE     = 0.10   // 10%
const DELIVERY_FEE = 2.99

const subtotal  = computed(() => cart.total)
const tax       = computed(() => subtotal.value * TAX_RATE)
const total     = computed(() => subtotal.value + tax.value + DELIVERY_FEE)

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
          :key="item.product.id"
          class="cart-item"
        >
          <div class="item-info">
            <h3>{{ item.product.name }}</h3>
            <p class="item-category">{{ item.product.category }}</p>
            <p class="item-unit">${{ item.product.price.toFixed(2) }} each</p>
          </div>

          <div class="item-controls">
            <!-- Decrease -->
            <button
              class="qty-btn"
              @click="cart.updateQuantity(item.product.id, item.quantity - 1)"
            >−</button>

            <span class="qty-display">{{ item.quantity }}</span>

            <!-- Increase -->
            <button
              class="qty-btn"
              @click="cart.updateQuantity(item.product.id, item.quantity + 1)"
              :disabled="item.quantity >= item.product.stock"
            >+</button>
          </div>

          <div class="item-total">
            ${{ (item.product.price * item.quantity).toFixed(2) }}
          </div>

          <!-- Remove -->
          <button
            class="btn-remove"
            @click="cart.removeItem(item.product.id)"
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
  font-size: 1rem;
}
.btn-shop:hover { background: #3498db; }

.cart-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 2rem;
  align-items: start;
}

/* Cart items */
.cart-items { display: flex; flex-direction: column; gap: 1rem; }

.cart-item {
  background: white;
  border-radius: 10px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.item-info { flex: 1; }
.item-info h3 { font-size: 1rem; color: #2c3e50; margin-bottom: 0.2rem; }
.item-category { font-size: 0.8rem; color: #aaa; text-transform: capitalize; }
.item-unit { font-size: 0.85rem; color: #888; margin-top: 0.2rem; }

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
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.qty-btn:hover:not(:disabled) { background: #dfe6e9; }
.qty-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.qty-display { font-size: 1rem; font-weight: 600; min-width: 24px; text-align: center; }

.item-total { font-size: 1rem; font-weight: 700; color: #27ae60; min-width: 60px; text-align: right; }

.btn-remove {
  background: none;
  border: none;
  color: #bbb;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.25rem;
}
.btn-remove:hover { color: #e74c3c; }

/* Summary */
.cart-summary {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  position: sticky;
  top: 80px;
}
.cart-summary h2 { font-size: 1.2rem; color: #2c3e50; margin-bottom: 1.25rem; }

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
  color: #555;
}
.summary-divider { border-top: 1px solid #eee; margin: 1rem 0; }
.summary-total { font-size: 1.1rem; font-weight: 700; color: #2c3e50; }

.btn-checkout {
  width: 100%;
  padding: 0.85rem;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
  transition: background 0.2s;
}
.btn-checkout:hover { background: #219a52; }

.btn-continue {
  display: block;
  text-align: center;
  margin-top: 0.75rem;
  color: #3498db;
  text-decoration: none;
  font-size: 0.9rem;
}
.btn-continue:hover { text-decoration: underline; }

.btn-clear-cart {
  width: 100%;
  padding: 0.6rem;
  background: none;
  border: 1px solid #eee;
  border-radius: 6px;
  color: #aaa;
  cursor: pointer;
  font-size: 0.85rem;
  margin-top: 0.75rem;
}
.btn-clear-cart:hover { border-color: #e74c3c; color: #e74c3c; }
</style>