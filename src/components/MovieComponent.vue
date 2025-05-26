<template>
    <div class="movie-container">
        <header>
            <h1>Movie Explorer</h1>
            <div class="search-container">
                <input type="text" v-model="searchQuery" @input="handleSearch" placeholder="Search movies..."
                    class="search-input" />
            </div>
            <div class="user-info">
                <span v-if="user">Welcome, {{ user.displayName || user.email }}</span>
                <button @click="handleLogout" class="logout-btn">Logout</button>
            </div>
        </header>

        <div class="loading" v-if="loading">Loading movies...</div>
        <div v-else-if="error" class="error">{{ error }}</div>

        <div v-else class="movies-grid">
            <div v-for="movie in movies" :key="movie.id" class="movie-card">
                <img :src="movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/no-poster.jpg'"
                    :alt="movie.title" class="movie-poster" />
                <div class="movie-info">
                    <h3>{{ movie.title }}</h3>
                    <div class="movie-details">
                        <span class="rating">⭐ {{ movie.vote_average.toFixed(1) }}</span>
                        <span class="year">{{ new Date(movie.release_date).getFullYear() }}</span>
                    </div>
                    <p class="overview">{{ movie.overview.slice(0, 150) }}...</p>
                </div>
            </div>
        </div>

        <div v-if="!loading && !error && movies.length === 0" class="no-results">
            No movies found
        </div>

        <div v-if="!loading && !error && movies.length > 0" class="pagination">
            <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)" class="page-btn">
                Previous
            </button>
            <span class="page-info">Page {{ currentPage }}</span>
            <button @click="changePage(currentPage + 1)" class="page-btn">
                Next
            </button>
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useRouter } from 'vue-router'
import { environment } from '../config/environment'

const API_KEY = environment.tmdb.apiKey
const BASE_URL = environment.tmdb.baseUrl

export default {
    name: 'MovieComponent',
    setup() {
        const { user, logout } = useAuth()
        const router = useRouter()

        const movies = ref([])
        const loading = ref(true)
        const error = ref(null)
        const searchQuery = ref('')
        const currentPage = ref(1)
        const searchTimeout = ref(null)

        const fetchMovies = async (page = 1, query = '') => {
            loading.value = true
            error.value = null

            try {
                const endpoint = query
                    ? `${BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}`
                    : `${BASE_URL}/movie/top_rated?page=${page}`

                const response = await fetch(endpoint, {
                    headers: {
                        'Authorization': `Bearer ${API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                })

                if (!response.ok) {
                    throw new Error('Failed to fetch movies')
                }

                const data = await response.json()
                movies.value = data.results
                currentPage.value = page
            } catch (err) {
                console.error('Error fetching movies:', err)
                error.value = 'Failed to load movies. Please try again later.'
            } finally {
                loading.value = false
            }
        }

        const handleSearch = () => {
            if (searchTimeout.value) {
                clearTimeout(searchTimeout.value)
            }

            searchTimeout.value = setTimeout(() => {
                currentPage.value = 1
                fetchMovies(1, searchQuery.value)
            }, 500)
        }

        const changePage = (page) => {
            fetchMovies(page, searchQuery.value)
            window.scrollTo(0, 0)
        }

        const handleLogout = async () => {
            try {
                await logout()
                router.push('/login')
            } catch (err) {
                console.error('Logout error:', err)
            }
        }

        onMounted(() => {
            fetchMovies()
        })

        return {
            movies,
            loading,
            error,
            searchQuery,
            currentPage,
            user,
            handleSearch,
            changePage,
            handleLogout
        }
    }
}
</script>

<style scoped>
.movie-container {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
}

h1 {
    color: #2c3e50;
    margin: 0;
}

.search-container {
    flex: 1;
    max-width: 400px;
    margin: 0 1rem;
}

.search-input {
    width: 100%;
    padding: 0.8rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s;
}

.search-input:focus {
    border-color: #66a6ff;
    outline: none;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.logout-btn {
    padding: 0.5rem 1rem;
    background: #dc2626;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s;
}

.logout-btn:hover {
    background: #b91c1c;
}

.movies-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
}

.movie-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s;
}

.movie-card:hover {
    transform: translateY(-5px);
}

.movie-poster {
    width: 100%;
    height: 375px;
    object-fit: cover;
}

.movie-info {
    padding: 1rem;
}

.movie-info h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.1rem;
    color: #2c3e50;
}

.movie-details {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
}

.rating {
    color: #eab308;
    font-weight: 600;
}

.year {
    color: #64748b;
}

.overview {
    font-size: 0.9rem;
    color: #64748b;
    margin: 0;
    line-height: 1.4;
}

.loading,
.error,
.no-results {
    text-align: center;
    padding: 2rem;
    color: #64748b;
}

.error {
    color: #dc2626;
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 2rem;
    padding: 1rem;
}

.page-btn {
    padding: 0.5rem 1rem;
    background: #66a6ff;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s;
}

.page-btn:hover:not(:disabled) {
    background: #3b82f6;
}

.page-btn:disabled {
    background: #94a3b8;
    cursor: not-allowed;
}

.page-info {
    color: #64748b;
    font-weight: 500;
}
</style>