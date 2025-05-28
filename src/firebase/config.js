import { initializeApp } from 'firebase/app'
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { environment } from '../config/environment'

const firebaseConfig = environment.firebase

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app)

// Set persistence to LOCAL (persists even after browser restart)
// Make sure to handle any errors that might occur
setPersistence(auth, browserLocalPersistence)
    .catch((error) => {
        console.error('Error setting auth persistence:', error)
    })

// Initialize Firestore
const db = getFirestore(app)

// Export initialized instances
export { auth, db }

// Export a function to get the current auth state
export const getCurrentUser = () => {
    return new Promise((resolve, reject) => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            unsubscribe()
            resolve(user)
        }, reject)
    })
} 