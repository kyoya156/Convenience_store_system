<script setup>
import { RouterView, RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore  } from '@/stores/cart'
import { onMounted } from 'vue'

const auth   = useAuthStore()
const cart   = useCartStore()
const router = useRouter()

function logout() {
  auth.logout()
  router.push('/login')
}

onMounted(() => {
  if (auth.isLoggedIn) {
    cart.fetchCart()
  }
})

</script>

<template>
  <div class="app">
    <nav class="navbar">
      <div class="nav-brand">
        <RouterLink to="/">🛒 Local Store</RouterLink>
      </div>

      <div class="nav-links">
        <RouterLink to="/cart" class="cart-link">
          Cart
          <span v-if="cart.count > 0" class="cart-badge">{{ cart.count }}</span>
        </RouterLink>

        <template v-if="auth.isLoggedIn">
          <RouterLink to="/orders">My Orders</RouterLink>
          <RouterLink v-if="auth.isAdmin" to="/admin">Admin</RouterLink>
          <span class="nav-user">Hi, {{ auth.user?.name }}</span>
          <button class="btn-logout" @click="logout">Logout</button>
        </template>

        <template v-else>
          <RouterLink to="/login">Login</RouterLink>
          <RouterLink to="/register">Register</RouterLink>
        </template>
      </div>
    </nav>

    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #f5f5f5;
  color: #333;
}

.app { min-height: 100vh; display: flex; flex-direction: column; }

.navbar {
  background: #2c3e50;
  color: white;
  padding: 0 2rem;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-brand a {
  color: white;
  text-decoration: none;
  font-size: 1.2rem;
  font-weight: bold;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-links a {
  color: #ecf0f1;
  text-decoration: none;
  font-size: 0.95rem;
}

.nav-links a:hover { color: white; }

.nav-links a.router-link-active { color: #3498db; font-weight: 600; }

.cart-link { position: relative; }

.cart-badge {
  background: #e74c3c;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.7rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: -8px;
  right: -10px;
}

.nav-user { color: #bdc3c7; font-size: 0.9rem; }

.btn-logout {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-logout:hover { background: #c0392b; }

.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}
</style>