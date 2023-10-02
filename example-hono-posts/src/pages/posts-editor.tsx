import { Hono } from 'hono';
import { getPosts } from '../api/posts';
import { Base } from '../components/base';
import { EmptyPost } from '../components/post';
import { Sidebar } from '../components/sidebar';

export const postsEditor = new Hono().get('/posts', async (c) => {
  const posts = await getPosts();
  return c.html(
    <Base>
      <Sidebar posts={posts} />
      <EmptyPost message="No post selected" />
    </Base>
  );
});
