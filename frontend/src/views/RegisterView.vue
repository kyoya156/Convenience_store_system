<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth   = useAuthStore()

const name     = ref('')
const email    = ref('')
const password = ref('')
const confirm  = ref('')
const error    = ref('')
const loading  = ref(false)

async function handleRegister() {
  error.value   = ''
  loading.value = true

  // Validation
  if (!name.value.trim())       { error.value = 'Name is required';                    loading.value = false; return }
  if (!email.value.trim())      { error.value = 'Email is required';                   loading.value = false; return }
  if (!password.value)          { error.value = 'Password is required';                loading.value = false; return }
  if (password.value.length < 6){ error.value = 'Password must be at least 6 characters'; loading.value = false; return }
  if (password.value !== confirm.value) { error.value = 'Passwords do not match';      loading.value = false; return }

  try {
    await auth.register(name.value, email.value, password.value)
    router.push('/')
  } catch (err) {
    error.value = err.response?.data?.error || 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1>Create Account</h1>
      <p class="auth-sub">Join Local Store today</p>

      <div v-if="error" class="alert alert-error">{{ error }}</div>

      <div class="form-group">
        <label>Full Name</label>
        <input v-model="name" type="text" placeholder="Your name" />
      </div>

      <div class="form-group">
        <label>Email</label>
        <input v-model="email" type="email" placeholder="you@example.com" />
      </div>

      <div class="form-group">
        <label>Password</label>
        <input v-model="password" type="password" placeholder="At least 6 characters" />
      </div>

      <div class="form-group">
        <label>Confirm Password</label>
        <input
          v-model="confirm"
          type="password"
          placeholder="Repeat your password"
          @keyup.enter="handleRegister"
        />
      </div>

      <button class="btn-primary" @click="handleRegister" :disabled="loading">
        {{ loading ? 'Creating account...' : 'Create Account' }}
      </button>

      <p class="auth-footer">
        Already have an account?
        <RouterLink to="/login">Login here</RouterLink>
      </p>
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
</style>