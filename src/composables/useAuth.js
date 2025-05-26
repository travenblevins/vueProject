import { ref, onMounted, onUnmounted } from 'vue'
import { auth } from '../firebase/config'
import { onAuthStateChanged, signOut } from 'firebase/auth'

/**
 * useAuth Composable
 * A composable function that manages authentication state and provides auth utilities
 * Composables are a way to reuse stateful logic between components
 */
export function useAuth() {
    // Reactive references for auth state
    const user = ref(null)        // Stores current user data
    const loading = ref(true)     // Tracks if we're checking auth state
    let unsubscribe              // Stores cleanup function for auth listener

    /**
     * onMounted Hook
     * Executes when the component using this composable is mounted to the DOM
     * Perfect for setting up listeners and initializing auth state
     * 
     * This is similar to componentDidMount in class components or
     * the mounted() lifecycle hook in Options API
     */
    onMounted(() => {
        // Start listening for auth state changes
        unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            user.value = currentUser
            loading.value = false
        })
    })

    /**
     * onUnmounted Hook
     * Executes when the component using this composable is removed from the DOM
     * Perfect for cleaning up listeners and preventing memory leaks
     * 
     * This is similar to componentWillUnmount in class components or
     * the unmounted() lifecycle hook in Options API
     */
    onUnmounted(() => {
        // Remove auth listener when component unmounts
        unsubscribe && unsubscribe()
    })

    /**
     * Logout Function
     * Async function that handles user logout
     * Uses Firebase's signOut method
     */
    const logout = async () => {
        try {
            await signOut(auth)
        } catch (error) {
            console.error('Logout error:', error)
            throw error
        }
    }

    // Return the composable's public interface
    // These values and functions can be used by any component
    return {
        user,     // null if not authenticated
        loading,  // true while checking auth
        logout    // function to sign out
    }
} 