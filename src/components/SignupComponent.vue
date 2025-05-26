<template>
    <div class="signup-container">
        <form class="signup-form" @submit.prevent="handleSignup">
            <h2>Sign Up</h2>
            <div class="input-group">
                <label for="name">Full Name</label>
                <input id="name" v-model="name" type="text" placeholder="Enter your full name" required />
            </div>
            <div class="input-group">
                <label for="email">Email</label>
                <input id="email" v-model="email" type="email" placeholder="Enter your email" required />
            </div>
            <div class="input-group">
                <label for="password">Password</label>
                <input id="password" v-model="password" type="password" placeholder="Enter your password" required />
            </div>
            <div class="input-group">
                <label for="confirmPassword">Confirm Password</label>
                <input id="confirmPassword" v-model="confirmPassword" type="password"
                    placeholder="Confirm your password" required />
            </div>
            <p v-if="error" class="error-message">{{ error }}</p>
            <button type="submit" :disabled="loading">
                {{ loading ? 'Signing up...' : 'Sign Up' }}
            </button>
            <p class="login-link">
                Already have an account?
                <router-link to="/login">Login</router-link>
            </p>
        </form>
    </div>
</template>

<script>
import { auth } from '../firebase/config'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'

export default {
    name: 'SignupComponent',
    data() {
        return {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            error: '',
            loading: false
        }
    },
    methods: {
        async handleSignup() {
            // Reset error
            this.error = ''
            this.loading = true

            try {
                // Basic validation
                if (this.password !== this.confirmPassword) {
                    throw new Error('Passwords do not match')
                }

                if (this.password.length < 6) {
                    throw new Error('Password should be at least 6 characters long')
                }

                // Create user with email and password
                const userCredential = await createUserWithEmailAndPassword(
                    auth,
                    this.email,
                    this.password
                )

                // Update user profile with name
                await updateProfile(userCredential.user, {
                    displayName: this.name
                })

                // Redirect to home page
                this.$router.push('/home')
            } catch (error) {
                console.error('Signup error:', error)
                this.error = error.message
            } finally {
                this.loading = false
            }
        }
    }
}
</script>

<style scoped>
.signup-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(120deg, #89f7fe 0%, #66a6ff 100%);
}

.signup-form {
    background: #fff;
    padding: 2.5rem 2rem;
    border-radius: 16px;
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2);
    width: 350px;
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
}

.signup-form h2 {
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

.login-link {
    text-align: center;
    font-size: 0.95rem;
    color: #666;
}

.login-link a {
    color: #66a6ff;
    text-decoration: none;
    font-weight: 500;
}

.login-link a:hover {
    text-decoration: underline;
}

.error-message {
    color: #dc2626;
    text-align: center;
    font-size: 0.9rem;
    margin: 0;
}
</style>