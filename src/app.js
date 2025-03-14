import { Hono } from 'hono';
import movies from './routes/movies';
const app = new Hono();
app.route('/movies', movies);
export default app;
