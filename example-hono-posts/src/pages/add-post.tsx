import { Hono } from 'hono';
import { getPosts } from '../api/posts';
import { Base } from '../components/base';
import {
  CreatePost,
  PostDescriptionInput,
  PostTitleInput,
} from '../components/post';
import { Sidebar } from '../components/sidebar';

export const addPost = new Hono().get('/posts/add', async (c) => {
  const posts = await getPosts();
  return c.html(
    <Base>
      <Sidebar posts={posts} />
      <CreatePost
        title="Create a new post"
        action="/posts/add"
        cancelHref="/posts"
      >
        <PostTitleInput />
        <PostDescriptionInput />
      </CreatePost>
    </Base>
  );
});
