import { Hono } from 'hono';
import { z } from 'zod';
const movies = new Hono();
const movieSchema = z.object({
    id: z.string(),
    title: z.string(),
    director: z.string(),
    releaseYear: z.number(),
    genre: z.string(),
});
const moviesDB = [];
// Add a new movie
movies.post('/', async (c) => {
    const body = await c.req.json();
    const validation = movieSchema.safeParse(body);
    if (!validation.success) {
        return c.json({ error: 'Invalid movie data' }, 400);
    }
    moviesDB.push({ ...body, ratings: [] });
    return c.json({ message: 'Movie added successfully' }, 201);
});
// Update a movie partially
movies.patch('/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    const movie = moviesDB.find((m) => m.id === id);
    if (!movie)
        return c.json({ error: 'Movie not found' }, 404);
    Object.assign(movie, body);
    return c.json({ message: 'Movie updated successfully' });
});
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
movies.post('/:id/rating', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    const rating = body.rating;
    if (rating < 1 || rating > 5) {
        return c.json({ error: 'Rating must be between 1 and 5' }, 400);
    }
    const movie = moviesDB.find((m) => m.id === id);
    if (!movie)
        return c.json({ error: 'Movie not found' }, 404);
    movie.ratings.push(rating);
    return c.json({ message: 'Rating added successfully' });
});
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
export default movies;
