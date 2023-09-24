import type { Comment, Post, Post } from '../api/posts';
import type { Children } from '../types';

export function Post(props: { post: Post; children: Children }) {
  return (
    <div class="flex-1 p-4 flex gap-4 flex-col">
      <div class="flex gap-2">
        <h1 class="flex-1 text-2xl border-b-2 border-gray-100 border-solid">
          {props.post.title}
        </h1>
        <a class="btn normal-case" href={`/posts/${props.post.id}/edit`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="1em"
            viewBox="0 0 512 512"
          >
            {/* Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. */}
            <path d="M362.7 19.3L314.3 67.7 444.3 197.7l48.4-48.4c25-25 25-65.5 0-90.5L453.3 19.3c-25-25-65.5-25-90.5 0zm-71 71L58.6 323.5c-10.4 10.4-18 23.3-22.2 37.4L1 481.2C-1.5 489.7 .8 498.8 7 505s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L421.7 220.3 291.7 90.3z" />
          </svg>
          Edit
        </a>
        <button
          class="btn normal-case"
          hx-delete={`/posts/${props.post.id}`}
          hx-trigger="click"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="1em"
            viewBox="0 0 448 512"
          >
            {/* Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. */}
            <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z" />
          </svg>
          Delete
        </button>
      </div>
      <p>{props.post.description}</p>
      <div class="flex flex-col gap-2">
        <h2 class="text-xl border-b-2 border-gray-100 border-solid">
          Leave a comment
        </h2>
        <form
          hx-post={`/posts/${props.post.id}/comments`}
          hx-target="#comments"
          hx-swap="beforeend"
        >
          <textarea
            name="message"
            class="textarea textarea-bordered w-full"
            placeholder="Comment here..."
          ></textarea>
          <button type="submit" class="btn normal-case">
            Submit
          </button>
        </form>
        {props.children}
      </div>
    </div>
  );
}

export function EmptyPost(props: { message: string }) {
  return (
    <div class="flex-1 p-4">
      <div class="flex h-full items-center justify-center">{props.message}</div>
    </div>
  );
}

export function CreatePost(props: {
  title: string;
  post?: Pick<Post, 'title' | 'description'>;
  action: string;
  cancelHref: string;
}) {
  return (
    <div class="flex-1 p-4 flex flex-col gap-2">
      <h1 class="text-2xl">{props.title}</h1>
      <form class="flex flex-col gap-2" action={props.action} method="post">
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">Name</span>
          </label>
          <input
            value={props.post?.title || ''}
            type="text"
            name="title"
            placeholder="Add a post name..."
            class="input input-bordered"
          />
        </div>
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">Description</span>
          </label>
          <textarea
            name="description"
            class="textarea textarea-bordered"
            placeholder="Add a description..."
          >
            {props.post?.description || ''}
          </textarea>
        </div>
        <div class="flex gap-2">
          <button class="btn" type="submit">
            Save
          </button>
          <a class="btn" href={props.cancelHref}>
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}

export function Comments(props: { comments: Array<Comment> }) {
  return (
    <>
      <h2 class="text-xl border-b-2 border-gray-100 border-solid">Comments</h2>
      <div id="comments" class="flex flex-col gap-2">
        {props.comments.length > 0 ? (
          props.comments.map((comment) => <Comment comment={comment} />)
        ) : (
          <p>No comments present</p>
        )}
      </div>
    </>
  );
}

export function Comment(props: { comment: Comment }) {
  return (
    <p class="border-solid border-slate-100 border-2 rounded p-2 flex flex-col gap-2">
      <span>{props.comment.message}</span>
      <span class="self-end">
        {props.comment.createdAt.toLocaleDateString()}
      </span>
    </p>
  );
}
