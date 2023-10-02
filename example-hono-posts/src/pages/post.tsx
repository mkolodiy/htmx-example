import { Hono } from 'hono';
import { getPosts, getPost, getComments } from '../api/posts';
import { Base } from '../components/base';
import { Comments, EmptyPost, Post } from '../components/post';
import { Sidebar } from '../components/sidebar';

export const post = new Hono().get('/posts/:id', async (c) => {
  const id = c.req.param('id');
  const posts = await getPosts();
  const post = await getPost(id);
  const comments = await getComments(id);

  if (post) {
    return c.html(
      <Base>
        <Sidebar posts={posts} activePostId={id} />
        <Post post={post}>
          <Comments comments={comments} />
        </Post>
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
