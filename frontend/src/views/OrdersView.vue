<script setup>
import { ref, onMounted } from 'vue'
import { orderApi } from '@/api/orders'

const orders  = ref([])
const loading = ref(true)
const error   = ref('')

const statusColors = {
  confirmed: '#3498db',
  paid:      '#27ae60',
  packed:    '#e67e22',
  dispatched:'#9b59b6',
  delivered: '#27ae60',
  cancelled: '#e74c3c',
}

async function loadOrders() {
  try {
    const res = await orderApi.getAll()
    orders.value = res.data
  } catch {
    error.value = 'Failed to load orders.'
  } finally {
    loading.value = false
  }
}

onMounted(loadOrders)
</script>

<template>
  <div class="orders-page">
    <h1>My Orders</h1>

    <div v-if="loading" class="state-msg">Loading orders...</div>
    <div v-else-if="error" class="state-msg error">{{ error }}</div>
    <div v-else-if="orders.length === 0" class="state-msg">
      <p>You haven't placed any orders yet.</p>
      <RouterLink to="/catalogue" class="btn-shop">Start Shopping</RouterLink>
    </div>

    <div v-else class="orders-list">
      <div v-for="order in orders" :key="order.id" class="order-card">

        <div class="order-header">
          <div>
            <h3>Order #{{ order.id }}</h3>
            <p class="order-date">{{ new Date(order.created_at).toLocaleString() }}</p>
          </div>
          <span
            class="status-badge"
            :style="{ background: statusColors[order.status] || '#888' }"
          >
            {{ order.status }}
          </span>
        </div>

        <div class="order-items">
          <div v-for="item in order.items" :key="item.productId" class="order-item">
            <span>{{ item.name }} × {{ item.quantity }}</span>
            <span>${{ (item.unitPrice * item.quantity).toFixed(2) }}</span>
          </div>
        </div>

        <div class="order-footer">
          <p class="delivery-addr">📍 {{ order.delivery_address }}</p>
          <p class="order-total">Total: <strong>${{ order.total.toFixed(2) }}</strong></p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
h1 { font-size: 1.8rem; color: #2c3e50; margin-bottom: 1.5rem; }

.state-msg { text-align: center; padding: 3rem; color: #888; font-size: 1.1rem; }
.state-msg.error { color: #e74c3c; }
.btn-shop {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.7rem 1.5rem;
  background: #2c3e50;
  color: white;
  border-radius: 8px;
  text-decoration: none;
}

.orders-list { display: flex; flex-direction: column; gap: 1.25rem; }

.order-card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}
.order-header h3 { font-size: 1.05rem; color: #2c3e50; }
.order-date { font-size: 0.82rem; color: #000000; margin-top: 0.2rem; }

.status-badge {
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
}

.order-items {
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  padding: 0.75rem 0;
  margin-bottom: 0.75rem;
}
.order-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #555;
  padding: 0.3rem 0;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.delivery-addr { font-size: 0.85rem; color: #888; flex: 1; }
.order-total   { font-size: 1rem; color: #2c3e50; }
</style>