
import { Fragment, jsx } from 'hono/jsx';
import { Person } from '.';

export function Person(props: { person: Person }) {
  return (
    <Fragment>
      <div id="no-persons"></div>
      <div id="persons">
        <div>
          <p>Name: {props.person.name}</p>
          <p>Description: {props.person.description}</p>
        </div>
        <div class="divider"></div>
      </div>
    </Fragment>
  );
}
