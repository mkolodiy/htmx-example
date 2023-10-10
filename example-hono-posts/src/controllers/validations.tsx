import { Hono } from 'hono';
import { Post } from '../api/posts';
import { postSuite } from '../suite';
import {
  FormErrors,
  PostDescriptionInput,
  PostTitleInput,
} from '../components/post';

export const validations = new Hono()
  .post('/posts/validate/title', async (c) => {
    const body = await c.req.parseBody<Pick<Post, 'title'>>();

    const validationResult = postSuite(body);

    if (validationResult.isValid('title')) {
      return c.html(<PostTitleInput title={body.title} />);
    } else {
      const errors = validationResult.getErrors('title');
      return c.html(
        <PostTitleInput
          title={body.title}
          errors={<FormErrors errors={errors} />}
        />
      );
    }
  })
  .post('/posts/validate/description', async (c) => {
    const body = await c.req.parseBody<Pick<Post, 'description'>>();

    const validationResult = postSuite(body);

    if (validationResult.isValid('description')) {
      return c.html(<PostDescriptionInput description={body.description} />);
    } else {
      const errors = validationResult.getErrors('description');
      return c.html(
        <PostDescriptionInput
          description={body.description}
          errors={<FormErrors errors={errors} />}
        />
      );
    }
  });
