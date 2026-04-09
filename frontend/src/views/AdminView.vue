<script setup>
import { ref, onMounted } from 'vue'
import { productApi } from '@/api/products'

const products = ref([])
const loading = ref(true)
const editingProduct = ref(null)

async function loadProducts() {
  try {
    const res = await productApi.getAll({ status: 'all' })
    products.value = res.data
  } catch (err) {
    console.error('Failed to load inventory', err)
  } finally {
    loading.value = false
  }
}

async function handleUpdate() {
  try {
    // 1. Prepare data - ensure numbers are actual Numbers, not strings from the input
    const payload = {
      ...editingProduct.value,
      price: Number(editingProduct.value.price),
      stock: Number(editingProduct.value.stock),
      image_url: editingProduct.value.image_url || ''
    }

    // 2. Call API
    await productApi.update(payload.id, payload)
    
    // 3. Reset and Refresh
    editingProduct.value = null
    await loadProducts() 
    alert('Product updated successfully!')
  } catch (err) {
    console.error('Update Error:', err.response || err)
    const errorMsg = err.response?.data?.error || err.message || 'Unknown error'
    alert('Update failed: ' + errorMsg)
  }
}

function startEdit(product) {
  editingProduct.value = { ...product }
}

onMounted(loadProducts)
</script>

<template>
  <div class="admin-container">
    <header class="admin-header">
      <h1>Inventory Management</h1>
      <p>Update product details and stock levels in real-time.</p>
    </header>

    <div v-if="loading" class="loader">Loading System Data...</div>

    <div v-else class="inventory-table-wrapper">
      <table class="inventory-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Product</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in products" :key="p.id">
            <td>
              <img :src="p.image_url || 'https://placehold.co/50x50?text=No+Img'" 
                  style="width: 45px; height: 45px; object-fit: cover; border-radius: 6px; background: #f0f0f0;" />
            </td>

            <td><strong>{{ p.name }}</strong></td>
            <td>{{ p.category }}</td>
            <td>${{ p.price.toFixed(2) }}</td>
            <td :class="{ 'low-stock': p.stock < 10 }">{{ p.stock }}</td>
            <td><span class="status-badge" :class="p.status">{{ p.status }}</span></td>
            <td>
              <button class="btn-edit" @click="startEdit(p)">Edit</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="editingProduct" class="modal-overlay">
      <div class="edit-modal">
        <h2>Edit Product</h2>
        <form @submit.prevent="handleUpdate">
          <div class="form-grid">
            <div class="field">
              <label>Name</label>
              <input v-model="editingProduct.name" required />
            </div>
            <div class="field">
              <label>Price ($)</label>
              <input type="number" step="0.01" v-model="editingProduct.price" required />
            </div>
            <div class="field">
              <label>Stock Quantity</label>
              <input type="number" v-model="editingProduct.stock" required />
            </div>
            <div class="field">
              <label>Image URL</label>
              <input v-model="editingProduct.image_url" placeholder="https://..." />
            </div>
            <div class="field">
              <label>Status</label>
              <select v-model="editingProduct.status">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" @click="editingProduct = null" class="btn-cancel">Cancel</button>
            <button type="submit" class="btn-save">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Keeping your existing styles */
.admin-container { padding: 2rem; max-width: 1200px; margin: 0 auto; }
.inventory-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
th, td { padding: 1.2rem; text-align: left; border-bottom: 1px solid #eee; }
.low-stock { color: #e74c3c; font-weight: bold; }
.status-badge { padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; text-transform: uppercase; }
.status-badge.active { background: #eafaf1; color: #27ae60; }
.btn-edit { background: #3498db; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; }

.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.edit-modal { background: white; padding: 2rem; border-radius: 16px; width: 500px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
.form-grid { display: grid; gap: 1rem; margin-bottom: 2rem; }
.field label { display: block; margin-bottom: 0.5rem; font-weight: bold; }
.field input, .field select { width: 100%; padding: 0.8rem; border: 1px solid #ddd; border-radius: 8px; }
.modal-actions { display: flex; gap: 1rem; justify-content: flex-end; }
.btn-save { background: #27ae60; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 8px; cursor: pointer; }
.btn-cancel { background: none; border: 1px solid #ddd; padding: 0.8rem 1.5rem; border-radius: 8px; cursor: pointer; }
</style>