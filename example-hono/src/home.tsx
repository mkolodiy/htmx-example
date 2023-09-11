import { Fragment } from 'hono/jsx';
import { Person } from '.';

export function Home(props: { persons: Person[]; personsCount: number }) {
  return (
    <Fragment>
      <div class="card bg-base-100 p-2">
        <h1 class="mb-2 text-2xl font-medium">Add person</h1>
        <form
          hx-post="/form"
          hx-target="#persons"
          hx-swap="multi:#persons:afterbegin,#no-persons:delete"
          class="flex flex-col gap-2"
        >
          <input
            name="name"
            type="text"
            placeholder="Name"
            class="input input-bordered w-full"
          />
          <input
            name="description"
            type="text"
            placeholder="Description"
            class="input input-bordered w-full"
          />
          <button class="btn btn-primary">Submit</button>
        </form>
      </div>
      <div class="card bg-base-100 p-2">
        <h1 class="mb-2 text-2xl font-medium">
          <span>Persons</span>{' '}
          <span
            hx-get="/personsCount"
            hx-trigger="update-persons-count from:body"
            hx-swap="innerHTML"
          >
            {props.personsCount}
          </span>
        </h1>
        {props.persons.length === 0 ? (
          <div id="no-persons">No persons yet</div>
        ) : (
          <div id="persons">
            {props.persons.map((person, index) => (
              <Fragment>
                {index !== 0 ? <div class="divider"></div> : ''}
                <div>
                  <p>Name: {person.name}</p>
                  <p>Description: {person.description}</p>
                </div>
              </Fragment>
            ))}
          </div>
        )}
      </div>
    </Fragment>
  );
}
