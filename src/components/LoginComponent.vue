<template>
  <div class="login-page">
    <div class="login-container">
      <form class="login-form" @submit.prevent="handleLogin">
        <h2>Login</h2>
        <div class="input-group">
          <label for="email">Email</label>
          <input id="email" v-model="email" type="email" placeholder="Enter your email" required />
        </div>
        <div class="input-group">
          <label for="password">Password</label>
          <input id="password" v-model="password" type="password" placeholder="Enter your password" required />
        </div>
        <p v-if="error" class="error-message">{{ error }}</p>
        <button type="submit" :disabled="loading">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
        <p class="signup-link">
          Don't have an account?
          <router-link to="/signup">Sign up</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script>
import { auth } from '../firebase/config'
import { signInWithEmailAndPassword } from 'firebase/auth'

export default {
  name: 'LoginComponent',
  data() {
    return {
      email: '',
      password: '',
      error: '',
      loading: false
    }
  },
  methods: {
    async handleLogin() {
      this.error = ''
      this.loading = true

      try {
        await signInWithEmailAndPassword(auth, this.email, this.password)
        this.$router.push('/home')
      } catch (error) {
        console.error('Login error:', error)
        this.error = 'Invalid email or password'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style>
/* Remove any margin and padding from body and html */
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow-x: hidden;
}
</style>

<style scoped>
.login-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(120deg, #89f7fe 0%, #66a6ff 100%);
  overflow-y: auto;
}

.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.login-form {
  background: #fff;
  padding: 2.5rem 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2);
  width: 350px;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  position: relative;
  z-index: 1;
}

.login-form h2 {
  text-align: center;
  margin-bottom: 1rem;
  color: #333;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.input-group label {
  font-weight: 500;
  color: #444;
}

.input-group input {
  padding: 0.7rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: border 0.2s;
}

.input-group input:focus {
  border-color: #66a6ff;
  outline: none;
}

button[type="submit"] {
  padding: 0.8rem;
  background: linear-gradient(90deg, #66a6ff 0%, #89f7fe 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

button[type="submit"]:hover {
  background: linear-gradient(90deg, #89f7fe 0%, #66a6ff 100%);
}

button[type="submit"]:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.signup-link {
  text-align: center;
  font-size: 0.95rem;
  color: #666;
}

.signup-link a {
  color: #66a6ff;
  text-decoration: none;
  font-weight: 500;
}

.signup-link a:hover {
  text-decoration: underline;
}

.error-message {
  color: #dc2626;
  text-align: center;
  font-size: 0.9rem;
  margin: 0;
}
</style>