<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { orderApi } from '@/api/orders'

const router = useRouter()
const cart = useCartStore()
const auth = useAuthStore()

// Demo pricing (same as CartView)
const TAX_RATE = 0.10
const DELIVERY_FEE = 2.99

// --- Checkout form fields ---
const address = ref('')
const notes = ref('')

// --- UI state ---
const error = ref('')
const info = ref('')
const placingOrder = ref(false)

const orderCreated = ref(false)
const orderId = ref(null)

// Snapshot cart for display after clearing cart (so user still sees what they ordered)
const snapshot = ref(null) // { items, subtotal, tax, total }

// --- Payment simulation (Card + Bank transfer only) ---
const paymentMethod = ref('card')
const paymentMethods = [
  { value: 'card', label: '💳 Credit / Debit Card' },
  { value: 'transfer', label: '🏦 Bank Transfer' },
]

const forceResult = ref('random') // random/success/failed/pending

// Card fields
const cardHolder = ref('')
const cardNumber = ref('')
const cardExpiry = ref('')
const cardCvv = ref('')

// Bank transfer field
const transferRef = ref('')

const paying = ref(false)
const paymentStatus = ref('idle') // idle | success | failed | pending
const paymentRef = ref(null)
const receipt = ref(null)

// ---------------- Helpers ----------------
function money(n) {
  return `$${Number(n || 0).toFixed(2)}`
}

const displayItems = computed(() => snapshot.value?.items ?? cart.items)
const displaySubtotal = computed(() => snapshot.value?.subtotal ?? cart.total)
const displayTax = computed(() => snapshot.value?.tax ?? displaySubtotal.value * TAX_RATE)
const displayTotal = computed(() => snapshot.value?.total ?? (displaySubtotal.value + displayTax.value + DELIVERY_FEE))

function generateTxnRef() {
  return `TXN-${Date.now().toString().slice(-8)}`
}

function simulateOutcome() {
  const forced = forceResult.value
  if (forced !== 'random') return forced
  const r = Math.random()
  if (r < 0.70) return 'success'
  if (r < 0.85) return 'pending'
  return 'failed'
}

function resetPaymentUi() {
  paymentStatus.value = 'idle'
  paymentRef.value = null
  receipt.value = null
}

// Keep UI tidy when switching method
watch(paymentMethod, () => {
  error.value = ''
  resetPaymentUi()
})

// ---------------- Actions ----------------
async function confirmOrder() {
  error.value = ''
  info.value = ''

  if (!auth.isLoggedIn) {
    router.push('/login')
    return
  }
  if (!address.value.trim()) {
    error.value = 'Delivery address is required.'
    return
  }
  if (cart.items.length === 0) {
    error.value = 'Your cart is empty.'
    return
  }

  placingOrder.value = true
  try {
    // Snapshot before clearing cart
    const subtotal = cart.total
    const tax = subtotal * TAX_RATE
    const total = subtotal + tax + DELIVERY_FEE
    snapshot.value = {
    items: cart.items.map(i => ({
      product: {
        id: i.productId,
        name: i.name,
        price: i.unitPrice
      },
      quantity: i.quantity
    })),
      subtotal,
      tax,
      total,
    }

    const itemsPayload = cart.items.map(i => ({
      productId: i.productId,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    }))

    const res = await orderApi.create({
      items: itemsPayload,
      deliveryAddress: address.value.trim(),
      notes: notes.value.trim() || null,
    })

    orderId.value = res.data?.orderId ?? res.data?.id ?? null
    orderCreated.value = true
    cart.clearCart()

    info.value = `Order #${orderId.value ?? '(created)'} confirmed. Please simulate payment below.`
  } catch (err) {
    snapshot.value = null
    error.value = err.response?.data?.error || 'Failed to place order. Please try again.'
  } finally {
    placingOrder.value = false
  }
}

function validatePayment() {
  if (paymentMethod.value === 'card') {
    if (!cardHolder.value.trim()) return 'Cardholder name is required.'
    const digits = cardNumber.value.replace(/\s+/g, '')
    if (!/^\d{12,19}$/.test(digits)) return 'Card number looks invalid.'
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry.value.trim())) return 'Expiry must be MM/YY.'
    if (!/^\d{3}$/.test(cardCvv.value.trim())) return 'CVV must be 3 digits.'
  } else {
    if (!transferRef.value.trim()) return 'Transfer reference is required.'
  }
  return null
}

