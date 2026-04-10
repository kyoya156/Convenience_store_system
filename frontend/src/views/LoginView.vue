  <script setup>
  import { useAuthStore } from '@/stores/auth'
  import { ref, computed } from 'vue'
  import { useRouter, useRoute } from 'vue-router'

  const router = useRouter()
  const route  = useRoute()
  const auth   = useAuthStore()

  const email    = ref('')
  const password = ref('')
  const error    = ref('')
  const loading  = ref(false)

  const showPass = ref(false)
  const passwordType = computed(() => (showPass.value ? 'text' : 'password'))

  // Detect if error likely means "account not found"
  const showRegisterSuggestion = computed(() =>
    error.value.toLowerCase().includes('no account')
  )

  async function handleLogin() {
    error.value   = ''
    loading.value = true

    if (!email.value.trim()) {
      error.value = 'Email is required'
      loading.value = false
      return
    }

    if (!password.value) {
      error.value = 'Password is required'
      loading.value = false
      return
    }

    try {
      await auth.login(email.value, password.value)

      const target =
        route.query.redirect ||
        (auth.isAdmin ? '/admin' : '/catalogue')

      router.push(target)
    } catch (err) {
      error.value =
        err.response?.data?.error ||
        'Login failed. Please try again.'
    } finally {
      loading.value = false
    }
  }
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1>Login</h1>
      <p class="auth-sub">Welcome back to Your Local Store</p>

      <!-- Error message -->
      <div v-if="error" class="alert alert-error">
        {{ error }}

        <!-- Register suggestion appears ONLY when relevant -->
        <div v-if="showRegisterSuggestion" style="margin-top: 0.5rem;">
          No account yet?
          <RouterLink to="/register">Register here</RouterLink>
        </div>
      </div>

      <div class="form-group">
        <label>Email</label>
        <input
          v-model="email"
          type="email"
          placeholder="you@example.com"
          @keyup.enter="handleLogin"
        />
      </div>

      <div class="form-group">
        <label>Password</label>
        <div class="password-wrap">
          <input
            v-model="password"
            :type="passwordType"
            placeholder="Your password"
            @keyup.enter="handleLogin"
          />
          <button type="button" class="toggle-pass" @click="showPass = !showPass">
            {{ showPass ? 'Hide' : 'Show' }}
          </button>
        </div>
      </div>

      <button class="btn-primary" @click="handleLogin" :disabled="loading">
        {{ loading ? 'Logging in...' : 'Login' }}
      </button>

      <p class="auth-footer">
        Don't have an account?
        <RouterLink to="/register">Register here</RouterLink>
      </p>

      <!-- Quick fill for demo/testing -->
      <div class="demo-hint">
        <p>Demo accounts:</p>
        <button class="btn-demo" @click="email = 'admin@store.com'; password = 'admin123'">
          Fill Admin
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
}

.auth-card {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 420px;
}

h1 { font-size: 1.8rem; margin-bottom: 0.25rem; color: #2c3e50; }

.auth-sub { color: #888; margin-bottom: 1.5rem; }

.alert { padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.9rem; }
.alert-error { background: #fdecea; color: #c0392b; border: 1px solid #e74c3c; }

.form-group { margin-bottom: 1.2rem; }
.form-group label { display: block; margin-bottom: 0.4rem; font-weight: 500; color: #555; }
.form-group input {
  width: 100%;
  padding: 0.7rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}
.form-group input:focus { outline: none; border-color: #3498db; }

.btn-primary {
  width: 100%;
  padding: 0.8rem;
  background: #2c3e50;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: background 0.2s;
}
.btn-primary:hover:not(:disabled) { background: #3498db; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.auth-footer { text-align: center; margin-top: 1.2rem; color: #666; font-size: 0.9rem; }
.auth-footer a { color: #3498db; text-decoration: none; font-weight: 500; }

.demo-hint {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  font-size: 0.85rem;
  color: #999;
}
.demo-hint p { margin-bottom: 0.5rem; }
.btn-demo {
  background: #2c3e50;
  border: 1px solid #ddd;
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  margin-right: 0.5rem;
}

.password-wrap { position: relative; }
.toggle-pass{
  position:absolute; right:10px; top:50%;
  transform:translateY(-50%);
  border:1px solid #ddd; background:#2c3e50;
  border-radius:6px; padding:6px 10px;
  font-size:0.8rem; cursor:pointer;
}

.btn-demo:hover { background: #dfe6e9; }
</style>