import { db } from '../firebase/config'
import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    updateDoc,
    doc,
    deleteDoc
} from 'firebase/firestore'

export const MovieListService = {
    // Add a movie to either 'interested' or 'seen' list
    async addMovieToList(userId, movie, listType, rating = null) {
        try {
            // Check if movie already exists in any list
            const existingMovie = await this.checkMovieInList(userId, movie.id)
            if (existingMovie) {
                // If it exists, update its listType
                const movieRef = doc(db, 'movieLists', existingMovie.id)
                await updateDoc(movieRef, {
                    listType,
                    rating: listType === 'seen' ? rating : null,
                })
                return existingMovie.id
            }

            const movieData = {
                userId,
                movieId: movie.id,
                title: movie.title,
                poster_path: movie.poster_path,
                listType, // 'interested' or 'seen'
                rating: listType === 'seen' ? rating : null,
                addedAt: new Date()
            }

            const docRef = await addDoc(collection(db, 'movieLists'), movieData)
            return docRef.id
        } catch (error) {
            console.error('Error adding movie to list:', error)
            throw error
        }
    },

    // Check if a movie is in user's list
    async checkMovieInList(userId, movieId) {
        try {
            const q = query(
                collection(db, 'movieLists'),
                where('userId', '==', userId),
                where('movieId', '==', movieId)
            )

            const querySnapshot = await getDocs(q)
            if (querySnapshot.empty) return null

            const doc = querySnapshot.docs[0]
            return {
                id: doc.id,
                ...doc.data()
            }
        } catch (error) {
            console.error('Error checking movie in list:', error)
            throw error
        }
    },

    // Get user's movies by list type
    async getUserMovies(userId, listType) {
        try {
            const q = query(
                collection(db, 'movieLists'),
                where('userId', '==', userId),
                where('listType', '==', listType)
            )

            const querySnapshot = await getDocs(q)
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
        } catch (error) {
            console.error('Error getting user movies:', error)
            throw error
        }
    },

    // Update movie rating
    async updateMovieRating(movieListId, rating) {
        try {
            const movieRef = doc(db, 'movieLists', movieListId)
            await updateDoc(movieRef, {
                rating
            })
        } catch (error) {
            console.error('Error updating movie rating:', error)
            throw error
        }
    },

    // Remove movie from list
    async removeFromList(movieListId) {
        try {
            await deleteDoc(doc(db, 'movieLists', movieListId))
        } catch (error) {
            console.error('Error removing movie from list:', error)
            throw error
        }
    }
} 