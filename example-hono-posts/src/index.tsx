import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { Base } from './components/base';
import { controllers } from './controllers';
import { pages } from './pages';

const app = new Hono();

app.use('/static/*', serveStatic({ root: './' }));

app.get('/static/output.css', serveStatic({ path: './src/assets/output.css' }));
app.get('/static/custom.css', serveStatic({ path: './src/assets/custom.css' }));
app.get(
  '/static/htmx.min.js',
  serveStatic({ path: './src/assets/htmx.min.js' })
);
app.get('/static/client.js', serveStatic({ path: './src/assets/client.js' }));

app.get('/', (c) => c.html(<Base>Todo</Base>));

app.route('/', pages);

app.route('/', controllers);

serve(app);
