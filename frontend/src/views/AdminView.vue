<script setup>
import { ref, onMounted } from 'vue'
import { productApi } from '@/api/products'

const products = ref([])
const loading = ref(true)
const editingProduct = ref(null) // Holds the product currently being edited

async function loadProducts() {
  try {
    const res = await productApi.getAll({ status: 'all' }) // Staff needs to see archived items too
    products.value = res.data
  } catch (err) {
    console.error('Failed to load inventory', err)
  } finally {
    loading.value = false
  }
}

async function handleUpdate() {
  try {
    await productApi.update(editingProduct.value.id, editingProduct.value)
    editingProduct.value = null
    await loadProducts() // Refresh the list
    alert('Product updated successfully!')
  } catch (err) {
    alert('Update failed: ' + (err.response?.data?.error || 'Unknown error'))
  }
}

function startEdit(product) {
  editingProduct.value = { ...product } // Create a copy to edit
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
.admin-container { padding: 2rem; max-width: 1200px; margin: 0 auto; }
.inventory-table { width: 100%; border-collapse: collapse; background: var(--bg); border-radius: 12px; overflow: hidden; box-shadow: var(--shadow); }
th, td { padding: 1.2rem; text-align: left; border-bottom: 1px solid var(--border); }
.low-stock { color: #e74c3c; font-weight: bold; }
.status-badge { padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; text-transform: uppercase; }
.status-badge.active { background: #eafaf1; color: #27ae60; }
.btn-edit { background: var(--accent); color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; }

/* Modal Styles */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.edit-modal { background: white; padding: 2rem; border-radius: 16px; width: 500px; box-shadow: var(--shadow); }
.form-grid { display: grid; gap: 1rem; margin-bottom: 2rem; }
.field label { display: block; margin-bottom: 0.5rem; font-weight: bold; color: var(--text-h); }
.field input, .field select { width: 100%; padding: 0.8rem; border: 1px solid var(--border); border-radius: 8px; }
.modal-actions { display: flex; gap: 1rem; justify-content: flex-end; }
.btn-save { background: var(--accent); color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 8px; cursor: pointer; }
.btn-cancel { background: none; border: 1px solid var(--border); padding: 0.8rem 1.5rem; border-radius: 8px; cursor: pointer; }
</style>