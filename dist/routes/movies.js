"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const zod_1 = require("zod");
const movies = new hono_1.Hono();
const movieSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    director: zod_1.z.string(),
    releaseYear: zod_1.z.number(),
    genre: zod_1.z.string(),
});
const moviesDB = [];
// Add a new movie
movies.post('/', (c) => __awaiter(void 0, void 0, void 0, function* () {
    const body = yield c.req.json();
    const validation = movieSchema.safeParse(body);
    if (!validation.success) {
        return c.json({ error: 'Invalid movie data' }, 400);
    }
    moviesDB.push(Object.assign(Object.assign({}, body), { ratings: [] }));
    return c.json({ message: 'Movie added successfully' }, 201);
}));
// Update a movie partially
movies.patch('/:id', (c) => __awaiter(void 0, void 0, void 0, function* () {
    const id = c.req.param('id');
    const body = yield c.req.json();
    const movie = moviesDB.find((m) => m.id === id);
    if (!movie)
        return c.json({ error: 'Movie not found' }, 404);
    Object.assign(movie, body);
    return c.json({ message: 'Movie updated successfully' });
}));
// Get a movie by ID
movies.get('/:id', (c) => {
    const id = c.req.param('id');
    const movie = moviesDB.find((m) => m.id === id);
    if (!movie)
        return c.json({ error: 'Movie not found' }, 404);
    return c.json(movie);
});
// Delete a movie
movies.delete('/:id', (c) => {
    const id = c.req.param('id');
    const index = moviesDB.findIndex((m) => m.id === id);
    if (index === -1)
        return c.json({ error: 'Movie not found' }, 404);
    moviesDB.splice(index, 1);
    return c.json({ message: 'Movie deleted successfully' });
});
// Rate a movie
movies.post('/:id/rating', (c) => __awaiter(void 0, void 0, void 0, function* () {
    const id = c.req.param('id');
    const body = yield c.req.json();
    const rating = body.rating;
    if (rating < 1 || rating > 5) {
        return c.json({ error: 'Rating must be between 1 and 5' }, 400);
    }
    const movie = moviesDB.find((m) => m.id === id);
    if (!movie)
        return c.json({ error: 'Movie not found' }, 404);
    movie.ratings.push(rating);
    return c.json({ message: 'Rating added successfully' });
}));
// Get average rating
movies.get('/:id/rating', (c) => {
    const id = c.req.param('id');
    const movie = moviesDB.find((m) => m.id === id);
    if (!movie)
        return c.json({ error: 'Movie not found' }, 404);
    if (movie.ratings.length === 0)
        return new Response('message: No ratings yet', { status: 204 });
    const avgRating = movie.ratings.reduce((a, b) => a + b, 0) / movie.ratings.length;
    return c.json({ averageRating: avgRating.toFixed(2) });
});
// Get top-rated movies
movies.get('/top-rated', (c) => {
    const topMovies = [...moviesDB]
        .filter((m) => m.ratings.length > 0)
        .sort((a, b) => {
        const avgA = a.ratings.reduce((x, y) => x + y, 0) / a.ratings.length;
        const avgB = b.ratings.reduce((x, y) => x + y, 0) / b.ratings.length;
        return avgB - avgA;
    });
    return topMovies.length ? c.json(topMovies) : c.json({ error: 'No movies found' }, 404);
});
// Get movies by genre
movies.get('/genre/:genre', (c) => {
    const genre = c.req.param('genre');
    const filtered = moviesDB.filter((m) => m.genre.toLowerCase() === genre.toLowerCase());
    return filtered.length ? c.json(filtered) : c.json({ error: 'No movies found' }, 404);
});
// Get movies by director
movies.get('/director/:director', (c) => {
    const director = c.req.param('director');
    const filtered = moviesDB.filter((m) => m.director.toLowerCase() === director.toLowerCase());
    return filtered.length ? c.json(filtered) : c.json({ error: 'No movies found' }, 404);
});
// Search movies by title
movies.get('/search', (c) => {
    const keyword = c.req.query('keyword') || '';
    const filtered = moviesDB.filter((m) => m.title.toLowerCase().includes(keyword.toLowerCase()));
    return filtered.length ? c.json(filtered) : c.json({ error: 'No movies found' }, 404);
});
exports.default = movies;
