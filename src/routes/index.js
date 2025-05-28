import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/LoginComponent.vue'
import SignupComponent from '../components/SignupComponent.vue'
import MovieComponent from '../components/MovieComponent.vue'
import MovieLists from '../components/MovieLists.vue'
import { getCurrentUser } from '../firebase/config'

const routes = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: { requiresGuest: true }
    },
    {
        path: '/signup',
        name: 'Signup',
        component: SignupComponent,
        meta: { requiresGuest: true }
    },
    {
        path: '/home',
        name: 'Home',
        component: MovieComponent,
        meta: { requiresAuth: true }
    },
    {
        path: '/my-lists',
        name: 'MovieLists',
        component: MovieLists,
        meta: { requiresAuth: true }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Navigation guard to check authentication
router.beforeEach(async (to, from, next) => {
    const user = await getCurrentUser()

    // Check if the route requires authentication
    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!user) {
            next('/login')
        } else {
            next()
        }
    }
    // Check if the route requires guest access (login/signup)
    else if (to.matched.some(record => record.meta.requiresGuest)) {
        if (user) {
            next('/home')
        } else {
            next()
        }
    } else {
        next()
    }
})

export default router