async function payNow() {
  error.value = ''
  info.value = ''

  if (!orderCreated.value) {
    error.value = 'Please confirm the order before making payment.'
    return
  }

  const v = validatePayment()
  if (v) {
    error.value = v
    return
  }

  paying.value = true
  resetPaymentUi()

  // Simulate processing delay
  await new Promise(r => setTimeout(r, 650))

  const outcome = simulateOutcome()
  const txn = generateTxnRef()

  paymentRef.value = txn
  paymentStatus.value = outcome

  if (outcome === 'success') {
    receipt.value = {
      orderId: orderId.value,
      amount: displayTotal.value,
      method: paymentMethod.value,
      transactionRef: txn,
      time: new Date().toLocaleString(),
      // For demo: only store safe info
      methodRef:
        paymentMethod.value === 'card'
          ? `**** ${cardNumber.value.replace(/\s+/g, '').slice(-4)}`
          : transferRef.value.trim(),
    }
    info.value = 'Payment successful (simulated). Receipt generated below.'
  } else if (outcome === 'pending') {
    info.value = 'Payment pending (simulated). You may retry or check again later.'
  } else {
    error.value = 'Payment failed (simulated). You may retry or change method.'
  }

  paying.value = false
}

function retryPayment() {
  error.value = ''
  info.value = 'You can retry payment or change payment method.'
  resetPaymentUi()
}

function clearPaymentInputs() {
  cardHolder.value = ''
  cardNumber.value = ''
  cardExpiry.value = ''
  cardCvv.value = ''
  transferRef.value = ''
  resetPaymentUi()
}

function goOrders() {
  router.push('/orders')
}
</script>

