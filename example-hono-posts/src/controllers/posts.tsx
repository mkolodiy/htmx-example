import { Hono } from 'hono';
import {
  Comment,
  Post,
  createComment,
  createPost,
  deletePost,
  updatePost,
} from '../api/posts';
import { commentSuite, postSuite } from '../suite';
import {
  Comment as CommentComp,
  CommentMessageTextarea,
  CreatePost,
  FormErrors,
  PostDescriptionInput,
  PostTitleInput,
} from '../components/post';

export const posts = new Hono()
  .post('/posts/add', async (c) => {
    const body = await c.req.parseBody<Omit<Post, 'id'>>();

    const validationResult = postSuite(body);
    if (validationResult.isValid()) {
      const id = await createPost(body);
      c.header('HX-Location', `/posts/${id}`);
      return c.text('ok');
    } else {
      const titleErrors = validationResult.getErrors('title');
      const descriptionErrors = validationResult.getErrors('description');
      return c.html(
        <CreatePost
          title="Create a new post"
          action="/posts/add"
          cancelHref="/posts"
        >
          <PostTitleInput
            title={body.title}
            errors={titleErrors ? <FormErrors errors={titleErrors} /> : null}
          />
          <PostDescriptionInput
            description={body.description}
            errors={
              descriptionErrors ? (
                <FormErrors errors={descriptionErrors} />
              ) : null
            }
          />
        </CreatePost>
      );
    }
  })
  .post('/posts/:id/edit', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.parseBody<Omit<Post, 'id'>>();

    const validationResult = postSuite(body);
    if (validationResult.isValid()) {
      await updatePost({ id, ...body });
      c.header('HX-Location', `/posts/${id}`);
      return c.text('ok');
    } else {
      const titleErrors = validationResult.getErrors('title');
      const descriptionErrors = validationResult.getErrors('description');
      return c.html(
        <CreatePost
          title="Edit post"
          action={`/posts/${id}/edit`}
          cancelHref={`/posts/${id}`}
        >
          <PostTitleInput
            title={body.title}
            errors={titleErrors ? <FormErrors errors={titleErrors} /> : null}
          />
          <PostDescriptionInput
            description={body.description}
            errors={
              descriptionErrors ? (
                <FormErrors errors={descriptionErrors} />
              ) : null
            }
          />
        </CreatePost>
      );
    }
  })
  .delete('/posts/:id', async (c) => {
    const id = c.req.param('id');
    await deletePost(id);
    c.header('HX-Location', '/posts');
    return c.text('ok');
  })
  .post('/posts/:id/comments', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.parseBody<Pick<Comment, 'message'>>();
    const validationResult = commentSuite(body);
    if (validationResult.isValid()) {
      const comment = await createComment({ postId: id, ...body });
      c.header('HX-Trigger', 'refresh-comment-message-textarea');
      return c.html(<CommentComp comment={comment} />);
    } else {
      const errors = validationResult.getErrors('message');
      c.header('HX-Reswap', 'outerHTML');
      c.header('HX-Retarget', '#comment-message-form-control');
      return c.html(
        <CommentMessageTextarea
          message={body.message}
          errors={<FormErrors errors={errors} />}
        />
      );
    }
  });
