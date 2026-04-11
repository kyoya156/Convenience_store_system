<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { productApi } from '@/api/products'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'

const router   = useRouter()
const cart     = useCartStore()
const auth     = useAuthStore()

const products  = ref([])
const loading   = ref(false)
const error     = ref('')
const search    = ref('')
const category  = ref('')
const added     = ref(null)   // tracks which product just got added (for feedback)

const categories = ['food', 'drinks', 'snacks']

async function loadProducts() {
  loading.value = true
  error.value   = ''
  try {
    const params = {}
    if (search.value.trim()) params.search   = search.value.trim()
    if (category.value)      params.category = category.value
    const res    = await productApi.getAll(params)
    products.value = res.data
  } catch {
    error.value = 'Failed to load products. Is the backend running?'
  } finally {
    loading.value = false
  }
}

function addToCart(product) {
  if (!auth.isLoggedIn) {
    router.push('/login')
    return
  }

  cart.addItem(product, 1)
  added.value = product.id
  setTimeout(() => added.value = null, 1500)
}

function clearFilters() {
  search.value   = ''
  category.value = ''
  loadProducts()
}

onMounted(loadProducts)
</script>

<template>
  <div class="catalogue">

    <!-- Header -->
    <div class="catalogue-header">
      <h1>Our Products</h1>
      <p>{{ products.length }} item{{ products.length !== 1 ? 's' : '' }} available</p>
    </div>

    <!-- Filters -->
    <div class="filters">
      <input
        v-model="search"
        type="text"
        placeholder="Search products..."
        @keyup.enter="loadProducts"
        class="search-input"
      />

      <select v-model="category" @change="loadProducts" class="category-select">
        <option value="">All Categories</option>
        <option v-for="cat in categories" :key="cat" :value="cat">
          {{ cat.charAt(0).toUpperCase() + cat.slice(1) }}
        </option>
      </select>

      <button class="btn-search" @click="loadProducts">Search</button>
      <button class="btn-clear"  @click="clearFilters" v-if="search || category">Clear</button>
    </div>

    <!-- States -->
    <div v-if="loading" class="state-msg">Loading products...</div>
    <div v-else-if="error" class="state-msg error">{{ error }}</div>
    <div v-else-if="products.length === 0" class="state-msg">
      No products found.
      <button class="btn-clear" @click="clearFilters">Clear filters</button>
    </div>

    <!-- Product Grid -->
    <div v-else class="product-grid">
            <div v-for="product in products" :key="product.id" class="product-card">
        <div style="width: 100%; height: 180px; background: #f9f9f9; overflow: hidden;">
          <img :src="product.image_url || 'https://placehold.co/400x400?text=No+Image'" 
              style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <!-- Category badge -->
        <span class="badge">{{ product.category }}</span>

        <!-- Product info -->
        <h3 @click="router.push(`/product/${product.id}`)" class="product-name">
          {{ product.name }}
        </h3>
        <p class="product-desc">{{ product.description }}</p>
        <p class="product-price">${{ product.price.toFixed(2) }}</p>

        <!-- Stock status -->
        <p class="stock" :class="{
          'stock-ok':  product.stock > 10,
          'stock-low': product.stock > 0 && product.stock <= 10,
          'stock-out': product.stock === 0
        }">
          <span v-if="product.stock > 10">In Stock ({{ product.stock }})</span>
          <span v-else-if="product.stock > 0">Low Stock ({{ product.stock }} left)</span>
          <span v-else>Out of Stock</span>
        </p>

        <!-- Actions -->
        <div class="card-actions">
          <button
            class="btn-detail"
            @click="router.push(`/product/${product.id}`)"
          >
            Details
          </button>
          <button
            class="btn-cart"
            @click="addToCart(product)"
            :disabled="product.stock === 0"
            :class="{ 'btn-added': added === product.id }"
          >
            {{ added === product.id ? '✓ Added!' : 'Add to Cart' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.catalogue-header { margin-bottom: 1.5rem; }
.catalogue-header h1 { font-size: 1.8rem; color: #2c3e50; }
.catalogue-header p  { color: #888; margin-top: 0.25rem; }

.filters {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  align-items: center;
}

.search-input {
  flex: 1;
  min-width: 200px;
  padding: 0.6rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
}
.search-input:focus { outline: none; border-color: #3498db; }

.category-select {
  padding: 0.6rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  background: #2c3e50;
  cursor: pointer;
}

.btn-search {
  padding: 0.6rem 1.2rem;
  background: #2c3e50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
}
.btn-search:hover { background: #3498db; }

.btn-clear {
  padding: 0.6rem 1rem;
  background: #2c3e50;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
}
.btn-clear:hover { background: #dfe6e9; }

.state-msg {
  text-align: center;
  padding: 3rem;
  color: #888;
  font-size: 1.1rem;
}
.state-msg.error { color: #e74c3c; }

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
}

.product-card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
}
.product-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.12);
}

.badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #eaf4fb;
  color: #2980b9;
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  text-transform: capitalize;
}

.product-name {
  font-size: 1.05rem;
  color: #2c3e50;
  cursor: pointer;
  margin-top: 0.5rem;
}
.product-name:hover { color: #3498db; }

.product-desc {
  font-size: 0.85rem;
  color: #888;
  flex: 1;
}

.product-price {
  font-size: 1.3rem;
  font-weight: 700;
  color: #27ae60;
}

.stock { font-size: 0.82rem; font-weight: 500; }
.stock-ok  { color: #27ae60; }
.stock-low { color: #e67e22; }
.stock-out { color: #e74c3c; }

.card-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.btn-detail {
  flex: 1;
  padding: 0.55rem;
  background: #2c3e50;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}
.btn-detail:hover { background: #dfe6e9; }

.btn-cart {
  flex: 2;
  padding: 0.55rem;
  background: #2c3e50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}
.btn-cart:hover:not(:disabled) { background: #3498db; }
.btn-cart:disabled { background: #bdc3c7; cursor: not-allowed; }
.btn-added { background: #27ae60 !important; }
</style>