<template>
  <div class="checkout-page">
    <h1>Checkout</h1>

    <div v-if="error" class="alert alert-error">{{ error }}</div>
    <div v-if="info" class="alert alert-info">{{ info }}</div>

    <div class="checkout-grid">
      <!-- LEFT: Order Summary + Delivery -->
      <div class="card">
        <h2>Order Summary</h2>

        <div class="badge">
          <span class="dot" :class="{ ok: auth.isLoggedIn }"></span>
          <span class="muted">
            {{ auth.isLoggedIn ? `Logged in: ${auth.user?.name ?? auth.user?.email}` : 'Not logged in' }}
          </span>
        </div>

        <div class="hr"></div>

        <section class="section">
          <h3>Delivery details</h3>
          <div class="field">
            <label>Delivery address <span class="req">*</span></label>
            <textarea
              v-model="address"
              rows="3"
              :disabled="orderCreated"
              placeholder="Enter your full delivery address&#10;e.g. 123 Main St, District 1, Ho Chi Minh City"
            />
          </div>

          <div class="field">
            <label>Order notes (optional)</label>
            <input
              v-model="notes"
              type="text"
              :disabled="orderCreated"
              placeholder="e.g. Leave at front door"
            />
          </div>

          <div class="actions">
            <button
              class="btn primary"
              @click="confirmOrder"
              :disabled="placingOrder || orderCreated"
            >
              {{ placingOrder ? 'Confirming...' : (orderCreated ? 'Order Confirmed' : 'Confirm Order') }}
            </button>

            <RouterLink to="/cart" class="btn ghost">← Back to Cart</RouterLink>
          </div>

          <p class="help">
            Note: Payment is simulated for Assignment 3 (no real banking).
          </p>
        </section>

        <section class="section">
          <h3>Items ({{ displayItems.length }})</h3>

          <table class="table">
            <thead>
              <tr>
                <th>Item</th>
                <th class="right">Qty</th>
                <th class="right">Price</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="it in displayItems" :key="it.product?.id || it.productId">
                <td>{{ it.product?.name || it.name || 'Unknown Product' }}</td>
                <td class="right">{{ it.quantity }}</td>
                <td class="right">
                  {{ money((it.product?.price ?? it.unitPrice ?? 0) * it.quantity) }}
                </td>
              </tr>
            </tbody>
          </table>

          <div class="summary">
            <div class="row"><span>Subtotal</span><span>{{ money(displaySubtotal) }}</span></div>
            <div class="row"><span>Tax (10%)</span><span>{{ money(displayTax) }}</span></div>
            <div class="row"><span>Delivery fee</span><span>{{ money(DELIVERY_FEE) }}</span></div>
            <div class="divider"></div>
            <div class="row total"><span>Total</span><span>{{ money(displayTotal) }}</span></div>
          </div>
        </section>
      </div>

      <!-- RIGHT: Payment -->
      <div class="card">
        <h2>Payment</h2>

        <section class="section">
          <h3>Payment method</h3>
          <p class="help warn">
            ⚠️ Payment processing is simulated — no real transaction will occur.
          </p>

          <div class="payment-options">
            <label
              v-for="m in paymentMethods"
              :key="m.value"
              class="payment-option"
              :class="{ selected: paymentMethod === m.value }"
            >
              <input type="radio" v-model="paymentMethod" :value="m.value" :disabled="!orderCreated || paying" />
              <span>{{ m.label }}</span>
            </label>
          </div>

          <!-- Card form -->
          <div v-if="paymentMethod === 'card'" class="subcard">
            <div class="field">
              <label>Cardholder name</label>
              <input v-model="cardHolder" type="text" :disabled="!orderCreated || paying" placeholder="e.g., DUNG LE" />
            </div>
            <div class="field">
              <label>Card number</label>
              <input v-model="cardNumber" type="text" :disabled="!orderCreated || paying" placeholder="12–19 digits" />
            </div>
            <div class="grid2">
              <div class="field">
                <label>Expiry (MM/YY)</label>
                <input v-model="cardExpiry" type="text" :disabled="!orderCreated || paying" placeholder="08/28" />
              </div>
              <div class="field">
                <label>CVV</label>
                <input v-model="cardCvv" type="password" :disabled="!orderCreated || paying" placeholder="123" />
              </div>
            </div>
          </div>

          <!-- Bank transfer panel -->
          <div v-else class="subcard">
            <div class="bank-box">
              <b>Bank transfer instructions</b><br />
              Transfer to: <b>Demo Bank</b><br />
              Account: <b>123-456-789</b><br />
              Content: <b>{{ orderId ?? 'ORDER-XXXX' }}</b>
            </div>
            <div class="field">
              <label>Transfer reference</label>
              <input v-model="transferRef" type="text" :disabled="!orderCreated || paying" placeholder="e.g., FT123456" />
            </div>
          </div>

          <div class="field">
            <label>Demo: force payment result</label>
            <select v-model="forceResult" :disabled="!orderCreated || paying">
              <option value="random">Random</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div class="actions">
            <button class="btn primary" @click="payNow" :disabled="!orderCreated || paying">
              {{ paying ? 'Processing...' : 'Pay now' }}
            </button>

            <button class="btn ghost" @click="retryPayment" :disabled="!orderCreated || paying">
              Retry / Change method
            </button>

            <button class="btn ghost" @click="clearPaymentInputs" :disabled="!orderCreated || paying">
              Clear
            </button>
          </div>
        </section>

        <section class="section">
          <h3>Result</h3>

          <div v-if="paymentStatus === 'idle'" class="alert muted-box">
            No payment attempt yet.
          </div>

          <div v-else-if="paymentStatus === 'success'" class="alert ok-box">
            ✓ Payment successful. Ref: <b>{{ paymentRef }}</b>
          </div>

          <div v-else-if="paymentStatus === 'pending'" class="alert warn-box">
            ⏳ Payment pending. Ref: <b>{{ paymentRef }}</b>
          </div>

          <div v-else class="alert bad-box">
            ✕ Payment failed. Ref: <b>{{ paymentRef }}</b>
          </div>

          <div v-if="receipt" class="subcard receipt">
            <h3>Receipt</h3>
            <div class="kv"><span>Order</span><b>#{{ receipt.orderId }}</b></div>
            <div class="kv"><span>Amount</span><b>{{ money(receipt.amount) }}</b></div>
            <div class="kv"><span>Method</span><b>{{ receipt.method === 'card' ? 'Card' : 'Bank transfer' }}</b></div>
            <div class="kv"><span>Method ref</span><b>{{ receipt.methodRef }}</b></div>
            <div class="kv"><span>Transaction</span><b>{{ receipt.transactionRef }}</b></div>
            <div class="kv"><span>Time</span><b>{{ receipt.time }}</b></div>

            <div class="actions">
              <button class="btn ghost" @click="goOrders">View My Orders</button>
              <RouterLink to="/catalogue" class="btn ghost">Continue Shopping</RouterLink>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.checkout-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.5rem 1rem 3rem;
}

h1 {
  font-size: 1.9rem;
  color: #10324a;
  margin: 0 0 1rem;
}

h2 {
  color: #10324a;
  margin: 0 0 0.75rem;
}

.checkout-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 1rem;
  align-items: start;
}
@media (max-width: 900px) {
  .checkout-grid { grid-template-columns: 1fr; }
}

