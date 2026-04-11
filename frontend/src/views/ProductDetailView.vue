<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { productApi } from '@/api/products'
import { useCartStore } from '@/stores/cart'

const route   = useRoute()
const router  = useRouter()
const cart    = useCartStore()

const product  = ref(null)
const loading  = ref(true)
const error    = ref('')
const quantity = ref(1)
const added    = ref(false)

async function loadProduct() {
  try {
    const res  = await productApi.getById(route.params.id)
    product.value = res.data
  } catch {
    error.value = 'Product not found.'
  } finally {
    loading.value = false
  }
}

function addToCart() {
  if (!product.value) return
  cart.addItem(product.value, quantity.value)
  added.value = true
  setTimeout(() => added.value = false, 2000)
}

onMounted(loadProduct)
</script>

<template>
  <div>
    <button class="btn-back" @click="router.back()">← Back</button>

    <div v-if="loading" class="state-msg">Loading...</div>
    <div v-else-if="error" class="state-msg error">{{ error }}</div>

    <div v-else-if="product" class="detail-card">
      <div class="detail-info">
        <span class="badge">{{ product.category }}</span>
        <h1>{{ product.name }}</h1>
        <p class="desc">{{ product.description }}</p>
        <p class="price">${{ product.price.toFixed(2) }}</p>

        <p class="stock" :class="{
          'stock-ok':  product.stock > 10,
          'stock-low': product.stock > 0 && product.stock <= 10,
          'stock-out': product.stock === 0
        }">
          <span v-if="product.stock > 10">In Stock ({{ product.stock }} available)</span>
          <span v-else-if="product.stock > 0">Low Stock — only {{ product.stock }} left!</span>
          <span v-else>Out of Stock</span>
        </p>

        <div v-if="product.stock > 0" class="qty-row">
          <label>Quantity:</label>
          <input
            v-model.number="quantity"
            type="number"
            min="1"
            :max="product.stock"
          />
        </div>

        <button
        v-if="auth.user?.role !== 'admin'"
          class="btn-cart"
          @click="addToCart"
          :disabled="product.stock === 0"
          :class="{ 'btn-added': added }"
        >
          {{ added ? '✓ Added to Cart!' : 'Add to Cart' }}
        </button>

        <button 
        v-if="auth.user?.role !== 'admin'" 
        class="btn-add-main" 
        @click="addToCart"
      >
        {{ added ? '✓ Added to Cart' : 'Add to Cart' }}
      </button>

      <p v-else class="admin-warning">Viewing as Admin: Purchase disabled</p>

        <div v-if="added" class="cart-hint">
          <RouterLink to="/cart">View Cart →</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn-back {
  background: none;
  border: none;
  color: #3498db;
  cursor: pointer;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
  padding: 0;
}
.btn-back:hover { text-decoration: underline; }

.state-msg { text-align: center; padding: 3rem; color: #888; }
.state-msg.error { color: #e74c3c; }

.detail-card {
  background: white;
  border-radius: 12px;
  padding: 2.5rem;
  max-width: 600px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.badge {
  display: inline-block;
  background: #eaf4fb;
  color: #2980b9;
  font-size: 0.8rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  text-transform: capitalize;
  margin-bottom: 0.75rem;
}

h1 { font-size: 1.8rem; color: #2c3e50; margin-bottom: 0.5rem; }
.desc  { color: #666; margin-bottom: 1rem; line-height: 1.6; }
.price { font-size: 2rem; font-weight: 700; color: #27ae60; margin-bottom: 0.75rem; }

.stock { font-size: 0.9rem; font-weight: 500; margin-bottom: 1.25rem; }
.stock-ok  { color: #27ae60; }
.stock-low { color: #e67e22; }
.stock-out { color: #e74c3c; }

.qty-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}
.qty-row label { font-weight: 500; color: #555; }
.qty-row input {
  width: 80px;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  text-align: center;
}

.btn-cart {
  width: 100%;
  padding: 0.85rem;
  background: #2c3e50;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-cart:hover:not(:disabled) { background: #3498db; }
.btn-cart:disabled { background: #bdc3c7; cursor: not-allowed; }
.btn-added { background: #27ae60 !important; }

.cart-hint {
  text-align: center;
  margin-top: 0.75rem;
  font-size: 0.9rem;
}
.cart-hint a { color: #3498db; text-decoration: none; }
.cart-hint a:hover { text-decoration: underline; }
</style>