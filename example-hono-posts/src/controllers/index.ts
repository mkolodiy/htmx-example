import { Hono } from 'hono';
import { posts } from './posts';
import { fragments } from './fragments';
import { validations } from './validations';

export const controllers = new Hono()
  .route('/', posts)
  .route('/', validations)
  .route('/', fragments);
