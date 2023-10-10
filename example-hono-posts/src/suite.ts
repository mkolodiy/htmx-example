import { staticSuite, test, enforce } from 'vest';
import { Comment, Post } from './api/posts';

type FieldName = 'title' | 'description';

export const postSuite = staticSuite<FieldName>(
  (
    data: Pick<Post, 'title' | 'description'> = { title: '', description: '' }
  ) => {
    test('title', 'Title is required', () => {
      enforce(data.title).isNotBlank();
    });

    test('title', 'Title must be at lease 6 characters', () => {
      enforce(data.title).longerThanOrEquals(6);
    });

    test('description', 'Description is required', () => {
      enforce(data.description).isNotBlank();
    });
  }
);

export const commentSuite = staticSuite<'message'>(
  (data: Pick<Comment, 'message'> = { message: '' }) => {
    test('message', 'Message is required', () => {
      enforce(data.message).isNotBlank();
    });
  }
);
