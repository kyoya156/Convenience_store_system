<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore  } from '@/stores/cart'
import { useAuthStore  } from '@/stores/auth'
import { orderApi } from '@/api/orders'

const router = useRouter()
const cart   = useCartStore()
const auth   = useAuthStore()

const TAX_RATE     = 0.10
const DELIVERY_FEE = 2.99

const subtotal = computed(() => cart.total)
const tax      = computed(() => subtotal.value * TAX_RATE)
const total    = computed(() => subtotal.value + tax.value + DELIVERY_FEE)

// Form fields
const address = ref('')
const notes   = ref('')
const error   = ref('')
const loading = ref(false)
const success = ref(false)
const orderId = ref(null)

// Payment simulation
const paymentMethod = ref('card')
const paymentMethods = [
  { value: 'card',     label: '💳 Credit / Debit Card' },
  { value: 'transfer', label: '🏦 Bank Transfer' },
  { value: 'cod',      label: '💵 Cash on Delivery' },
]

async function placeOrder() {
  error.value = ''

  if (!address.value.trim()) {
    error.value = 'Delivery address is required'
    return
  }
  if (cart.items.length === 0) {
    error.value = 'Your cart is empty'
    return
  }

  loading.value = true
  try {
    const items = cart.items.map(i => ({
      productId: i.product.id,
      quantity:  i.quantity,
      unitPrice: i.product.price,
    }))

    const res = await orderApi.create({
      items,
      deliveryAddress: address.value.trim(),
      notes: notes.value.trim() || null,
    })

    orderId.value = res.data.orderId
    success.value = true
    cart.clearCart()
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to place order. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="checkout-page">

    <!-- Success state -->
    <div v-if="success" class="success-card">
      <div class="success-icon">✓</div>
      <h2>Order Placed Successfully!</h2>
      <p>Order <strong>#{{ orderId }}</strong> has been confirmed.</p>
      <p class="payment-note">
        Payment via <strong>{{ paymentMethods.find(m => m.value === paymentMethod)?.label }}</strong>
        has been simulated and processed ✓
      </p>
      <div class="success-actions">
        <RouterLink to="/orders" class="btn-orders">View My Orders</RouterLink>
        <RouterLink to="/catalogue" class="btn-shop">Continue Shopping</RouterLink>
      </div>
    </div>

    <!-- Checkout form -->
    <div v-else class="checkout-layout">
      <div class="checkout-form">
        <h1>Checkout</h1>

        <div v-if="error" class="alert alert-error">{{ error }}</div>

        <!-- Delivery details -->
        <section class="form-section">
          <h2>Delivery Details</h2>

          <div class="form-group">
            <label>Delivery Address <span class="required">*</span></label>
            <textarea
              v-model="address"
              rows="3"
              placeholder="Enter your full delivery address&#10;e.g. 123 Main St, District 1, Ho Chi Minh City"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Order Notes (optional)</label>
            <input
              v-model="notes"
              type="text"
              placeholder="e.g. Leave at front door"
            />
          </div>
        </section>

        <!-- Payment method -->
        <section class="form-section">
          <h2>Payment Method</h2>
          <p class="payment-disclaimer">
            ⚠️ Payment processing is simulated for this demo — no real transaction will occur.
          </p>

          <div class="payment-options">
            <label
              v-for="method in paymentMethods"
              :key="method.value"
              class="payment-option"
              :class="{ selected: paymentMethod === method.value }"
            >
              <input
                type="radio"
                v-model="paymentMethod"
                :value="method.value"
              />
              {{ method.label }}
            </label>
          </div>
        </section>

        <!-- Order items summary -->
        <section class="form-section">
          <h2>Items ({{ cart.count }})</h2>
          <div class="order-items">
            <div v-for="item in cart.items" :key="item.product.id" class="order-item">
              <span>{{ item.product.name }} × {{ item.quantity }}</span>
              <span>${{ (item.product.price * item.quantity).toFixed(2) }}</span>
            </div>
          </div>
        </section>
      </div>

      <!-- Price summary -->
      <div class="order-summary">
        <h2>Order Total</h2>

        <div class="summary-row">
          <span>Subtotal</span>
          <span>${{ subtotal.toFixed(2) }}</span>
        </div>
        <div class="summary-row">
          <span>Tax (10%)</span>
          <span>${{ tax.toFixed(2) }}</span>
        </div>
        <div class="summary-row">
          <span>Delivery</span>
          <span>${{ DELIVERY_FEE.toFixed(2) }}</span>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-row summary-total">
          <span>Total</span>
          <span>${{ total.toFixed(2) }}</span>
        </div>

        <button
          class="btn-place-order"
          @click="placeOrder"
          :disabled="loading"
        >
          {{ loading ? 'Placing Order...' : `Place Order — $${total.toFixed(2)}` }}
        </button>

        <RouterLink to="/cart" class="btn-back-cart">← Back to Cart</RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
h1 { font-size: 1.8rem; color: #2c3e50; margin-bottom: 1.5rem; }

.checkout-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 2rem;
  align-items: start;
}

.form-section {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.form-section h2 { font-size: 1.1rem; color: #2c3e50; margin-bottom: 1rem; }

.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.4rem; font-weight: 500; color: #555; font-size: 0.9rem; }
.required { color: #e74c3c; }
.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.7rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
}
.form-group input:focus,
.form-group textarea:focus { outline: none; border-color: #3498db; }

.payment-disclaimer {
  font-size: 0.85rem;
  color: #e67e22;
  background: #fef9f0;
  padding: 0.6rem 0.8rem;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.payment-options { display: flex; flex-direction: column; gap: 0.6rem; }
.payment-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}
.payment-option.selected { border-color: #3498db; background: #eaf4fb; }
.payment-option input { accent-color: #3498db; }

.order-items { display: flex; flex-direction: column; gap: 0.5rem; }
.order-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #555;
  padding: 0.4rem 0;
  border-bottom: 1px solid #f0f0f0;
}

/* Summary sidebar */
.order-summary {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  position: sticky;
  top: 80px;
}
.order-summary h2 { font-size: 1.1rem; color: #2c3e50; margin-bottom: 1.25rem; }

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  color: #555;
}
.summary-divider { border-top: 1px solid #eee; margin: 1rem 0; }
.summary-total { font-size: 1.1rem; font-weight: 700; color: #2c3e50; }

.btn-place-order {
  width: 100%;
  padding: 0.9rem;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
  transition: background 0.2s;
}
.btn-place-order:hover:not(:disabled) { background: #219a52; }
.btn-place-order:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-back-cart {
  display: block;
  text-align: center;
  margin-top: 0.75rem;
  color: #3498db;
  text-decoration: none;
  font-size: 0.9rem;
}
.btn-back-cart:hover { text-decoration: underline; }

/* Alert */
.alert { padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.9rem; }
.alert-error { background: #fdecea; color: #c0392b; border: 1px solid #e74c3c; }

/* Success */
.success-card {
  text-align: center;
  background: white;
  border-radius: 12px;
  padding: 3rem 2rem;
  max-width: 480px;
  margin: 4rem auto;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}
.success-icon {
  width: 64px;
  height: 64px;
  background: #27ae60;
  color: white;
  border-radius: 50%;
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}
.success-card h2 { font-size: 1.5rem; color: #2c3e50; margin-bottom: 0.5rem; }
.success-card p   { color: #666; margin-bottom: 0.5rem; }
.payment-note {
  background: #eafaf1;
  color: #27ae60;
  padding: 0.6rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  margin: 1rem 0;
}
.success-actions { display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem; }
.btn-orders {
  padding: 0.7rem 1.5rem;
  background: #2c3e50;
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.95rem;
}
.btn-orders:hover { background: #3498db; }
.btn-shop {
  padding: 0.7rem 1.5rem;
  background: #ecf0f1;
  color: #2c3e50;
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.95rem;
}
.btn-shop:hover { background: #dfe6e9; }
</style>