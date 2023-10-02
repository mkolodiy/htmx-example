import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';
import { Base } from './components/base';
import {
  EmptySidebarEntries,
  Sidebar,
  SidebarEntries,
} from './components/sidebar';
import {
  Comment as CommentComp,
  Comments,
  CreatePost,
  EmptyPost,
  Post as PostComp,
} from './components/post';
import {
  type Post,
  getComments,
  getPost,
  getPosts,
  searchPosts,
  createPost,
  deletePost,
  type Comment,
  createComment,
  updatePost,
} from './api/posts';
import { suite } from './suite';
import { pages } from './pages';
import { controllers } from './controllers';

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
