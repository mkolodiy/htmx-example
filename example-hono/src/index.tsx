import { serve } from '@hono/node-server';
import { Hono } from 'hono';

import { Base } from './base';
import { Home } from './home';
import { Person } from './person';

export type Person = {
  name: string;
  description: string;
};

const persons: Array<Person> = [
  {
    name: 'John Doe',
    description: 'Test',
  },
  {
    name: 'Bob Williams',
    description: 'Test',
  },
];

const app = new Hono();

app.get('/', (c) =>
  c.html(
    <Base>
      <Home persons={persons} />
    </Base>
  )
);

app.post('/form', async (c) => {
  const body = await c.req.parseBody<Person>();
  return c.html(<Person person={body} />);
});

serve(app);
