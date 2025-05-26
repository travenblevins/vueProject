import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { environment } from '../config/environment'


const firebaseConfig = environment.firebase

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app)

export { auth } 