import { ref } from 'vue'
import { auth } from './config'
import { onAuthStateChanged, signOut } from 'firebase/auth'

// Create reactive references
export const user = ref(null)
export const loading = ref(true)

// Initialize auth state listener
onAuthStateChanged(auth, (currentUser) => {
    user.value = currentUser
    loading.value = false
})

// Export auth utilities
export const logout = async () => {
    try {
        await signOut(auth)
    } catch (error) {
        console.error('Logout error:', error)
        throw error
    }
} 