.card {
  background: #fff;
  border: 1px solid #d7e8ff;
  border-radius: 14px;
  box-shadow: 0 10px 25px rgba(16,42,67,0.08);
  padding: 1rem;
}

.section { margin-top: 0.75rem; }
.section h3 {
  margin: 0.5rem 0 0.6rem;
  font-size: 1.05rem;
  color: #10324a;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  border: 1px solid #d7e8ff;
  background: #fff;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #e03a3e;
}
.dot.ok { background: #26a269; }
.muted { color: #5b6b7a; font-size: 0.9rem; }

.hr { height: 1px; background: #d7e8ff; margin: 0.75rem 0; }

.field { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 0.7rem; }
label { font-size: 0.85rem; color: #5b6b7a; }
.req { color: #e03a3e; }

input, textarea, select {
  width: 100%;
  padding: 0.65rem 0.8rem;
  border-radius: 12px;
  border: 1px solid #d7e8ff;
  outline: none;
  font-size: 0.95rem;
  font-family: inherit;
}
input:focus, textarea:focus, select:focus {
  border-color: #a9d1ff;
  box-shadow: 0 0 0 4px rgba(123,182,255,0.18);
}

textarea { resize: vertical; }

.actions { display: flex; gap: 0.6rem; flex-wrap: wrap; margin-top: 0.25rem; }

.btn {
  border-radius: 12px;
  padding: 0.65rem 0.9rem;
  border: 1px solid transparent;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.95rem;
}
.btn.primary {
  background: linear-gradient(180deg, #7bb6ff 0%, #4a95ff 100%);
  color: #ffffff;
}
.btn.primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn.ghost {
  background: #fff;
  border-color: #d7e8ff;
  color: #10324a;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}

.help { margin: 0.4rem 0 0; color: #5b6b7a; font-size: 0.85rem; }
.help.warn { background: #fef9f0; border: 1px solid rgba(245,166,35,0.35); padding: 0.5rem 0.65rem; border-radius: 12px; }

.table { width: 100%; border-collapse: collapse; margin-top: 0.25rem; }
.table th, .table td {
  padding: 0.6rem 0.4rem;
  border-bottom: 1px solid #d7e8ff;
  font-size: 0.92rem;
}
.table th { color: #5b6b7a; text-align: left; }
.right { text-align: right; }

.summary { margin-top: 0.8rem; }
.summary .row {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  color: #10324a;
  font-size: 0.95rem;
  padding: 0.25rem 0;
}
.summary .divider { height: 1px; background: #d7e8ff; margin: 0.6rem 0; }
.summary .total { font-weight: 800; font-size: 1.05rem; }

.payment-options { display: flex; flex-direction: column; gap: 0.55rem; margin: 0.5rem 0; }
.payment-option {
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0.65rem 0.8rem;
  border: 1px solid #d7e8ff;
  border-radius: 12px;
  cursor: pointer;
  user-select: none;
}
.payment-option.selected { border-color: #a9d1ff; background: #eaf4ff; }
.payment-option input { accent-color: #4a95ff; }

.subcard {
  border: 1px solid #d7e8ff;
  border-radius: 14px;
  background: #fff;
  padding: 0.8rem;
  margin-top: 0.65rem;
}

.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; }
@media (max-width: 520px) { .grid2 { grid-template-columns: 1fr; } }

.bank-box {
  border-radius: 12px;
  padding: 0.7rem 0.8rem;
  border: 1px solid rgba(245,166,35,0.35);
  background: #fef9f0;
  color: #10324a;
  font-size: 0.9rem;
  margin-bottom: 0.6rem;
}

.alert {
  border-radius: 12px;
  padding: 0.65rem 0.8rem;
  border: 1px solid #d7e8ff;
  background: #fff;
  font-size: 0.95rem;
  margin-bottom: 0.75rem;
}
.alert-error { border-color: rgba(224,58,62,0.35); background: rgba(224,58,62,0.08); }
.alert-info { border-color: rgba(123,182,255,0.35); background: rgba(123,182,255,0.10); }

.muted-box { color: #5b6b7a; }
.ok-box { border-color: rgba(38,162,105,0.35); background: rgba(38,162,105,0.08); }
.warn-box { border-color: rgba(245,166,35,0.45); background: rgba(245,166,35,0.10); }
.bad-box { border-color: rgba(224,58,62,0.35); background: rgba(224,58,62,0.08); }

.receipt h3 { margin-top: 0; }
.kv { display: flex; justify-content: space-between; gap: 0.75rem; padding: 0.25rem 0; }
.kv span { color: #5b6b7a; }
</style>