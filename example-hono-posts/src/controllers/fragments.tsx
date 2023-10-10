import { Hono } from 'hono';
import { searchPosts } from '../api/posts';
import { EmptySidebarEntries, SidebarEntries } from '../components/sidebar';
import { CommentMessageTextarea } from '../components/post';

export const fragments = new Hono()
  .post('/fragment/search', async (c) => {
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
  })
  .get('/fragment/comment-message-textarea', (c) => {
    return c.html(<CommentMessageTextarea />);
  });
