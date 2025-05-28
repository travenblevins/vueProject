<template>
    <div class="movie-container">
        <header>
            <h1>Movie Explorer</h1>
            <div class="search-container">
                <input type="text" v-model="searchQuery" @input="handleSearch" placeholder="Search movies..."
                    class="search-input" />
            </div>
            <div class="user-info">
                <router-link to="/my-lists" class="my-lists-btn">My Lists</router-link>
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
                    <div class="movie-actions">
                        <button @click="toggleInterested(movie)" :class="['action-btn', 'interested',
                            movieStates[movie.id]?.listType === 'interested' ? 'active' : '']">
                            {{ movieStates[movie.id]?.listType === 'interested' ? 'Uninterested' : 'Interested' }}
                        </button>
                        <button @click="toggleWatched(movie)" :class="['action-btn', 'seen',
                            movieStates[movie.id]?.listType === 'seen' ? 'active' : '']">
                            {{ movieStates[movie.id]?.listType === 'seen' ? 'Watched' : 'Watch' }}
                        </button>
                    </div>
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
import { useRouter } from 'vue-router'
import { environment } from '../config/environment'
import { MovieListService } from '../services/movieList'
import { user, logout } from '../firebase/auth'

const API_KEY = environment.tmdb.apiKey
const BASE_URL = environment.tmdb.baseUrl

export default {
    name: 'MovieComponent',
    setup() {
        const router = useRouter()

        const movies = ref([])
        const loading = ref(true)
        const error = ref(null)
        const searchQuery = ref('')
        const currentPage = ref(1)
        const searchTimeout = ref(null)
        const movieStates = ref({})

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

                // Check movie states for all fetched movies
                await Promise.all(movies.value.map(async (movie) => {
                    const state = await MovieListService.checkMovieInList(user.value.uid, movie.id)
                    if (state) {
                        movieStates.value[movie.id] = state
                    }
                }))
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

        const toggleInterested = async (movie) => {
            try {
                const currentState = movieStates.value[movie.id]
                if (currentState?.listType === 'interested') {
                    await MovieListService.removeFromList(currentState.id)
                    delete movieStates.value[movie.id]
                } else {
                    const docId = await MovieListService.addMovieToList(user.value.uid, movie, 'interested')
                    movieStates.value[movie.id] = {
                        id: docId,
                        listType: 'interested'
                    }
                }
            } catch (error) {
                console.error('Error toggling interested state:', error)
                alert('Failed to update movie status. Please try again.')
            }
        }

        const toggleWatched = async (movie) => {
            try {
                const currentState = movieStates.value[movie.id]
                if (currentState?.listType === 'seen') {
                    await MovieListService.removeFromList(currentState.id)
                    delete movieStates.value[movie.id]
                } else {
                    const docId = await MovieListService.addMovieToList(user.value.uid, movie, 'seen')
                    movieStates.value[movie.id] = {
                        id: docId,
                        listType: 'seen'
                    }
                }
            } catch (error) {
                console.error('Error toggling watched state:', error)
                alert('Failed to update movie status. Please try again.')
            }
        }

        onMounted(() => {
            if (user.value) {
                fetchMovies()
            }
        })

        return {
            movies,
            loading,
            error,
            searchQuery,
            currentPage,
            user,
            movieStates,
            handleSearch,
            changePage,
            handleLogout,
            toggleInterested,
            toggleWatched
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

.movie-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
}

.action-btn {
    flex: 1;
    padding: 0.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.2s;
}

.action-btn.interested {
    background-color: #3b82f6;
    color: white;
}

.action-btn.interested:hover {
    background-color: #2563eb;
}

.action-btn.interested.active {
    background-color: #dc2626;
}

.action-btn.interested.active:hover {
    background-color: #b91c1c;
}

.action-btn.seen {
    background-color: #10b981;
    color: white;
}

.action-btn.seen:hover {
    background-color: #059669;
}

.action-btn.seen.active {
    background-color: #6366f1;
}

.action-btn.seen.active:hover {
    background-color: #4f46e5;
}

.my-lists-btn {
    padding: 0.5rem 1rem;
    background: #8b5cf6;
    color: white;
    text-decoration: none;
    border-radius: 6px;
    transition: background-color 0.2s;
}

.my-lists-btn:hover {
    background: #7c3aed;
}
</style>