import { html } from 'hono/html';
import type { Children } from '../types';

type Props = {
  children: Children;
};

export function Base(props: Props) {
  return html`
    <!DOCTYPE html>
    <html lang="en" class="h-full">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Posts</title>
        <link href="/static/output.css" rel="stylesheet" />
        <script src="/static/htmx.min.js"></script>
      </head>
      <body class="h-full flex flex-col">
        <header class="bg-slate-100 shadow pt-2 pb-2 p-4 z-10">
          <nav>
            <a class="btn btn-ghost btn-sm normal-case text-base" href="/"
              >Posts</a
            >
            <a class="btn btn-ghost btn-sm normal-case text-base" href="/posts"
              >Editor</a
            >
          </nav>
        </header>
        <main class="flex-1 flex z-0">${props.children}</main>
        <script src="/static/client.js" type="module"></script>
      </body>
    </html>
  `;
}
