import { Hono } from 'hono';
import { postsEditor } from './posts-editor';
import { addPost } from './add-post';
import { editPost } from './edit-post';
import { post } from './post';

export const pages = new Hono()
  .route('/', postsEditor)
  .route('/', addPost)
  .route('/', editPost)
  .route('/', post);
