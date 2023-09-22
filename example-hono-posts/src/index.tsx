import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';
import { Base } from './components/base';
import {
  EmptySidebarEntries,
  Sidebar,
  SidebarEntries,
} from './components/sidebar';
import { EmptyPost } from './components/empty-post';
import { getPosts, searchPosts } from './api/posts';

const app = new Hono();

app.use('/static/*', serveStatic({ root: './' }));

app.get('/static/output.css', serveStatic({ path: './src/assets/output.css' }));
app.get(
  '/static/htmx.min.js',
  serveStatic({ path: './src/assets/htmx.min.js' })
);

app.get('/', async (c) => {
  const posts = await getPosts();
  return c.html(
    <Base>
      <Sidebar posts={posts} />
      <EmptyPost />
    </Base>
  );
});

app.post('/fragment/search', async (c) => {
  const body = await c.req.parseBody<{ searchTerm: string }>();
  const result = await searchPosts(body.searchTerm);
  if (body.searchTerm === '' && result.length === 0) {
    return c.html(<EmptySidebarEntries message="No posts present" />);
  } else if (result.length === 0) {
    return c.html(
      <EmptySidebarEntries message={`No results for ${body.searchTerm}`} />
    );
  } else {
    return c.html(<SidebarEntries posts={result} />);
  }
});

serve(app);
