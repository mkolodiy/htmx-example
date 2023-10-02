import { Hono } from 'hono';
import { getPost, getPosts } from '../api/posts';
import { Base } from '../components/base';
import {
  CreatePost,
  EmptyPost,
  PostDescriptionInput,
  PostTitleInput,
} from '../components/post';
import { Sidebar } from '../components/sidebar';

export const editPost = new Hono().get('/posts/:id/edit', async (c) => {
  const id = c.req.param('id');
  const post = await getPost(id);
  const posts = await getPosts();
  if (post) {
    return c.html(
      <Base>
        <Sidebar posts={posts} activePostId={id} />
        <CreatePost
          title="Edit post"
          action={`/posts/${id}/edit`}
          cancelHref={`/posts/${id}`}
        >
          <PostTitleInput title={post?.title} />
          <PostDescriptionInput description={post?.description} />
        </CreatePost>
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
