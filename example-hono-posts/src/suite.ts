import { staticSuite, test, enforce } from 'vest';
import { Post } from './api/posts';

type FieldName = 'title' | 'description';

export const suite = staticSuite<FieldName>(
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
