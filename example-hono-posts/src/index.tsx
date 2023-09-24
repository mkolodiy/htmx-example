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

const app = new Hono();

app.use('/static/*', serveStatic({ root: './' }));

app.get('/static/output.css', serveStatic({ path: './src/assets/output.css' }));
app.get(
  '/static/htmx.min.js',
  serveStatic({ path: './src/assets/htmx.min.js' })
);

app.get('/', (c) => c.redirect('/posts'));

app.get('/posts', async (c) => {
  const posts = await getPosts();
  return c.html(
    <Base>
      <Sidebar posts={posts} />
      <EmptyPost message="No post selected" />
    </Base>
  );
});

app.get('/posts/add', async (c) => {
  const posts = await getPosts();
  return c.html(
    <Base>
      <Sidebar posts={posts} />
      <CreatePost
        title="Create a new post"
        action="/posts/add"
        cancelHref="/"
      />
    </Base>
  );
});

app.post('/posts/add', async (c) => {
  const body = await c.req.parseBody<Omit<Post, 'id'>>();
  const id = await createPost(body);
  return c.redirect(`/posts/${id}`);
});

app.get('/posts/:id/edit', async (c) => {
  const id = c.req.param('id');
  const post = await getPost(id);
  const posts = await getPosts();
  if (post) {
    return c.html(
      <Base>
        <Sidebar posts={posts} activePostId={id} />
        <CreatePost
          title="Edit post"
          post={{ title: post.title, description: post.description }}
          action={`/posts/${id}/edit`}
          cancelHref={`/posts/${id}`}
        />
      </Base>
    );
  }

  return c.html(
    <Base>
      <Sidebar posts={posts} />
      <EmptyPost message={`Post with id ${id} not present`} />
    </Base>
  );
});

app.post('/posts/:id/edit', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.parseBody<Omit<Post, 'id'>>();
  await updatePost({ id, ...body });
  return c.redirect(`/posts/${id}`);
});

app.get('/posts/:id', async (c) => {
  const id = c.req.param('id');
  const posts = await getPosts();
  const post = await getPost(id);
  const comments = await getComments(id);

  if (post) {
    return c.html(
      <Base>
        <Sidebar posts={posts} activePostId={id} />
        <PostComp post={post}>
          <Comments comments={comments} />
        </PostComp>
      </Base>
    );
  }

  return c.html(
    <Base>
      <Sidebar posts={posts} />
      <EmptyPost message={`Post with id ${id} not present`} />
    </Base>
  );
});

app.delete('/posts/:id', async (c) => {
  const id = c.req.param('id');
  await deletePost(id);
  c.header('HX-Redirect', '/');
  return c.text('ok');
});

app.post('/posts/:id/comments', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.parseBody<Pick<Comment, 'message'>>();
  const comment = await createComment({ postId: id, ...body });
  return c.html(<CommentComp comment={comment} />);
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
