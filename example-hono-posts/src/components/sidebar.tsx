import clsx from 'clsx';
import type { Post } from '../api/posts';

export function Sidebar(props: { posts: Array<Post>; activePostId?: string }) {
  let postUI = null;
  if (props.posts.length === 0) {
    postUI = <EmptySidebarEntries message="No posts present" />;
  } else {
    postUI = (
      <SidebarEntries posts={props.posts} activePostId={props.activePostId} />
    );
  }

  return (
    <div class="w-80 flex flex-col gap-2 shadow bg-slate-50">
      <div class="p-4 pb-0 flex flex-col gap-2">
        <div class="join flex">
          <input
            id="searchInput"
            name="searchTerm"
            type="search"
            placeholder="Search posts..."
            class="input input-bordered join-item flex-1"
            hx-post="/fragment/search"
            hx-trigger="search, execute-search from:body"
            hx-target="#sidebarEntries"
            hx-swap="outerHTML"
          />
          <button
            class="btn join-item bg-white"
            onclick="htmx.trigger('#searchInput', 'execute-search')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="1em"
              viewBox="0 0 512 512"
            >
              {/* Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. */}
              <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" />
            </svg>
          </button>
        </div>
        <a class="btn bg-white normal-case" href="/posts/add">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="1em"
            viewBox="0 0 448 512"
          >
            {/* Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. */}
            <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z" />
          </svg>
          New
        </a>
      </div>
      {postUI}
    </div>
  );
}

export function EmptySidebarEntries(props: { message: string }) {
  return (
    <div id="sidebarEntries" class="pt-0 p-4 flex flex-col gap-2">
      <p>{props.message}</p>
    </div>
  );
}

export function SidebarEntries(props: {
  posts: Array<Post>;
  activePostId?: string;
}) {
  return (
    <div id="sidebarEntries" class="pt-0 p-4 flex flex-col gap-2">
      {props.posts.map((post) => (
        <SidebarEntry post={post} isSelected={post.id === props.activePostId} />
      ))}
    </div>
  );
}

function SidebarEntry(props: { post: Post; isSelected: boolean }) {
  const classes = clsx(
    'btn justify-start normal-case',
    props.isSelected ? '' : 'btn-ghost'
  );

  return (
    <a href={`/posts/${props.post.id}`} class={classes}>
      {props.post.title}
    </a>
  );
}
