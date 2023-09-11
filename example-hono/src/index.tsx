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
      <Home persons={persons} personsCount={persons.length} />
    </Base>
  )
);

app.get('/personsCount', (c) => {
  return c.text(persons.length.toString());
});

app.post('/form', async (c) => {
  const newPerson = await c.req.parseBody<Person>();

  persons.push(newPerson);

  c.header('HX-Trigger-After-Swap', 'update-persons-count');

  return c.html(<Person person={newPerson} />);
});

serve(app);
