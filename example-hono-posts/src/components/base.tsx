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
        <main class="flex-1 flex">${props.children}</main>
      </body>
    </html>
  `;
}
