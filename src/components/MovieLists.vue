<template>
    <div class="movie-lists">
        <div class="lists-container">
            <!-- Interested List -->
            <div class="list-section">
                <h2>Want to Watch</h2>
                <div class="movie-grid">
                    <div v-for="movie in interestedMovies" :key="movie.id" class="movie-card">
                        <img :src="getMoviePosterUrl(movie.poster_path)" :alt="movie.title">
                        <div class="movie-info">
                            <h3>{{ movie.title }}</h3>
                            <div class="actions">
                                <button @click="moveToSeen(movie)">Watched</button>
                                <button @click="removeMovie(movie.id)" class="remove">Remove</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Seen List -->
            <div class="list-section">
                <h2>Watched Movies</h2>
                <div class="movie-grid">
                    <div v-for="movie in seenMovies" :key="movie.id" class="movie-card">
                        <img :src="getMoviePosterUrl(movie.poster_path)" :alt="movie.title">
                        <div class="movie-info">
                            <h3>{{ movie.title }}</h3>
                            <div class="rating">
                                <span>Rating:</span>
                                <select v-model="movie.rating" @change="updateRating(movie)">
                                    <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
                                </select>
                            </div>
                            <button @click="removeMovie(movie.id)" class="remove">Remove</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { MovieListService } from '../services/movieList'
import { user } from '../firebase/auth'

export default {
    name: 'MovieLists',
    setup() {
        const interestedMovies = ref([])
        const seenMovies = ref([])

        const loadMovies = async () => {
            if (user.value) {
                interestedMovies.value = await MovieListService.getUserMovies(user.value.uid, 'interested')
                seenMovies.value = await MovieListService.getUserMovies(user.value.uid, 'seen')
            }
        }

        const moveToSeen = async (movie) => {
            await MovieListService.removeFromList(movie.id)
            await MovieListService.addMovieToList(user.value.uid, movie, 'seen')
            await loadMovies()
        }

        const updateRating = async (movie) => {
            await MovieListService.updateMovieRating(movie.id, movie.rating)
        }

        const removeMovie = async (movieId) => {
            await MovieListService.removeFromList(movieId)
            await loadMovies()
        }

        const getMoviePosterUrl = (posterPath) => {
            return `https://image.tmdb.org/t/p/w500${posterPath}`
        }

        onMounted(loadMovies)

        return {
            interestedMovies,
            seenMovies,
            moveToSeen,
            updateRating,
            removeMovie,
            getMoviePosterUrl
        }
    }
}
</script>

<style scoped>
.movie-lists {
    padding: 20px;
}

.lists-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
}

.list-section {
    background: #f5f5f5;
    padding: 20px;
    border-radius: 8px;
}

.movie-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
    margin-top: 20px;
}

.movie-card {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.movie-card img {
    width: 100%;
    height: 300px;
    object-fit: cover;
}

.movie-info {
    padding: 15px;
}

.movie-info h3 {
    margin: 0 0 10px 0;
    font-size: 1.1em;
}

.actions {
    display: flex;
    gap: 10px;
    margin-top: 10px;
}

.rating {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 10px 0;
}

button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    background: #4CAF50;
    color: white;
}

button.remove {
    background: #f44336;
}

select {
    padding: 5px;
    border-radius: 4px;
}
</style>