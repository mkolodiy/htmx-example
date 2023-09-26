import { HtmlEscapedString } from 'hono/utils/html';

export type Children =
  | Array<HtmlEscapedString>
  | HtmlEscapedString
  | string
  | null;
