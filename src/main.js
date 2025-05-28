import { createApp } from 'vue'
import App from './App.vue'
import router from './routes'
import { auth } from './firebase/config'
import { onAuthStateChanged } from 'firebase/auth'

let app

// Wait for firebase auth to initialize before creating the app
onAuthStateChanged(auth, () => {
    if (!app) {
        app = createApp(App)
        app.use(router)
        app.mount('#app')
    }
})
