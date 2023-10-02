"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/.pnpm/@hono+node-server@1.2.0/node_modules/@hono/node-server/dist/server.mjs
var import_node_http = require("node:http");

// node_modules/.pnpm/@hono+node-server@1.2.0/node_modules/@hono/node-server/dist/listener.mjs
var import_node_stream = require("node:stream");
var import_promises = require("node:stream/promises");

// node_modules/.pnpm/@hono+node-server@1.2.0/node_modules/@hono/node-server/dist/globals.mjs
var import_node_crypto = __toESM(require("node:crypto"), 1);
var webFetch = global.fetch;
if (typeof global.crypto === "undefined") {
  global.crypto = import_node_crypto.default;
}
global.fetch = (info, init) => {
  init = {
    // Disable compression handling so people can return the result of a fetch
    // directly in the loader without messing with the Content-Encoding header.
    compress: false,
    ...init
  };
  return webFetch(info, init);
};

// node_modules/.pnpm/@hono+node-server@1.2.0/node_modules/@hono/node-server/dist/listener.mjs
var getRequestListener = (fetchCallback) => {
  return async (incoming, outgoing) => {
    const method = incoming.method || "GET";
    const url = `http://${incoming.headers.host}${incoming.url}`;
    const headerRecord = [];
    const len = incoming.rawHeaders.length;
    for (let i2 = 0; i2 < len; i2 += 2) {
      headerRecord.push([incoming.rawHeaders[i2], incoming.rawHeaders[i2 + 1]]);
    }
    const init = {
      method,
      headers: headerRecord
    };
    if (!(method === "GET" || method === "HEAD")) {
      init.body = import_node_stream.Readable.toWeb(incoming);
      init.duplex = "half";
    }
    let res;
    try {
      res = await fetchCallback(new Request(url.toString(), init));
    } catch (e3) {
      res = new Response(null, { status: 500 });
      if (e3 instanceof Error) {
        if (e3.name === "TimeoutError" || e3.constructor.name === "TimeoutError") {
          res = new Response(null, { status: 504 });
        }
      }
    }
    const contentType = res.headers.get("content-type") || "";
    const buffering = res.headers.get("x-accel-buffering") || "";
    const contentEncoding = res.headers.get("content-encoding");
    const contentLength = res.headers.get("content-length");
    const transferEncoding = res.headers.get("transfer-encoding");
    for (const [k5, v3] of res.headers) {
      if (k5 === "set-cookie") {
        outgoing.setHeader(k5, res.headers.getSetCookie(k5));
      } else {
        outgoing.setHeader(k5, v3);
      }
    }
    outgoing.statusCode = res.status;
    if (res.body) {
      try {
        if (contentEncoding || transferEncoding || contentLength || /^no$/i.test(buffering) || !/^(application\/json\b|text\/(?!event-stream\b))/i.test(contentType)) {
          await (0, import_promises.pipeline)(import_node_stream.Readable.fromWeb(res.body), outgoing);
        } else {
          const text = await res.text();
          outgoing.setHeader("Content-Length", Buffer.byteLength(text));
          outgoing.end(text);
        }
      } catch (e3) {
        const err = e3 instanceof Error ? e3 : new Error("unknown error", { cause: e3 });
        if (err.code === "ERR_STREAM_PREMATURE_CLOSE") {
          console.info("The user aborted a request.");
        } else {
          console.error(e3);
          outgoing.destroy(err);
        }
      }
    } else {
      outgoing.end();
    }
  };
};

// node_modules/.pnpm/@hono+node-server@1.2.0/node_modules/@hono/node-server/dist/server.mjs
var createAdaptorServer = (options) => {
  const fetchCallback = options.fetch;
  const requestListener = getRequestListener(fetchCallback);
  const createServer = options.createServer || import_node_http.createServer;
  const server = createServer(options.serverOptions || {}, requestListener);
  return server;
};
var serve = (options, listeningListener) => {
  const server = createAdaptorServer(options);
  server.listen(options?.port ?? 3e3, options.hostname ?? "0.0.0.0", () => {
    const serverInfo = server.address();
    listeningListener && listeningListener(serverInfo);
  });
  return server;
};

// node_modules/.pnpm/hono@3.6.3/node_modules/hono/dist/types.js
var FetchEventLike = class {
};

// node_modules/.pnpm/hono@3.6.3/node_modules/hono/dist/utils/url.js
var splitPath = (path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
};
var splitRoutingPath = (path) => {
  const groups = [];
  for (let i2 = 0; ; ) {
    let replaced = false;
    path = path.replace(/\{[^}]+\}/g, (m3) => {
      const mark = `@\\${i2}`;
      groups[i2] = [mark, m3];
      i2++;
      replaced = true;
      return mark;
    });
    if (!replaced) {
      break;
    }
  }
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  for (let i2 = groups.length - 1; i2 >= 0; i2--) {
    const [mark] = groups[i2];
    for (let j5 = paths.length - 1; j5 >= 0; j5--) {
      if (paths[j5].indexOf(mark) !== -1) {
        paths[j5] = paths[j5].replace(mark, groups[i2][1]);
        break;
      }
    }
  }
  return paths;
};
var patternCache = {};
var getPattern = (label) => {
  if (label === "*") {
    return "*";
  }
  const match = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match) {
    if (!patternCache[label]) {
      if (match[2]) {
        patternCache[label] = [label, match[1], new RegExp("^" + match[2] + "$")];
      } else {
        patternCache[label] = [label, match[1], true];
      }
    }
    return patternCache[label];
  }
  return null;
};
var getPath = (request) => {
  const match = request.url.match(/^https?:\/\/[^/]+(\/[^?]*)/);
  return match ? match[1] : "";
};
var getQueryStrings = (url) => {
  const queryIndex = url.indexOf("?", 8);
  return queryIndex === -1 ? "" : "?" + url.slice(queryIndex + 1);
};
var getPathNoStrict = (request) => {
  const result = getPath(request);
  return result.length > 1 && result[result.length - 1] === "/" ? result.slice(0, -1) : result;
};
var mergePath = (...paths) => {
  let p3 = "";
  let endsWithSlash = false;
  for (let path of paths) {
    if (p3[p3.length - 1] === "/") {
      p3 = p3.slice(0, -1);
      endsWithSlash = true;
    }
    if (path[0] !== "/") {
      path = `/${path}`;
    }
    if (path === "/" && endsWithSlash) {
      p3 = `${p3}/`;
    } else if (path !== "/") {
      p3 = `${p3}${path}`;
    }
    if (path === "/" && p3 === "") {
      p3 = "/";
    }
  }
  return p3;
};
var checkOptionalParameter = (path) => {
  const match = path.match(/^(.+|)(\/\:[^\/]+)\?$/);
  if (!match)
    return null;
  const base = match[1];
  const optional = base + match[2];
  return [base === "" ? "/" : base.replace(/\/$/, ""), optional];
};
var _decodeURI = (value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return /%/.test(value) ? decodeURIComponent_(value) : value;
};
var _getQueryParam = (url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf(`?${key}`, 8);
    if (keyIndex2 === -1) {
      keyIndex2 = url.indexOf(`&${key}`, 8);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ?? (encoded = /[%+]/.test(url));
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      ;
      (results[name] ?? (results[name] = [])).push(value);
    } else {
      results[name] ?? (results[name] = value);
    }
  }
  return key ? results[key] : results;
};
var getQueryParam = _getQueryParam;
var getQueryParams = (url, key) => {
  return _getQueryParam(url, key, true);
};
var decodeURIComponent_ = decodeURIComponent;

// node_modules/.pnpm/hono@3.6.3/node_modules/hono/dist/utils/cookie.js
var validCookieNameRegEx = /^[\w!#$%&'*.^`|~+-]+$/;
var validCookieValueRegEx = /^[ !#-:<-[\]-~]*$/;
var parse = (cookie, name) => {
  const pairs = cookie.trim().split(";");
  return pairs.reduce((parsedCookie, pairStr) => {
    pairStr = pairStr.trim();
    const valueStartPos = pairStr.indexOf("=");
    if (valueStartPos === -1)
      return parsedCookie;
    const cookieName = pairStr.substring(0, valueStartPos).trim();
    if (name && name !== cookieName || !validCookieNameRegEx.test(cookieName))
      return parsedCookie;
    let cookieValue = pairStr.substring(valueStartPos + 1).trim();
    if (cookieValue.startsWith('"') && cookieValue.endsWith('"'))
      cookieValue = cookieValue.slice(1, -1);
    if (validCookieValueRegEx.test(cookieValue))
      parsedCookie[cookieName] = decodeURIComponent_(cookieValue);
    return parsedCookie;
  }, {});
};
var _serialize = (name, value, opt = {}) => {
  let cookie = `${name}=${value}`;
  if (opt && typeof opt.maxAge === "number" && opt.maxAge >= 0) {
    cookie += `; Max-Age=${Math.floor(opt.maxAge)}`;
  }
  if (opt.domain) {
    cookie += "; Domain=" + opt.domain;
  }
  if (opt.path) {
    cookie += "; Path=" + opt.path;
  }
  if (opt.expires) {
    cookie += "; Expires=" + opt.expires.toUTCString();
  }
  if (opt.httpOnly) {
    cookie += "; HttpOnly";
  }
  if (opt.secure) {
    cookie += "; Secure";
  }
  if (opt.sameSite) {
    cookie += `; SameSite=${opt.sameSite}`;
  }
  return cookie;
};
var serialize = (name, value, opt = {}) => {
  value = encodeURIComponent(value);
  return _serialize(name, value, opt);
};

// node_modules/.pnpm/hono@3.6.3/node_modules/hono/dist/context.js
var Context = class {
  constructor(req, options) {
    this.env = {};
    this._var = {};
    this.finalized = false;
    this.error = void 0;
    this._status = 200;
    this._h = void 0;
    this._pH = void 0;
    this._init = true;
    this._renderer = (content) => this.html(content);
    this.notFoundHandler = () => new Response();
    this.render = (...args) => this._renderer(...args);
    this.setRenderer = (renderer) => {
      this._renderer = renderer;
    };
    this.header = (name, value, options2) => {
      if (value === void 0) {
        if (this._h) {
          this._h.delete(name);
        } else if (this._pH) {
          delete this._pH[name.toLocaleLowerCase()];
        }
        if (this.finalized) {
          this.res.headers.delete(name);
        }
        return;
      }
      if (options2?.append) {
        if (!this._h) {
          this._init = false;
          this._h = new Headers(this._pH);
          this._pH = {};
        }
        this._h.append(name, value);
      } else {
        if (this._h) {
          this._h.set(name, value);
        } else {
          this._pH ?? (this._pH = {});
          this._pH[name.toLowerCase()] = value;
        }
      }
      if (this.finalized) {
        if (options2?.append) {
          this.res.headers.append(name, value);
        } else {
          this.res.headers.set(name, value);
        }
      }
    };
    this.status = (status) => {
      this._status = status;
    };
    this.set = (key, value) => {
      this._var ?? (this._var = {});
      this._var[key] = value;
    };
    this.get = (key) => {
      return this._var ? this._var[key] : void 0;
    };
    this.newResponse = (data, arg, headers) => {
      if (this._init && !headers && !arg && this._status === 200) {
        return new Response(data, {
          headers: this._pH
        });
      }
      if (arg && typeof arg !== "number") {
        const res = new Response(data, arg);
        const contentType = this._pH?.["content-type"];
        if (contentType) {
          res.headers.set("content-type", contentType);
        }
        return res;
      }
      const status = arg ?? this._status;
      this._pH ?? (this._pH = {});
      this._h ?? (this._h = new Headers());
      for (const [k5, v3] of Object.entries(this._pH)) {
        this._h.set(k5, v3);
      }
      if (this._res) {
        this._res.headers.forEach((v3, k5) => {
          this._h?.set(k5, v3);
        });
        for (const [k5, v3] of Object.entries(this._pH)) {
          this._h.set(k5, v3);
        }
      }
      headers ?? (headers = {});
      for (const [k5, v3] of Object.entries(headers)) {
        if (typeof v3 === "string") {
          this._h.set(k5, v3);
        } else {
          this._h.delete(k5);
          for (const v22 of v3) {
            this._h.append(k5, v22);
          }
        }
      }
      return new Response(data, {
        status,
        headers: this._h
      });
    };
    this.body = (data, arg, headers) => {
      return typeof arg === "number" ? this.newResponse(data, arg, headers) : this.newResponse(data, arg);
    };
    this.text = (text, arg, headers) => {
      if (!this._pH) {
        if (this._init && !headers && !arg) {
          return new Response(text);
        }
        this._pH = {};
      }
      if (this._pH["content-type"]) {
        this._pH["content-type"] = "text/plain; charset=UTF-8";
      }
      return typeof arg === "number" ? this.newResponse(text, arg, headers) : this.newResponse(text, arg);
    };
    this.json = (object, arg, headers) => {
      const body = JSON.stringify(object);
      this._pH ?? (this._pH = {});
      this._pH["content-type"] = "application/json; charset=UTF-8";
      return typeof arg === "number" ? this.newResponse(body, arg, headers) : this.newResponse(body, arg);
    };
    this.jsonT = (object, arg, headers) => {
      const response = typeof arg === "number" ? this.json(object, arg, headers) : this.json(object, arg);
      return {
        response,
        data: object,
        format: "json",
        status: response.status
      };
    };
    this.html = (html2, arg, headers) => {
      this._pH ?? (this._pH = {});
      this._pH["content-type"] = "text/html; charset=UTF-8";
      return typeof arg === "number" ? this.newResponse(html2, arg, headers) : this.newResponse(html2, arg);
    };
    this.redirect = (location, status = 302) => {
      this._h ?? (this._h = new Headers());
      this._h.set("Location", location);
      return this.newResponse(null, status);
    };
    this.cookie = (name, value, opt) => {
      const cookie = serialize(name, value, opt);
      this.header("set-cookie", cookie, { append: true });
    };
    this.notFound = () => {
      return this.notFoundHandler(this);
    };
    this.req = req;
    if (options) {
      this._exCtx = options.executionCtx;
      this.env = options.env;
      if (options.notFoundHandler) {
        this.notFoundHandler = options.notFoundHandler;
      }
    }
  }
  get event() {
    if (this._exCtx instanceof FetchEventLike) {
      return this._exCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  get executionCtx() {
    if (this._exCtx) {
      return this._exCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  get res() {
    this._init = false;
    return this._res || (this._res = new Response("404 Not Found", { status: 404 }));
  }
  set res(_res) {
    this._init = false;
    if (this._res && _res) {
      this._res.headers.delete("content-type");
      this._res.headers.forEach((v3, k5) => {
        _res.headers.set(k5, v3);
      });
    }
    this._res = _res;
    this.finalized = true;
  }
  get var() {
    return { ...this._var };
  }
  get runtime() {
    const global2 = globalThis;
    if (global2?.Deno !== void 0) {
      return "deno";
    }
    if (global2?.Bun !== void 0) {
      return "bun";
    }
    if (typeof global2?.WebSocketPair === "function") {
      return "workerd";
    }
    if (typeof global2?.EdgeRuntime === "string") {
      return "edge-light";
    }
    if (global2?.fastly !== void 0) {
      return "fastly";
    }
    if (global2?.__lagon__ !== void 0) {
      return "lagon";
    }
    if (global2?.process?.release?.name === "node") {
      return "node";
    }
    return "other";
  }
};

// node_modules/.pnpm/hono@3.6.3/node_modules/hono/dist/compose.js
var compose = (middleware, onError, onNotFound) => {
  const middlewareLength = middleware.length;
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    function dispatch(i2) {
      if (i2 <= index) {
        throw new Error("next() called multiple times");
      }
      let handler = middleware[i2];
      index = i2;
      if (i2 === middlewareLength && next)
        handler = next;
      let res;
      let isError = false;
      if (!handler) {
        if (context instanceof Context && context.finalized === false && onNotFound) {
          res = onNotFound(context);
        }
      } else {
        try {
          res = handler(context, () => {
            const dispatchRes = dispatch(i2 + 1);
            return dispatchRes instanceof Promise ? dispatchRes : Promise.resolve(dispatchRes);
          });
        } catch (err) {
          if (err instanceof Error && context instanceof Context && onError) {
            context.error = err;
            res = onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      }
      if (!(res instanceof Promise)) {
        if (res !== void 0 && "response" in res) {
          res = res["response"];
        }
        if (res && (context.finalized === false || isError)) {
          context.res = res;
        }
        return context;
      } else {
        return res.then((res2) => {
          if (res2 !== void 0 && "response" in res2) {
            res2 = res2["response"];
          }
          if (res2 && context.finalized === false) {
            context.res = res2;
          }
          return context;
        }).catch(async (err) => {
          if (err instanceof Error && context instanceof Context && onError) {
            context.error = err;
            context.res = await onError(err, context);
            return context;
          }
          throw err;
        });
      }
    }
  };
};

// node_modules/.pnpm/hono@3.6.3/node_modules/hono/dist/http-exception.js
var HTTPException = class extends Error {
  constructor(status = 500, options) {
    super(options?.message);
    this.res = options?.res;
    this.status = status;
  }
  getResponse() {
    if (this.res) {
      return this.res;
    }
    return new Response(this.message, {
      status: this.status
    });
  }
};

// node_modules/.pnpm/hono@3.6.3/node_modules/hono/dist/utils/body.js
var parseBody = async (request) => {
  let body = {};
  const contentType = request.headers.get("Content-Type");
  if (contentType && (contentType.startsWith("multipart/form-data") || contentType.startsWith("application/x-www-form-urlencoded"))) {
    const formData = await request.formData();
    if (formData) {
      const form = {};
      formData.forEach((value, key) => {
        form[key] = value;
      });
      body = form;
    }
  }
  return body;
};

// node_modules/.pnpm/hono@3.6.3/node_modules/hono/dist/request.js
var HonoRequest = class {
  constructor(request, path = "/", paramData) {
    this.bodyCache = {};
    this.cachedBody = (key) => {
      const { bodyCache, raw: raw2 } = this;
      const cachedBody = bodyCache[key];
      if (cachedBody)
        return cachedBody;
      if (bodyCache.arrayBuffer) {
        return (async () => {
          return await new Response(bodyCache.arrayBuffer)[key]();
        })();
      }
      return bodyCache[key] = raw2[key]();
    };
    this.raw = request;
    this.path = path;
    this.paramData = paramData;
    this.vData = {};
  }
  param(key) {
    if (this.paramData) {
      if (key) {
        const param = this.paramData[key];
        return param ? /\%/.test(param) ? decodeURIComponent_(param) : param : void 0;
      } else {
        const decoded = {};
        for (const [key2, value] of Object.entries(this.paramData)) {
          if (value && typeof value === "string") {
            decoded[key2] = /\%/.test(value) ? decodeURIComponent_(value) : value;
          }
        }
        return decoded;
      }
    }
    return null;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name)
      return this.raw.headers.get(name.toLowerCase()) ?? void 0;
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  cookie(key) {
    const cookie = this.raw.headers.get("Cookie");
    if (!cookie)
      return;
    const obj = parse(cookie);
    if (key) {
      const value = obj[key];
      return value;
    } else {
      return obj;
    }
  }
  async parseBody() {
    if (this.bodyCache.parsedBody)
      return this.bodyCache.parsedBody;
    const parsedBody = await parseBody(this);
    this.bodyCache.parsedBody = parsedBody;
    return parsedBody;
  }
  json() {
    return this.cachedBody("json");
  }
  text() {
    return this.cachedBody("text");
  }
  arrayBuffer() {
    return this.cachedBody("arrayBuffer");
  }
  blob() {
    return this.cachedBody("blob");
  }
  formData() {
    return this.cachedBody("formData");
  }
  addValidatedData(target, data) {
    this.vData[target] = data;
  }
  valid(target) {
    return this.vData[target];
  }
  get url() {
    return this.raw.url;
  }
  get method() {
    return this.raw.method;
  }
  get headers() {
    return this.raw.headers;
  }
  get body() {
    return this.raw.body;
  }
  get bodyUsed() {
    return this.raw.bodyUsed;
  }
  get integrity() {
    return this.raw.integrity;
  }
  get keepalive() {
    return this.raw.keepalive;
  }
  get referrer() {
    return this.raw.referrer;
  }
  get signal() {
    return this.raw.signal;
  }
};

// node_modules/.pnpm/hono@3.6.3/node_modules/hono/dist/router.js
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var UnsupportedPathError = class extends Error {
};

// node_modules/.pnpm/hono@3.6.3/node_modules/hono/dist/hono-base.js
function defineDynamicClass() {
  return class {
  };
}
var notFoundHandler = (c3) => {
  return c3.text("404 Not Found", 404);
};
var errorHandler = (err, c3) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  console.trace(err);
  const message = "Internal Server Error";
  return c3.text(message, 500);
};
var Hono = class extends defineDynamicClass() {
  constructor(init = {}) {
    super();
    this._basePath = "/";
    this.path = "/";
    this.routes = [];
    this.notFoundHandler = notFoundHandler;
    this.errorHandler = errorHandler;
    this.head = () => {
      console.warn("`app.head()` is no longer used. `app.get()` implicitly handles the HEAD method.");
      return this;
    };
    this.handleEvent = (event) => {
      return this.dispatch(event.request, event, void 0, event.request.method);
    };
    this.fetch = (request, Env, executionCtx) => {
      return this.dispatch(request, executionCtx, Env, request.method);
    };
    this.request = (input, requestInit, Env, executionCtx) => {
      if (input instanceof Request) {
        if (requestInit !== void 0) {
          input = new Request(input, requestInit);
        }
        return this.fetch(input, Env, executionCtx);
      }
      input = input.toString();
      const path = /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`;
      const req = new Request(path, requestInit);
      return this.fetch(req, Env, executionCtx);
    };
    this.fire = () => {
      addEventListener("fetch", (event) => {
        event.respondWith(this.dispatch(event.request, event, void 0, event.request.method));
      });
    };
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.map((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.path = args1;
        } else {
          this.addRoute(method, this.path, args1);
        }
        args.map((handler) => {
          if (typeof handler !== "string") {
            this.addRoute(method, this.path, handler);
          }
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      if (!method)
        return this;
      this.path = path;
      for (const m3 of [method].flat()) {
        handlers.map((handler) => {
          this.addRoute(m3.toUpperCase(), this.path, handler);
        });
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.path = arg1;
      } else {
        handlers.unshift(arg1);
      }
      handlers.map((handler) => {
        this.addRoute(METHOD_NAME_ALL, this.path, handler);
      });
      return this;
    };
    const strict = init.strict ?? true;
    delete init.strict;
    Object.assign(this, init);
    this.getPath = strict ? init.getPath ?? getPath : getPathNoStrict;
  }
  clone() {
    const clone = new Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.routes = this.routes;
    return clone;
  }
  route(path, app2) {
    const subApp = this.basePath(path);
    if (!app2) {
      return subApp;
    }
    app2.routes.map((r3) => {
      const handler = app2.errorHandler === errorHandler ? r3.handler : async (c3, next) => (await compose([r3.handler], app2.errorHandler)(c3, next)).res;
      subApp.addRoute(r3.method, r3.path, handler);
    });
    return this;
  }
  basePath(path) {
    const subApp = this.clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  onError(handler) {
    this.errorHandler = handler;
    return this;
  }
  notFound(handler) {
    this.notFoundHandler = handler;
    return this;
  }
  showRoutes() {
    const length = 8;
    this.routes.map((route) => {
      console.log(
        `\x1B[32m${route.method}\x1B[0m ${" ".repeat(length - route.method.length)} ${route.path}`
      );
    });
  }
  mount(path, applicationHandler, optionHandler) {
    const mergedPath = mergePath(this._basePath, path);
    const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
    const handler = async (c3, next) => {
      let executionContext = void 0;
      try {
        executionContext = c3.executionCtx;
      } catch {
      }
      const options = optionHandler ? optionHandler(c3) : [c3.env, executionContext];
      const optionsArray = Array.isArray(options) ? options : [options];
      const queryStrings = getQueryStrings(c3.req.url);
      const res = await applicationHandler(
        new Request(
          new URL((c3.req.path.slice(pathPrefixLength) || "/") + queryStrings, c3.req.url),
          c3.req.raw
        ),
        ...optionsArray
      );
      if (res)
        return res;
      await next();
    };
    this.addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  get routerName() {
    this.matchRoute("GET", "/");
    return this.router.name;
  }
  addRoute(method, path, handler) {
    method = method.toUpperCase();
    if (this._basePath) {
      path = mergePath(this._basePath, path);
    }
    this.router.add(method, path, handler);
    const r3 = { path, method, handler };
    this.routes.push(r3);
  }
  matchRoute(method, path) {
    return this.router.match(method, path) || { handlers: [], params: {} };
  }
  handleError(err, c3) {
    if (err instanceof Error) {
      return this.errorHandler(err, c3);
    }
    throw err;
  }
  dispatch(request, executionCtx, env, method) {
    const path = this.getPath(request, { env });
    if (method === "HEAD") {
      return (async () => new Response(null, await this.dispatch(request, executionCtx, env, "GET")))();
    }
    const { handlers, params } = this.matchRoute(method, path);
    const c3 = new Context(new HonoRequest(request, path, params), {
      env,
      executionCtx,
      notFoundHandler: this.notFoundHandler
    });
    if (handlers.length === 1) {
      let res;
      try {
        res = handlers[0](c3, async () => {
        });
        if (!res) {
          return this.notFoundHandler(c3);
        }
      } catch (err) {
        return this.handleError(err, c3);
      }
      if (res.constructor.name === "Response")
        return res;
      if ("response" in res) {
        res = res.response;
      }
      if (res.constructor.name === "Response")
        return res;
      return (async () => {
        let awaited;
        try {
          awaited = await res;
          if (awaited !== void 0 && "response" in awaited) {
            awaited = awaited["response"];
          }
          if (!awaited) {
            return this.notFoundHandler(c3);
          }
        } catch (err) {
          return this.handleError(err, c3);
        }
        return awaited;
      })();
    }
    const composed = compose(handlers, this.errorHandler, this.notFoundHandler);
    return (async () => {
      try {
        const tmp = composed(c3);
        const context = tmp.constructor.name === "Promise" ? await tmp : tmp;
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. You may forget returning Response object or `await next()`"
          );
        }
        return context.res;
      } catch (err) {
        return this.handleError(err, c3);
      }
    })();
  }
};

// node_modules/.pnpm/hono@3.6.3/node_modules/hono/dist/router/reg-exp-router/node.js
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = Symbol();
function compareKey(a2, b3) {
  if (a2.length === 1) {
    return b3.length === 1 ? a2 < b3 ? -1 : 1 : -1;
  }
  if (b3.length === 1) {
    return 1;
  }
  if (a2 === ONLY_WILDCARD_REG_EXP_STR || a2 === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b3 === ONLY_WILDCARD_REG_EXP_STR || b3 === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a2 === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b3 === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a2.length === b3.length ? a2 < b3 ? -1 : 1 : b3.length - a2.length;
}
var Node = class {
  constructor() {
    this.children = {};
  }
  insert(tokens, index, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.index = index;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      const regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      node = this.children[regexpStr];
      if (!node) {
        if (Object.keys(this.children).some(
          (k5) => k5 !== ONLY_WILDCARD_REG_EXP_STR && k5 !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.children[regexpStr] = new Node();
        if (name !== "") {
          node.varIndex = context.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        if (paramMap.some((p3) => p3[0] === name)) {
          throw new Error("Duplicate param name");
        }
        paramMap.push([name, node.varIndex]);
      }
    } else {
      node = this.children[token];
      if (!node) {
        if (Object.keys(this.children).some(
          (k5) => k5.length > 1 && k5 !== ONLY_WILDCARD_REG_EXP_STR && k5 !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.children[token] = new Node();
      }
    }
    node.insert(restTokens, index, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.children).sort(compareKey);
    const strList = childKeys.map((k5) => {
      const c3 = this.children[k5];
      return (typeof c3.varIndex === "number" ? `(${k5})@${c3.varIndex}` : k5) + c3.buildRegExpStr();
    });
    if (typeof this.index === "number") {
      strList.unshift(`#${this.index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
};

// node_modules/.pnpm/hono@3.6.3/node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie = class {
  constructor() {
    this.context = { varIndex: 0 };
    this.root = new Node();
  }
  insert(path, index, pathErrorCheckOnly) {
    const paramMap = [];
    const groups = [];
    for (let i2 = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m3) => {
        const mark = `@\\${i2}`;
        groups[i2] = [mark, m3];
        i2++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i2 = groups.length - 1; i2 >= 0; i2--) {
      const [mark] = groups[i2];
      for (let j5 = tokens.length - 1; j5 >= 0; j5--) {
        if (tokens[j5].indexOf(mark) !== -1) {
          tokens[j5] = tokens[j5].replace(mark, groups[i2][1]);
          break;
        }
      }
    }
    this.root.insert(tokens, index, paramMap, this.context, pathErrorCheckOnly);
    return paramMap;
  }
  buildRegExp() {
    let regexp = this.root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_4, handlerIndex, paramIndex) => {
      if (typeof handlerIndex !== "undefined") {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (typeof paramIndex !== "undefined") {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
};

// node_modules/.pnpm/hono@3.6.3/node_modules/hono/dist/router/reg-exp-router/router.js
var methodNames = [METHOD_NAME_ALL, ...METHODS].map((method) => method.toUpperCase());
var emptyParam = {};
var nullMatcher = [/^$/, [], {}];
var wildcardRegExpCache = {};
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ?? (wildcardRegExpCache[path] = new RegExp(
    path === "*" ? "" : `^${path.replace(/\/\*/, "(?:|/.*)")}$`
  ));
}
function clearWildcardRegExpCache() {
  wildcardRegExpCache = {};
}
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map((route) => [!/\*|\/:/.test(route[0]), ...route]).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = {};
  for (let i2 = 0, j5 = -1, len = routesWithStaticPathFlag.length; i2 < len; i2++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i2];
    if (pathErrorCheckOnly) {
      staticMap[path] = { handlers, params: emptyParam };
    } else {
      j5++;
    }
    let paramMap;
    try {
      paramMap = trie.insert(path, j5, pathErrorCheckOnly);
    } catch (e3) {
      throw e3 === PATH_ERROR ? new UnsupportedPathError(path) : e3;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j5] = paramMap.length === 0 ? [{ handlers, params: emptyParam }, null] : [handlers, paramMap];
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i2 = 0, len = handlerData.length; i2 < len; i2++) {
    const paramMap = handlerData[i2][1];
    if (paramMap) {
      for (let j5 = 0, len2 = paramMap.length; j5 < len2; j5++) {
        paramMap[j5][1] = paramReplacementMap[paramMap[j5][1]];
      }
    }
  }
  const handlerMap = [];
  for (const i2 in indexReplacementMap) {
    handlerMap[i2] = handlerData[indexReplacementMap[i2]];
  }
  return [regexp, handlerMap, staticMap];
}
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k5 of Object.keys(middleware).sort((a2, b3) => b3.length - a2.length)) {
    if (buildWildcardRegExp(k5).test(path)) {
      return [...middleware[k5]];
    }
  }
  return void 0;
}
var RegExpRouter = class {
  constructor() {
    this.name = "RegExpRouter";
    this.middleware = { [METHOD_NAME_ALL]: {} };
    this.routes = { [METHOD_NAME_ALL]: {} };
  }
  add(method, path, handler) {
    var _a;
    const { middleware, routes } = this;
    if (!middleware || !routes) {
      throw new Error("Can not add a route since the matcher is already built.");
    }
    if (methodNames.indexOf(method) === -1)
      methodNames.push(method);
    if (!middleware[method]) {
      ;
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = {};
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p3) => {
          handlerMap[method][p3] = [...handlerMap[METHOD_NAME_ALL][p3]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    if (/\*$/.test(path)) {
      const re2 = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m3) => {
          var _a2;
          (_a2 = middleware[m3])[path] || (_a2[path] = findMiddleware(middleware[m3], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || []);
        });
      } else {
        (_a = middleware[method])[path] || (_a[path] = findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || []);
      }
      Object.keys(middleware).forEach((m3) => {
        if (method === METHOD_NAME_ALL || method === m3) {
          Object.keys(middleware[m3]).forEach((p3) => {
            re2.test(p3) && middleware[m3][p3].push(handler);
          });
        }
      });
      Object.keys(routes).forEach((m3) => {
        if (method === METHOD_NAME_ALL || method === m3) {
          Object.keys(routes[m3]).forEach((p3) => re2.test(p3) && routes[m3][p3].push(handler));
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i2 = 0, len = paths.length; i2 < len; i2++) {
      const path2 = paths[i2];
      Object.keys(routes).forEach((m3) => {
        var _a2;
        if (method === METHOD_NAME_ALL || method === m3) {
          (_a2 = routes[m3])[path2] || (_a2[path2] = [
            ...findMiddleware(middleware[m3], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ]);
          routes[m3][path2].push(handler);
        }
      });
    }
  }
  match(method, path) {
    clearWildcardRegExpCache();
    const matchers = this.buildAllMatchers();
    this.match = (method2, path2) => {
      const matcher = matchers[method2];
      const staticMatch = matcher[2][path2];
      if (staticMatch) {
        return staticMatch;
      }
      const match = path2.match(matcher[0]);
      if (!match) {
        return null;
      }
      const index = match.indexOf("", 1);
      const [handlers, paramMap] = matcher[1][index];
      if (!paramMap) {
        return handlers;
      }
      const params = {};
      for (let i2 = 0, len = paramMap.length; i2 < len; i2++) {
        params[paramMap[i2][0]] = match[paramMap[i2][1]];
      }
      return { handlers, params };
    };
    return this.match(method, path);
  }
  buildAllMatchers() {
    const matchers = {};
    methodNames.forEach((method) => {
      matchers[method] = this.buildMatcher(method) || matchers[METHOD_NAME_ALL];
    });
    this.middleware = this.routes = void 0;
    return matchers;
  }
  buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.middleware, this.routes].forEach((r3) => {
      const ownRoute = r3[method] ? Object.keys(r3[method]).map((path) => [path, r3[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute || (hasOwnRoute = true);
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(
          ...Object.keys(r3[METHOD_NAME_ALL]).map((path) => [path, r3[METHOD_NAME_ALL][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
};

// node_modules/.pnpm/hono@3.6.3/node_modules/hono/dist/router/smart-router/router.js
var SmartRouter = class {
  constructor(init) {
    this.name = "SmartRouter";
    this.routers = [];
    this.routes = [];
    Object.assign(this, init);
  }
  add(method, path, handler) {
    if (!this.routes) {
      throw new Error("Can not add a route since the matcher is already built.");
    }
    this.routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.routes) {
      throw new Error("Fatal error");
    }
    const { routers, routes } = this;
    const len = routers.length;
    let i2 = 0;
    let res;
    for (; i2 < len; i2++) {
      const router = routers[i2];
      try {
        routes.forEach((args) => {
          router.add(...args);
        });
        res = router.match(method, path);
      } catch (e3) {
        if (e3 instanceof UnsupportedPathError) {
          continue;
        }
        throw e3;
      }
      this.match = router.match.bind(router);
      this.routers = [router];
      this.routes = void 0;
      break;
    }
    if (i2 === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res || null;
  }
  get activeRouter() {
    if (this.routes || this.routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.routers[0];
  }
};

// node_modules/.pnpm/hono@3.6.3/node_modules/hono/dist/router/trie-router/node.js
function findParam(node, name) {
  for (let i2 = 0, len = node.patterns.length; i2 < len; i2++) {
    if (typeof node.patterns[i2] === "object" && node.patterns[i2][1] === name) {
      return true;
    }
  }
  const nodes = Object.values(node.children);
  for (let i2 = 0, len = nodes.length; i2 < len; i2++) {
    if (findParam(nodes[i2], name)) {
      return true;
    }
  }
  return false;
}
var Node2 = class {
  constructor(method, handler, children) {
    this.order = 0;
    this.children = children || {};
    this.methods = [];
    this.name = "";
    if (method && handler) {
      const m3 = {};
      m3[method] = { handler, score: 0, name: this.name };
      this.methods = [m3];
    }
    this.patterns = [];
    this.handlerSetCache = {};
  }
  insert(method, path, handler) {
    this.name = `${method} ${path}`;
    this.order = ++this.order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const parentPatterns = [];
    const errorMessage = (name) => {
      return `Duplicate param name, use another name instead of '${name}' - ${method} ${path} <--- '${name}'`;
    };
    for (let i2 = 0, len = parts.length; i2 < len; i2++) {
      const p3 = parts[i2];
      if (Object.keys(curNode.children).includes(p3)) {
        parentPatterns.push(...curNode.patterns);
        curNode = curNode.children[p3];
        continue;
      }
      curNode.children[p3] = new Node2();
      const pattern = getPattern(p3);
      if (pattern) {
        if (typeof pattern === "object") {
          for (let j5 = 0, len2 = parentPatterns.length; j5 < len2; j5++) {
            if (typeof parentPatterns[j5] === "object" && parentPatterns[j5][1] === pattern[1]) {
              throw new Error(errorMessage(pattern[1]));
            }
          }
          if (Object.values(curNode.children).some((n2) => findParam(n2, pattern[1]))) {
            throw new Error(errorMessage(pattern[1]));
          }
        }
        curNode.patterns.push(pattern);
        parentPatterns.push(...curNode.patterns);
      }
      parentPatterns.push(...curNode.patterns);
      curNode = curNode.children[p3];
    }
    if (!curNode.methods.length) {
      curNode.methods = [];
    }
    const m3 = {};
    const handlerSet = { handler, name: this.name, score: this.order };
    m3[method] = handlerSet;
    curNode.methods.push(m3);
    return curNode;
  }
  gHSets(node, method, wildcard) {
    var _a, _b;
    return (_a = node.handlerSetCache)[_b = `${method}:${wildcard ? "1" : "0"}`] || (_a[_b] = (() => {
      const handlerSets = [];
      for (let i2 = 0, len = node.methods.length; i2 < len; i2++) {
        const m3 = node.methods[i2];
        const handlerSet = m3[method] || m3[METHOD_NAME_ALL];
        if (handlerSet !== void 0) {
          handlerSets.push(handlerSet);
        }
      }
      return handlerSets;
    })());
  }
  search(method, path) {
    const handlerSets = [];
    const params = {};
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    for (let i2 = 0, len2 = parts.length; i2 < len2; i2++) {
      const part = parts[i2];
      const isLast = i2 === len2 - 1;
      const tempNodes = [];
      let matched = false;
      for (let j5 = 0, len22 = curNodes.length; j5 < len22; j5++) {
        const node = curNodes[j5];
        const nextNode = node.children[part];
        if (nextNode) {
          if (isLast === true) {
            if (nextNode.children["*"]) {
              handlerSets.push(...this.gHSets(nextNode.children["*"], method, true));
            }
            handlerSets.push(...this.gHSets(nextNode, method));
            matched = true;
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k5 = 0, len3 = node.patterns.length; k5 < len3; k5++) {
          const pattern = node.patterns[k5];
          if (pattern === "*") {
            const astNode = node.children["*"];
            if (astNode) {
              handlerSets.push(...this.gHSets(astNode, method));
              tempNodes.push(astNode);
            }
            continue;
          }
          if (part === "")
            continue;
          const [key, name, matcher] = pattern;
          const child = node.children[key];
          const restPathString = parts.slice(i2).join("/");
          if (matcher instanceof RegExp && matcher.test(restPathString)) {
            handlerSets.push(...this.gHSets(child, method));
            params[name] = restPathString;
            continue;
          }
          if (matcher === true || matcher instanceof RegExp && matcher.test(part)) {
            if (typeof key === "string") {
              if (isLast === true) {
                handlerSets.push(...this.gHSets(child, method));
                if (child.children["*"]) {
                  handlerSets.push(...this.gHSets(child.children["*"], method));
                }
              } else {
                tempNodes.push(child);
              }
            }
            if (typeof name === "string" && !matched) {
              params[name] = part;
            } else {
              if (node.children[part]) {
                params[name] = part;
              }
            }
          }
        }
      }
      curNodes = tempNodes;
    }
    const len = handlerSets.length;
    if (len === 0)
      return null;
    if (len === 1)
      return { handlers: [handlerSets[0].handler], params };
    const handlers = handlerSets.sort((a2, b3) => {
      return a2.score - b3.score;
    }).map((s2) => {
      return s2.handler;
    });
    return { handlers, params };
  }
};

// node_modules/.pnpm/hono@3.6.3/node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = class {
  constructor() {
    this.name = "TrieRouter";
    this.node = new Node2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (const p3 of results) {
        this.node.insert(method, p3, handler);
      }
      return;
    }
    this.node.insert(method, path, handler);
  }
  match(method, path) {
    return this.node.search(method, path);
  }
};

// node_modules/.pnpm/hono@3.6.3/node_modules/hono/dist/hono.js
var Hono2 = class extends Hono {
  constructor(init = {}) {
    super(init);
    this.router = init.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
};

// node_modules/.pnpm/@hono+node-server@1.2.0/node_modules/@hono/node-server/dist/serve-static.mjs
var import_fs = require("fs");

// node_modules/.pnpm/hono@3.6.3/node_modules/hono/dist/utils/filepath.js
var getFilePath = (options) => {
  let filename = options.filename;
  if (/(?:^|\/)\.\.(?:$|\/)/.test(filename))
    return;
  let root = options.root || "";
  const defaultDocument = options.defaultDocument || "index.html";
  if (filename.endsWith("/")) {
    filename = filename.concat(defaultDocument);
  } else if (!filename.match(/\.[a-zA-Z0-9]+$/)) {
    filename = filename.concat("/" + defaultDocument);
  }
  filename = filename.replace(/^\.?\//, "");
  root = root.replace(/\/$/, "");
  let path = root ? root + "/" + filename : filename;
  path = path.replace(/^\.?\//, "");
  return path;
};

// node_modules/.pnpm/hono@3.6.3/node_modules/hono/dist/utils/mime.js
var getMimeType = (filename) => {
  const regexp = /\.([a-zA-Z0-9]+?)$/;
  const match = filename.match(regexp);
  if (!match)
    return;
  let mimeType = mimes[match[1]];
  if (mimeType && mimeType.startsWith("text") || mimeType === "application/json") {
    mimeType += "; charset=utf-8";
  }
  return mimeType;
};
var mimes = {
  aac: "audio/aac",
  abw: "application/x-abiword",
  arc: "application/x-freearc",
  avi: "video/x-msvideo",
  avif: "image/avif",
  av1: "video/av1",
  azw: "application/vnd.amazon.ebook",
  bin: "application/octet-stream",
  bmp: "image/bmp",
  bz: "application/x-bzip",
  bz2: "application/x-bzip2",
  csh: "application/x-csh",
  css: "text/css",
  csv: "text/csv",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  eot: "application/vnd.ms-fontobject",
  epub: "application/epub+zip",
  gif: "image/gif",
  gz: "application/gzip",
  htm: "text/html",
  html: "text/html",
  ico: "image/x-icon",
  ics: "text/calendar",
  jar: "application/java-archive",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  js: "text/javascript",
  json: "application/json",
  jsonld: "application/ld+json",
  map: "application/json",
  mid: "audio/x-midi",
  midi: "audio/x-midi",
  mjs: "text/javascript",
  mp3: "audio/mpeg",
  mp4: "video/mp4",
  mpeg: "video/mpeg",
  mpkg: "application/vnd.apple.installer+xml",
  odp: "application/vnd.oasis.opendocument.presentation",
  ods: "application/vnd.oasis.opendocument.spreadsheet",
  odt: "application/vnd.oasis.opendocument.text",
  oga: "audio/ogg",
  ogv: "video/ogg",
  ogx: "application/ogg",
  opus: "audio/opus",
  otf: "font/otf",
  pdf: "application/pdf",
  php: "application/php",
  png: "image/png",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  rtf: "application/rtf",
  sh: "application/x-sh",
  svg: "image/svg+xml",
  swf: "application/x-shockwave-flash",
  tar: "application/x-tar",
  tif: "image/tiff",
  tiff: "image/tiff",
  ts: "video/mp2t",
  ttf: "font/ttf",
  txt: "text/plain",
  vsd: "application/vnd.visio",
  wasm: "application/wasm",
  webm: "video/webm",
  weba: "audio/webm",
  webp: "image/webp",
  woff: "font/woff",
  woff2: "font/woff2",
  xhtml: "application/xhtml+xml",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xml: "application/xml",
  xul: "application/vnd.mozilla.xul+xml",
  zip: "application/zip",
  "3gp": "video/3gpp",
  "3g2": "video/3gpp2",
  "7z": "application/x-7z-compressed",
  gltf: "model/gltf+json",
  glb: "model/gltf-binary"
};

// node_modules/.pnpm/@hono+node-server@1.2.0/node_modules/@hono/node-server/dist/serve-static.mjs
var createStreamBody = (stream) => {
  const body = new ReadableStream({
    start(controller) {
      stream.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      stream.on("end", () => {
        controller.close();
      });
    },
    cancel() {
      stream.destroy();
    }
  });
  return body;
};
var serveStatic = (options = { root: "" }) => {
  return async (c3, next) => {
    if (c3.finalized)
      return next();
    const url = new URL(c3.req.url);
    const filename = options.path ?? decodeURIComponent(url.pathname);
    let path = getFilePath({
      filename: options.rewriteRequestPath ? options.rewriteRequestPath(filename) : filename,
      root: options.root,
      defaultDocument: options.index ?? "index.html"
    });
    if (!path)
      return next();
    path = `./${path}`;
    if (!(0, import_fs.existsSync)(path)) {
      return next();
    }
    const mimeType = getMimeType(path);
    if (mimeType) {
      c3.header("Content-Type", mimeType);
    }
    const stat = (0, import_fs.lstatSync)(path);
    const size = stat.size;
    if (c3.req.method == "HEAD" || c3.req.method == "OPTIONS") {
      c3.header("Content-Length", size.toString());
      c3.status(200);
      return c3.body(null);
    }
    const range = c3.req.header("range") || "";
    if (!range) {
      c3.header("Content-Length", size.toString());
      return c3.body(createStreamBody((0, import_fs.createReadStream)(path)), 200);
    }
    c3.header("Accept-Ranges", "bytes");
    c3.header("Date", stat.birthtime.toUTCString());
    let start = 0;
    let end = stat.size - 1;
    const parts = range.replace(/bytes=/, "").split("-");
    start = parseInt(parts[0], 10);
    end = parts[1] ? parseInt(parts[1], 10) : end;
    if (size < end - start + 1) {
      end = size - 1;
    }
    const chunksize = end - start + 1;
    const stream = (0, import_fs.createReadStream)(path, { start, end });
    c3.header("Content-Length", chunksize.toString());
    c3.header("Content-Range", `bytes ${start}-${end}/${stat.size}`);
    return c3.body(createStreamBody(stream), 206);
  };
};

// node_modules/.pnpm/hono@3.6.3/node_modules/hono/dist/utils/html.js
var escapeRe = /[&<>'"]/;
var escapeToBuffer = (str, buffer) => {
  const match = str.search(escapeRe);
  if (match === -1) {
    buffer[0] += str;
    return;
  }
  let escape;
  let index;
  let lastIndex = 0;
  for (index = match; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34:
        escape = "&quot;";
        break;
      case 39:
        escape = "&#39;";
        break;
      case 38:
        escape = "&amp;";
        break;
      case 60:
        escape = "&lt;";
        break;
      case 62:
        escape = "&gt;";
        break;
      default:
        continue;
    }
    buffer[0] += str.substring(lastIndex, index) + escape;
    lastIndex = index + 1;
  }
  buffer[0] += str.substring(lastIndex, index);
};

// node_modules/.pnpm/hono@3.6.3/node_modules/hono/dist/helper/html/index.js
var raw = (value) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  return escapedString;
};
var html = (strings, ...values) => {
  const buffer = [""];
  for (let i2 = 0, len = strings.length - 1; i2 < len; i2++) {
    buffer[0] += strings[i2];
    const children = values[i2] instanceof Array ? values[i2].flat(Infinity) : [values[i2]];
    for (let i22 = 0, len2 = children.length; i22 < len2; i22++) {
      const child = children[i22];
      if (typeof child === "string") {
        escapeToBuffer(child, buffer);
      } else if (typeof child === "boolean" || child === null || child === void 0) {
        continue;
      } else if (typeof child === "object" && child.isEscaped || typeof child === "number") {
        buffer[0] += child;
      } else {
        escapeToBuffer(child.toString(), buffer);
      }
    }
  }
  buffer[0] += strings[strings.length - 1];
  return raw(buffer[0]);
};

// src/components/base.tsx
function Base(props) {
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

// node_modules/.pnpm/clsx@2.0.0/node_modules/clsx/dist/clsx.mjs
function r(e3) {
  var t2, f3, n2 = "";
  if ("string" == typeof e3 || "number" == typeof e3)
    n2 += e3;
  else if ("object" == typeof e3)
    if (Array.isArray(e3))
      for (t2 = 0; t2 < e3.length; t2++)
        e3[t2] && (f3 = r(e3[t2])) && (n2 && (n2 += " "), n2 += f3);
    else
      for (t2 in e3)
        e3[t2] && (n2 && (n2 += " "), n2 += t2);
  return n2;
}
function clsx() {
  for (var e3, t2, f3 = 0, n2 = ""; f3 < arguments.length; )
    (e3 = arguments[f3++]) && (t2 = r(e3)) && (n2 && (n2 += " "), n2 += t2);
  return n2;
}
var clsx_default = clsx;

// node_modules/.pnpm/hono@3.6.3/node_modules/hono/dist/jsx/index.js
var emptyTags = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "keygen",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
];
var booleanAttributes = [
  "allowfullscreen",
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "controls",
  "default",
  "defer",
  "disabled",
  "formnovalidate",
  "hidden",
  "inert",
  "ismap",
  "itemscope",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "novalidate",
  "open",
  "playsinline",
  "readonly",
  "required",
  "reversed",
  "selected"
];
var childrenToStringToBuffer = (children, buffer) => {
  for (let i2 = 0, len = children.length; i2 < len; i2++) {
    const child = children[i2];
    if (typeof child === "string") {
      escapeToBuffer(child, buffer);
    } else if (typeof child === "boolean" || child === null || child === void 0) {
      continue;
    } else if (child instanceof JSXNode) {
      child.toStringToBuffer(buffer);
    } else if (typeof child === "number" || child.isEscaped) {
      buffer[0] += child;
    } else {
      childrenToStringToBuffer(child, buffer);
    }
  }
};
var JSXNode = class {
  constructor(tag, props, children) {
    this.isEscaped = true;
    this.tag = tag;
    this.props = props;
    this.children = children;
  }
  toString() {
    const buffer = [""];
    this.toStringToBuffer(buffer);
    return buffer[0];
  }
  toStringToBuffer(buffer) {
    const tag = this.tag;
    const props = this.props;
    let { children } = this;
    buffer[0] += `<${tag}`;
    const propsKeys = Object.keys(props || {});
    for (let i2 = 0, len = propsKeys.length; i2 < len; i2++) {
      const key = propsKeys[i2];
      const v3 = props[key];
      if (key === "style" && typeof v3 === "object") {
        const styles = Object.keys(v3).map((k5) => `${k5}:${v3[k5]}`).join(";").replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
        buffer[0] += ` style="${styles}"`;
      } else if (typeof v3 === "string") {
        buffer[0] += ` ${key}="`;
        escapeToBuffer(v3, buffer);
        buffer[0] += '"';
      } else if (typeof v3 === "number") {
        buffer[0] += ` ${key}="${v3}"`;
      } else if (v3 === null || v3 === void 0) {
      } else if (typeof v3 === "boolean" && booleanAttributes.includes(key)) {
        if (v3) {
          buffer[0] += ` ${key}=""`;
        }
      } else if (key === "dangerouslySetInnerHTML") {
        if (children.length > 0) {
          throw "Can only set one of `children` or `props.dangerouslySetInnerHTML`.";
        }
        const escapedString = new String(v3.__html);
        escapedString.isEscaped = true;
        children = [escapedString];
      } else {
        buffer[0] += ` ${key}="`;
        escapeToBuffer(v3.toString(), buffer);
        buffer[0] += '"';
      }
    }
    if (emptyTags.includes(tag)) {
      buffer[0] += "/>";
      return;
    }
    buffer[0] += ">";
    childrenToStringToBuffer(children, buffer);
    buffer[0] += `</${tag}>`;
  }
};
var JSXFunctionNode = class extends JSXNode {
  toStringToBuffer(buffer) {
    const { children } = this;
    const res = this.tag.call(null, {
      ...this.props,
      children: children.length <= 1 ? children[0] : children
    });
    if (res instanceof JSXNode) {
      res.toStringToBuffer(buffer);
    } else if (typeof res === "number" || res.isEscaped) {
      buffer[0] += res;
    } else {
      escapeToBuffer(res, buffer);
    }
  }
};
var JSXFragmentNode = class extends JSXNode {
  toStringToBuffer(buffer) {
    childrenToStringToBuffer(this.children, buffer);
  }
};
var jsxFn = (tag, props, ...children) => {
  if (typeof tag === "function") {
    return new JSXFunctionNode(tag, props, children);
  } else {
    return new JSXNode(tag, props, children);
  }
};
var Fragment = (props) => {
  return new JSXFragmentNode("", {}, props.children || []);
};

// node_modules/.pnpm/hono@3.6.3/node_modules/hono/dist/jsx/jsx-dev-runtime.js
function jsxDEV(tag, props) {
  const children = props.children ?? [];
  delete props["children"];
  return Array.isArray(children) ? jsxFn(tag, props, ...children) : jsxFn(tag, props, children);
}

// src/components/sidebar.tsx
function Sidebar(props) {
  let postUI = null;
  if (props.posts.length === 0) {
    postUI = /* @__PURE__ */ jsxDEV(EmptySidebarEntries, { message: "No posts present" });
  } else {
    postUI = /* @__PURE__ */ jsxDEV(SidebarEntries, { posts: props.posts, activePostId: props.activePostId });
  }
  return /* @__PURE__ */ jsxDEV("div", { class: "w-80 flex flex-col gap-2 shadow bg-slate-50", children: [
    /* @__PURE__ */ jsxDEV("div", { class: "p-4 pb-0 flex flex-col gap-2", children: [
      /* @__PURE__ */ jsxDEV("div", { class: "join flex", children: [
        /* @__PURE__ */ jsxDEV(
          "input",
          {
            id: "searchInput",
            name: "searchTerm",
            type: "search",
            placeholder: "Search posts...",
            class: "input input-bordered join-item flex-1",
            "hx-post": "/fragment/search",
            "hx-trigger": "search, execute-search from:body",
            "hx-target": "#sidebarEntries",
            "hx-swap": "outerHTML"
          }
        ),
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            class: "btn join-item bg-white",
            onclick: "htmx.trigger('#searchInput', 'execute-search')",
            children: /* @__PURE__ */ jsxDEV(
              "svg",
              {
                xmlns: "http://www.w3.org/2000/svg",
                height: "1em",
                viewBox: "0 0 512 512",
                children: /* @__PURE__ */ jsxDEV("path", { d: "M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" })
              }
            )
          }
        )
      ] }),
      /* @__PURE__ */ jsxDEV("a", { class: "btn bg-white normal-case", href: "/posts/add", children: [
        /* @__PURE__ */ jsxDEV(
          "svg",
          {
            xmlns: "http://www.w3.org/2000/svg",
            height: "1em",
            viewBox: "0 0 448 512",
            children: /* @__PURE__ */ jsxDEV("path", { d: "M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z" })
          }
        ),
        "New"
      ] })
    ] }),
    postUI
  ] });
}
function EmptySidebarEntries(props) {
  return /* @__PURE__ */ jsxDEV("div", { id: "sidebarEntries", class: "pt-0 p-4 flex flex-col gap-2", children: /* @__PURE__ */ jsxDEV("p", { children: props.message }) });
}
function SidebarEntries(props) {
  return /* @__PURE__ */ jsxDEV("div", { id: "sidebarEntries", class: "pt-0 p-4 flex flex-col gap-2", children: props.posts.map((post) => /* @__PURE__ */ jsxDEV(SidebarEntry, { post, isSelected: post.id === props.activePostId })) });
}
function SidebarEntry(props) {
  const classes = clsx_default(
    "btn justify-start normal-case",
    props.isSelected ? "" : "btn-ghost"
  );
  return /* @__PURE__ */ jsxDEV("a", { href: `/posts/${props.post.id}`, class: classes, children: props.post.title });
}

// src/components/post.tsx
function Post(props) {
  return /* @__PURE__ */ jsxDEV("div", { class: "flex-1 p-4 flex gap-4 flex-col", children: [
    /* @__PURE__ */ jsxDEV("div", { class: "flex gap-2", children: [
      /* @__PURE__ */ jsxDEV("h1", { class: "flex-1 text-2xl border-b-2 border-gray-100 border-solid", children: props.post.title }),
      /* @__PURE__ */ jsxDEV("a", { class: "btn normal-case", href: `/posts/${props.post.id}/edit`, children: [
        /* @__PURE__ */ jsxDEV(
          "svg",
          {
            xmlns: "http://www.w3.org/2000/svg",
            height: "1em",
            viewBox: "0 0 512 512",
            children: /* @__PURE__ */ jsxDEV("path", { d: "M362.7 19.3L314.3 67.7 444.3 197.7l48.4-48.4c25-25 25-65.5 0-90.5L453.3 19.3c-25-25-65.5-25-90.5 0zm-71 71L58.6 323.5c-10.4 10.4-18 23.3-22.2 37.4L1 481.2C-1.5 489.7 .8 498.8 7 505s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L421.7 220.3 291.7 90.3z" })
          }
        ),
        "Edit"
      ] }),
      /* @__PURE__ */ jsxDEV(
        "button",
        {
          class: "btn normal-case",
          "hx-delete": `/posts/${props.post.id}`,
          "hx-trigger": "click",
          children: [
            /* @__PURE__ */ jsxDEV(
              "svg",
              {
                xmlns: "http://www.w3.org/2000/svg",
                height: "1em",
                viewBox: "0 0 448 512",
                children: /* @__PURE__ */ jsxDEV("path", { d: "M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z" })
              }
            ),
            "Delete"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxDEV("p", { children: props.post.description }),
    /* @__PURE__ */ jsxDEV("div", { class: "flex flex-col gap-2", children: [
      /* @__PURE__ */ jsxDEV("h2", { class: "text-xl border-b-2 border-gray-100 border-solid", children: "Leave a comment" }),
      /* @__PURE__ */ jsxDEV(
        "form",
        {
          "hx-post": `/posts/${props.post.id}/comments`,
          "hx-target": "#comments",
          "hx-swap": "beforeend",
          "hx-disabled-elt": "#comment-form-submit-btn",
          children: [
            /* @__PURE__ */ jsxDEV(
              "textarea",
              {
                name: "message",
                class: "textarea textarea-bordered w-full",
                placeholder: "Comment here..."
              }
            ),
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                id: "comment-form-submit-btn",
                type: "submit",
                class: "btn normal-case",
                children: [
                  /* @__PURE__ */ jsxDEV("span", { class: "loading loading-spinner htmx-indicator" }),
                  "Submit"
                ]
              }
            )
          ]
        }
      ),
      props.children
    ] })
  ] });
}
function EmptyPost(props) {
  return /* @__PURE__ */ jsxDEV("div", { class: "flex-1 p-4", children: /* @__PURE__ */ jsxDEV("div", { class: "flex h-full items-center justify-center", children: props.message }) });
}
function CreatePost(props) {
  return /* @__PURE__ */ jsxDEV("div", { class: "flex-1 p-4 flex flex-col gap-2", children: [
    /* @__PURE__ */ jsxDEV("h1", { class: "text-2xl", children: props.title }),
    /* @__PURE__ */ jsxDEV(
      "form",
      {
        class: "flex flex-col gap-2",
        "hx-post": props.action,
        "hx-disabled-elt": "#post-form-submit-btn",
        children: [
          /* @__PURE__ */ jsxDEV("div", { id: "title-form-control", class: "form-control w-full", children: [
            /* @__PURE__ */ jsxDEV("label", { class: "label", children: /* @__PURE__ */ jsxDEV("span", { class: "label-text", children: "Name" }) }),
            /* @__PURE__ */ jsxDEV(
              "input",
              {
                value: props.post?.title || "",
                type: "text",
                name: "title",
                placeholder: "Add a post name...",
                class: "input input-bordered",
                "hx-post": "/posts/validate/title",
                "hx-target": "#title-form-control",
                "hx-swap": "outerHTML"
              }
            )
          ] }),
          /* @__PURE__ */ jsxDEV("div", { class: "form-control w-full", children: [
            /* @__PURE__ */ jsxDEV("label", { class: "label", children: /* @__PURE__ */ jsxDEV("span", { class: "label-text", children: "Description" }) }),
            /* @__PURE__ */ jsxDEV(
              "textarea",
              {
                name: "description",
                class: "textarea textarea-bordered",
                placeholder: "Add a description...",
                children: props.post?.description || ""
              }
            )
          ] }),
          /* @__PURE__ */ jsxDEV("div", { class: "flex gap-2", children: [
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                id: "post-form-submit-btn",
                class: "btn normal-case",
                type: "submit",
                children: [
                  /* @__PURE__ */ jsxDEV("span", { class: "loading loading-spinner htmx-indicator" }),
                  "Save"
                ]
              }
            ),
            /* @__PURE__ */ jsxDEV("a", { class: "btn normal-case", href: props.cancelHref, children: "Cancel" })
          ] })
        ]
      }
    )
  ] });
}
function Comments(props) {
  return /* @__PURE__ */ jsxDEV(Fragment, { children: [
    /* @__PURE__ */ jsxDEV("h2", { class: "text-xl border-b-2 border-gray-100 border-solid", children: "Comments" }),
    /* @__PURE__ */ jsxDEV("div", { id: "comments", class: "flex flex-col gap-2", children: props.comments.length > 0 ? props.comments.map((comment) => /* @__PURE__ */ jsxDEV(Comment, { comment })) : /* @__PURE__ */ jsxDEV("p", { children: "No comments present" }) })
  ] });
}
function Comment(props) {
  return /* @__PURE__ */ jsxDEV("p", { class: "border-solid border-slate-100 border-2 rounded p-2 flex flex-col gap-2", children: [
    /* @__PURE__ */ jsxDEV("span", { children: props.comment.message }),
    /* @__PURE__ */ jsxDEV("span", { class: "self-end", children: props.comment.createdAt.toLocaleDateString() })
  ] });
}

// src/api/posts.ts
var import_node_crypto2 = __toESM(require("node:crypto"));
var posts = [];
var comments = [];
async function createPost(newPost) {
  const id = import_node_crypto2.default.randomUUID();
  const post = {
    id,
    ...newPost
  };
  posts.push(post);
  return Promise.resolve(id);
}
async function updatePost(newPost) {
  const post = posts.find((post2) => post2.id === newPost.id);
  if (post) {
    post.title = newPost.title;
    post.description = newPost.description;
    return Promise.resolve(true);
  }
  return Promise.resolve(false);
}
async function deletePost(id) {
  posts = posts.filter((post) => post.id !== id);
  return Promise.resolve();
}
async function getPost(id) {
  const post = posts.find((post2) => post2.id === id);
  return Promise.resolve(post);
}
async function getPosts() {
  return Promise.resolve(posts);
}
async function searchPosts(searchTerm) {
  const result = posts.filter(
    (post) => post.title.toLocaleLowerCase().includes(searchTerm) || post.description.toLocaleLowerCase().includes(searchTerm)
  );
  return Promise.resolve(result);
}
function getComments(postId) {
  const result = comments.filter((comment) => comment.postId === postId);
  return Promise.resolve(result);
}
function createComment(newComment) {
  const id = import_node_crypto2.default.randomUUID();
  const comment = {
    id,
    createdAt: /* @__PURE__ */ new Date(),
    ...newComment
  };
  comments.push(comment);
  return Promise.resolve(comment);
}

// node_modules/.pnpm/vest-utils@1.1.0/node_modules/vest-utils/dist/es/vest-utils.production.js
function n(n2) {
  return (...t2) => !n2(...t2);
}
function t(n2) {
  const t2 = String(n2), r3 = Number(n2), e3 = !isNaN(parseFloat(t2)) && !isNaN(Number(n2)) && isFinite(r3);
  return Boolean(e3);
}
var r2 = n(t);
function e(n2, r3) {
  return t(n2) && t(r3) && Number(n2) === Number(r3);
}
var u = n(e);
function o(n2, t2) {
  return e(n2.length, t2);
}
var c = n(o);
function i(n2, r3) {
  return t(n2) && t(r3) && Number(n2) > Number(r3);
}
function f(n2, t2) {
  return i(n2.length, t2);
}
function a(n2 = 1) {
  const t2 = [], r3 = (e4, u2) => {
    const o3 = r3.get(e4);
    if (o3)
      return o3[1];
    const c3 = u2();
    return t2.unshift([e4.concat(), c3]), f(t2, n2) && (t2.length = n2), c3;
  };
  return r3.invalidate = (n3) => {
    const r4 = e3(n3);
    r4 > -1 && t2.splice(r4, 1);
  }, r3.get = (n3) => t2[e3(n3)] || null, r3;
  function e3(n3) {
    return t2.findIndex(([t3]) => o(n3, t3.length) && n3.every((n4, r4) => n4 === t3[r4]));
  }
}
function l(n2) {
  return null === n2;
}
var s = n(l);
function v(n2) {
  return void 0 === n2;
}
var g = n(v);
function h(n2) {
  return l(n2) || v(n2);
}
var b = n(h);
function p(n2) {
  return [].concat(n2);
}
function d(n2) {
  return n2.forEach((n3) => n3());
}
function y(n2, t2) {
  return Object.prototype.hasOwnProperty.call(n2, t2);
}
function N(n2) {
  return "function" == typeof n2;
}
function _(n2) {
  return !!n2 && N(n2.then);
}
function m(n2, ...t2) {
  return N(n2) ? n2(...t2) : n2;
}
var O = Object.assign;
function j(n2, t2) {
  var r3;
  return null !== (r3 = m(n2)) && void 0 !== r3 ? r3 : m(t2);
}
function w(n2, t2) {
  if (!n2)
    throw t2 instanceof String ? t2.valueOf() : new Error(t2 ? m(t2) : t2);
}
function S(n2) {
  return String(n2) === n2;
}
function A(n2, t2) {
  return !!n2 != !!t2;
}
function E(n2) {
  return !!n2 === n2;
}
function $(n2) {
  setTimeout(() => {
    throw new Error(n2);
  }, 0);
}
var B = Object.freeze({ __proto__: null, createBus: function() {
  const n2 = {};
  return { emit(n3, r3) {
    t2(n3).concat(t2("*")).forEach((n4) => {
      n4(r3);
    });
  }, on: (r3, e3) => (n2[r3] = t2(r3).concat(e3), { off() {
    n2[r3] = t2(r3).filter((n3) => n3 !== e3);
  } }) };
  function t2(t3) {
    return n2[t3] || [];
  }
} });
var T = x();
function x(n2) {
  return t2 = 0, () => `${n2 ? n2 + "_" : ""}${t2++}`;
  var t2;
}
function z(n2, t2) {
  let r3 = false, e3 = null;
  for (let o3 = 0; o3 < n2.length; o3++)
    if (t2(n2[o3], u2, o3), r3)
      return e3;
  function u2(n3, t3) {
    n3 && (r3 = true, e3 = t3);
  }
}
function F(n2) {
  return "object" == typeof n2 && !h(n2);
}
function k(n2) {
  return Boolean(Array.isArray(n2));
}
var I = n(k);
function P(n2) {
  return !n2 || (y(n2, "length") ? o(n2, 0) : !!F(n2) && o(Object.keys(n2), 0));
}
var q = n(P);
function C(n2) {
  return i(n2, 0);
}
var D = /{(.*?)}/g;
function G(n2, ...t2) {
  const r3 = t2[0];
  if (F(r3))
    return n2.replace(D, (n3, t3) => {
      var e4;
      return `${null !== (e4 = r3[t3]) && void 0 !== e4 ? e4 : n3}`;
    });
  const e3 = [...t2];
  return n2.replace(D, (n3) => `${P(e3) ? n3 : e3.shift()}`);
}
function H(n2) {
  let t2 = n2.initial;
  return { getState: function() {
    return t2;
  }, transition: function(n3, e3) {
    return t2 = r3(t2, n3, e3);
  }, staticTransition: r3 };
  function r3(t3, r4, e3) {
    var u2, o3, c3;
    let i2 = null !== (o3 = null === (u2 = n2.states[t3]) || void 0 === u2 ? void 0 : u2[r4]) && void 0 !== o3 ? o3 : null === (c3 = n2.states["*"]) || void 0 === c3 ? void 0 : c3[r4];
    if (Array.isArray(i2)) {
      const [, n3] = i2;
      if (!n3(e3))
        return t3;
      i2 = i2[0];
    }
    return i2 && i2 !== t3 ? i2 : t3;
  }
}
var K = Object.freeze({ __proto__: null, createTinyState: function(n2) {
  let t2;
  return e3(), () => [t2, r3, e3];
  function r3(n3) {
    t2 = m(n3, t2);
  }
  function e3() {
    r3(m(n2));
  }
} });
function L(n2) {
  return new String(m(n2));
}
function M() {
}

// node_modules/.pnpm/context@3.0.13/node_modules/context/dist/es/context.production.js
var e2 = Symbol();
function o2(u2) {
  let r3 = e2;
  return { run: function(n2, t2) {
    const u3 = c3() ? o3() : e2;
    r3 = n2;
    const i2 = t2();
    return r3 = u3, i2;
  }, use: o3, useX: function(u3) {
    return w(c3(), j(u3, "Not inside of a running context.")), r3;
  } };
  function o3() {
    return c3() ? r3 : u2;
  }
  function c3() {
    return r3 !== e2;
  }
}
function c2(n2) {
  const t2 = o2();
  return { bind: function(n3, t3) {
    return function(...u2) {
      return e3(n3, function() {
        return t3(...u2);
      });
    };
  }, run: e3, use: t2.use, useX: t2.useX };
  function e3(e4, o3) {
    var c3;
    const i2 = t2.use(), s2 = O({}, i2 || {}, null !== (c3 = m(n2, e4, i2)) && void 0 !== c3 ? c3 : e4);
    return t2.run(Object.freeze(s2), o3);
  }
}

// node_modules/.pnpm/n4s@5.0.6/node_modules/n4s/dist/es/n4s.production.js
var S2 = c2((t2, e3) => {
  const r3 = { value: t2.value, meta: t2.meta || {} };
  return e3 ? t2.set ? O(r3, { parent: () => function(n2) {
    return { value: n2.value, meta: n2.meta, parent: n2.parent };
  }(e3) }) : e3 : O(r3, { parent: P2 });
});
function P2() {
  return null;
}
function k2(n2, t2) {
  return S(n2) && S(t2) && n2.endsWith(t2);
}
var A2 = n(k2);
function I2(n2, t2) {
  return n2 === t2;
}
var J = n(I2);
function K2(n2, t2) {
  return e(n2, t2) || i(n2, t2);
}
function R(n2, t2) {
  return (k(t2) || !(!S(t2) || !S(n2))) && -1 !== t2.indexOf(n2);
}
var U = n(R);
function V(n2, t2) {
  return t(n2) && t(t2) && Number(n2) < Number(t2);
}
function $2(n2, t2) {
  return e(n2, t2) || V(n2, t2);
}
function F2(n2, t2, e3) {
  return K2(n2, t2) && $2(n2, e3);
}
var M2 = n(F2);
function X(n2) {
  return h(n2) || S(n2) && !n2.trim();
}
var j2 = n(X);
var z2 = n(E);
var C2 = (n2) => !!t(n2) && n2 % 2 == 0;
function D2(n2, t2) {
  return n2 in t2;
}
var G2 = n(D2);
function H2(n2) {
  return Number.isNaN(n2);
}
var L2 = n(H2);
function Q(n2) {
  return V(n2, 0);
}
function Y(n2) {
  return Boolean("number" == typeof n2);
}
var Z = n(Y);
var _2 = (n2) => !!t(n2) && n2 % 2 != 0;
var nn = n(S);
function tn(n2) {
  return !!n2;
}
var en = n(tn);
function rn(n2, t2) {
  if (h(t2))
    return false;
  for (const e3 in t2)
    if (t2[e3] === n2)
      return true;
  return false;
}
var sn = n(rn);
function un(n2, t2) {
  return K2(n2.length, t2);
}
function on(n2, t2) {
  return t2 instanceof RegExp ? t2.test(n2) : !!S(t2) && new RegExp(t2).test(n2);
}
var cn = n(on);
function an(n2, t2) {
  try {
    return t2(n2);
  } catch (n3) {
    return false;
  }
}
function fn(n2, t2) {
  return V(n2.length, t2);
}
function ln(n2, t2) {
  return $2(n2.length, t2);
}
function Nn(n2, t2) {
  return S(n2) && S(t2) && n2.startsWith(t2);
}
var mn = n(Nn);
var gn = { condition: an, doesNotEndWith: A2, doesNotStartWith: mn, endsWith: k2, equals: I2, greaterThan: i, greaterThanOrEquals: K2, gt: i, gte: K2, inside: R, isArray: k, isBetween: F2, isBlank: X, isBoolean: E, isEmpty: P, isEven: C2, isFalsy: en, isKeyOf: D2, isNaN: H2, isNegative: Q, isNotArray: I, isNotBetween: M2, isNotBlank: j2, isNotBoolean: z2, isNotEmpty: q, isNotKeyOf: G2, isNotNaN: L2, isNotNull: s, isNotNullish: b, isNotNumber: Z, isNotNumeric: r2, isNotString: nn, isNotUndefined: g, isNotValueOf: sn, isNull: l, isNullish: h, isNumber: Y, isNumeric: t, isOdd: _2, isPositive: C, isString: S, isTruthy: tn, isUndefined: v, isValueOf: rn, lengthEquals: o, lengthNotEquals: c, lessThan: V, lessThanOrEquals: $2, longerThan: f, longerThanOrEquals: un, lt: V, lte: $2, matches: on, notEquals: J, notInside: U, notMatches: cn, numberEquals: e, numberNotEquals: u, shorterThan: fn, shorterThanOrEquals: ln, startsWith: Nn };
function hn(n2) {
  return gn[n2];
}
function pn(n2, t2) {
  const e3 = { pass: n2 };
  return t2 && (e3.message = t2), e3;
}
function dn(n2) {
  return j(n2, pn(true));
}
function yn(n2, t2, e3, ...r3) {
  return function(n3) {
    w(E(n3) || n3 && E(n3.pass), "Incorrect return value for rule: " + JSON.stringify(n3));
  }(n2), E(n2) ? pn(n2) : pn(n2.pass, m(n2.message, t2, e3, ...r3));
}
function En(n2) {
  const t2 = { message: function(n3) {
    return e3 = n3, r3;
  } };
  let e3;
  const r3 = new Proxy(t2, { get: (s2, u2) => {
    const o3 = hn(u2);
    return o3 ? function(t3, r4, s3) {
      return function(...u3) {
        const o4 = S2.run({ value: n2 }, () => yn(r4(n2, ...u3), s3, n2, ...u3));
        function c3() {
          return h(e3) ? h(o4.message) ? `enforce/${s3} failed with ${JSON.stringify(n2)}` : L(o4.message) : L(e3);
        }
        return w(o4.pass, c3()), t3;
      };
    }(r3, o3, u2) : t2[u2];
  } });
  return r3;
}
var vn = function() {
  const t2 = { context: () => S2.useX(), extend: (t3) => {
    O(gn, t3);
  } };
  return new Proxy(O(En, t2), { get: (n2, t3) => t3 in n2 ? n2[t3] : hn(t3) ? function(n3) {
    const t4 = [];
    let e3;
    return function n4(r3) {
      return (...s2) => {
        const u2 = hn(r3);
        t4.push((n5) => yn(u2(n5, ...s2), r3, n5, ...s2));
        let o3 = { run: (n5) => dn(z(t4, (t5, r4) => {
          var s3;
          const u3 = S2.run({ value: n5 }, () => t5(n5));
          r4(!u3.pass, pn(!!u3.pass, null !== (s3 = m(e3, n5, u3.message)) && void 0 !== s3 ? s3 : u3.message));
        })), test: (n5) => o3.run(n5).pass, message: (n5) => (n5 && (e3 = n5), o3) };
        return o3 = new Proxy(o3, { get: (t5, e4) => hn(e4) ? n4(e4) : t5[e4] }), o3;
      };
    }(n3);
  }(t3) : void 0 });
}();

// node_modules/.pnpm/vestjs-runtime@1.0.4/node_modules/vestjs-runtime/dist/es/vestjs-runtime.production.js
var f2;
var y2;
"function" == typeof SuppressedError && SuppressedError, function(e3) {
  e3.Type = "$type", e3.Keys = "keys", e3.Key = "key", e3.Parent = "parent", e3.Data = "data", e3.AllowReorder = "allowReorder";
}(f2 || (f2 = {})), function(e3) {
  e3.Type = "$", e3.Keys = "K", e3.Key = "k", e3.Parent = "P", e3.Data = "D", e3.AllowReorder = "aR";
}(y2 || (y2 = {}));
var p2 = { [f2.Type]: y2.Type, [f2.Keys]: y2.Keys, [f2.Parent]: y2.Parent, [f2.Data]: y2.Data, [f2.Key]: y2.Key, [f2.AllowReorder]: y2.AllowReorder };
var h2 = Object.entries(p2).reduce((e3, [t2, n2]) => Object.assign(e3, { [n2]: t2 }), {});
var v2 = class _v {
  static setParent(e3, t2) {
    return e3.parent = t2, e3;
  }
  static saveOutput(e3, t2) {
    return e3.output = t2, e3;
  }
  static setKey(e3, t2) {
    return e3.key = t2, e3;
  }
  static addChild(t2, n2) {
    var r3;
    w(t2), t2.children = null !== (r3 = t2.children) && void 0 !== r3 ? r3 : [], t2.children.push(n2), _v.setParent(n2, t2);
  }
  static removeChild(e3, t2) {
    var n2, r3;
    e3.children = null !== (r3 = null === (n2 = e3.children) || void 0 === n2 ? void 0 : n2.filter((e4) => e4 !== t2)) && void 0 !== r3 ? r3 : null;
  }
  static addChildKey(t2, n2, r3) {
    var o3;
    w(t2), t2.keys = null !== (o3 = t2.keys) && void 0 !== o3 ? o3 : {}, t2.keys[n2] = r3;
  }
  static slice(e3, n2) {
    h(e3.children) || (e3.children.length = n2);
  }
  static setData(e3, t2) {
    e3.data = t2;
  }
};
var O2;
!function(e3) {
  e3.NO_ACTIVE_ISOLATE = "Not within an active isolate", e3.UNABLE_TO_PICK_NEXT_ISOLATE = "Unable to pick next isolate. This is a bug, please report it to the Vest maintainers.", e3.ENCOUNTERED_THE_SAME_KEY_TWICE = 'Encountered the same key "{key}" twice. This may lead to inconsistent or overriding of results.', e3.IVALID_ISOLATE_CANNOT_PARSE = "Invalid isolate was passed to IsolateSerializer. Cannot proceed.";
}(O2 || (O2 = {}));
var _3 = class __ {
  static at(e3, n2) {
    var r3, o3;
    return h(e3) ? null : null !== (o3 = null === (r3 = e3.children) || void 0 === r3 ? void 0 : r3[n2]) && void 0 !== o3 ? o3 : null;
  }
  static cursor(e3) {
    var n2, r3;
    return h(e3) ? 0 : null !== (r3 = null === (n2 = e3.children) || void 0 === n2 ? void 0 : n2.length) && void 0 !== r3 ? r3 : 0;
  }
  static canReorder(e3) {
    return !h(e3) && __.allowsReorder(e3.parent);
  }
  static allowsReorder(e3) {
    return true === (null == e3 ? void 0 : e3.allowReorder);
  }
  static usesKey(e3) {
    return !h(e3) && b(e3.key);
  }
  static getChildByKey(e3, n2) {
    var r3, o3;
    return h(e3) ? null : null !== (o3 = null === (r3 = e3.keys) || void 0 === r3 ? void 0 : r3[n2]) && void 0 !== o3 ? o3 : null;
  }
};
function R2(e3, t2) {
  return (null == e3 ? void 0 : e3[f2.Type]) === t2;
}
function E2(e3, t2) {
  return R2(e3, t2[f2.Type]);
}
var T2 = Object.freeze({ __proto__: null, isIsolateType: R2, isSameIsolateIdentity: function(e3, t2) {
  return Object.is(e3, t2) || E2(e3, t2) && e3.key === t2.key;
}, isSameIsolateType: E2 });
var N2 = c2((t2, n2) => {
  if (n2)
    return null;
  w(t2.historyRoot);
  const [o3] = t2.historyRoot(), i2 = {};
  return O(i2, { historyNode: o3, runtimeNode: null, runtimeRoot: null, stateRef: t2 }), i2;
});
var I3 = N2.run;
var m2 = { Run: I3, addNodeToHistory: P3, createRef: function(e3, t2) {
  return Object.freeze({ Bus: B.createBus(), Reconciler: e3, appData: m(t2), historyRoot: K.createTinyState(null) });
}, persist: A3, reset: function() {
  const [, , e3] = K3();
  e3();
}, useAvailableRoot: function() {
  const e3 = g2();
  if (e3)
    return e3;
  const [t2] = K3();
  return t2;
}, useCurrentCursor: function() {
  const e3 = w2();
  return e3 ? _3.cursor(e3) : 0;
}, useHistoryRoot: K3, useLoadRootNode: function(e3) {
  S3(e3);
}, useXAppData: function() {
  return C3().stateRef.appData;
} };
function A3(e3) {
  const t2 = N2.useX();
  return (...n2) => {
    var r3;
    const o3 = null !== (r3 = N2.use()) && void 0 !== r3 ? r3 : t2;
    return N2.run(o3.stateRef, () => e3(...n2));
  };
}
function C3() {
  return N2.useX();
}
function K3() {
  return C3().stateRef.historyRoot();
}
function k3() {
  return C3().historyNode;
}
function b2() {
  const e3 = w2(), t2 = k3();
  return e3 ? _3.at(t2, _3.cursor(e3)) : t2;
}
function P3(t2) {
  const n2 = w2();
  n2 ? function(t3) {
    const n3 = w2();
    w(n3, O2.NO_ACTIVE_ISOLATE), v2.addChild(n3, t3);
  }(t2) : S3(t2), v2.setParent(t2, n2);
}
function S3(e3) {
  const [, t2] = K3();
  t2(e3);
}
function w2() {
  var e3;
  return null !== (e3 = C3().runtimeNode) && void 0 !== e3 ? e3 : null;
}
function g2() {
  return C3().runtimeRoot;
}
var j3 = class _j {
  static reconcile(n2) {
    const r3 = function(e3, n3) {
      var r4;
      if (h(n3))
        return function(e4) {
          if (_3.usesKey(e4))
            return _j.handleIsolateNodeWithKey(e4);
          return e4;
        }(e3);
      if (!E2(e3, n3))
        return e3;
      const o3 = C3().stateRef.Reconciler;
      return null !== (r4 = o3(e3, n3)) && void 0 !== r4 ? r4 : function(e4, n4) {
        return h(n4), e4;
      }(e3, n3);
    }(n2, b2());
    return w(r3, O2.UNABLE_TO_PICK_NEXT_ISOLATE), r3;
  }
  static dropNextNodesOnReorder(e3, t2, n2) {
    const r3 = e3(t2, n2);
    return r3 && function() {
      const e4 = w2(), t3 = k3();
      if (!t3 || !e4)
        return;
      v2.slice(t3, _3.cursor(e4));
    }(), r3;
  }
  static handleIsolateNodeWithKey(n2) {
    w(_3.usesKey(n2));
    const r3 = function(e3) {
      if (h(e3))
        return null;
      const n3 = C3().historyNode;
      return _3.getChildByKey(n3, e3);
    }(n2.key);
    let o3 = n2;
    return h(r3) || (o3 = r3), function(n3, r4) {
      if (!n3)
        return;
      const o4 = w2();
      w(o4, O2.NO_ACTIVE_ISOLATE), h(_3.getChildByKey(o4, n3)) ? v2.addChildKey(o4, n3, r4) : $(G(O2.ENCOUNTERED_THE_SAME_KEY_TWICE, { key: n3 }));
    }(n2.key, n2), o3;
  }
};
var D3 = class {
  static create(e3, t2, n2, r3) {
    const o3 = w2(), i2 = v2.setParent(function(e4, t3, n3 = null) {
      const r4 = null != t3 ? t3 : {}, { allowReorder: o4 } = r4, i3 = function(e5, t4) {
        var n4 = {};
        for (var r5 in e5)
          Object.prototype.hasOwnProperty.call(e5, r5) && t4.indexOf(r5) < 0 && (n4[r5] = e5[r5]);
        if (null != e5 && "function" == typeof Object.getOwnPropertySymbols) {
          var o5 = 0;
          for (r5 = Object.getOwnPropertySymbols(e5); o5 < r5.length; o5++)
            t4.indexOf(r5[o5]) < 0 && Object.prototype.propertyIsEnumerable.call(e5, r5[o5]) && (n4[r5[o5]] = e5[r5[o5]]);
        }
        return n4;
      }(r4, ["allowReorder"]);
      return { [f2.AllowReorder]: o4, [f2.Keys]: null, [f2.Parent]: null, [f2.Type]: e4, [f2.Data]: i3, children: null, key: n3, output: null };
    }(e3, n2, r3), o3), u2 = j3.reconcile(i2), s2 = b2(), l2 = Object.is(u2, i2) ? function(e4, t3, n3) {
      const r4 = g2(), o4 = I3(Object.assign({ historyNode: e4, runtimeNode: t3 }, !r4 && { runtimeRoot: t3 }), () => n3(t3));
      return t3.output = o4, o4;
    }(s2, i2, t2) : u2.output;
    return v2.setParent(u2, o3), v2.saveOutput(u2, l2), P3(u2), u2;
  }
};
function L3(e3, n2, r3) {
  if (h(e3.children))
    return;
  let o3 = false;
  for (const s2 of e3.children) {
    if (o3)
      return;
    if ((h(r3) || m(r3, s2)) && n2(s2, u2), o3)
      return;
    L3(s2, (e4, t2) => {
      n2(e4, () => {
        t2(), u2();
      });
    }, r3);
  }
  function u2() {
    o3 = true;
  }
}
function B2(e3, t2, n2) {
  let r3 = false;
  return L3(e3, (e4, n3) => {
    t2(e4) && (n3(), r3 = true);
  }, n2), r3;
}
function x2(e3, t2) {
  let n2 = e3;
  do {
    if (t2(n2))
      return n2;
    n2 = n2.parent;
  } while (n2);
  return null;
}
var z3 = Object.freeze({ __proto__: null, closest: x2, closestExists: function(e3, t2) {
  return !!x2(e3, t2);
}, every: function(e3, t2, n2) {
  let r3 = true;
  return L3(e3, (e4, n3) => {
    t2(e4) || (n3(), r3 = false);
  }, n2), r3;
}, find: function(e3, t2, n2) {
  let r3 = null;
  return L3(e3, (e4, n3) => {
    t2(e4) && (n3(), r3 = e4);
  }, n2), r3;
}, findClosest: function(e3, t2) {
  var n2, r3;
  let o3 = null, i2 = e3;
  for (; i2 && (o3 = null !== (r3 = null === (n2 = i2.children) || void 0 === n2 ? void 0 : n2.find(t2)) && void 0 !== r3 ? r3 : null, !o3); )
    i2 = i2.parent;
  return o3;
}, has: function(e3, t2) {
  return B2(e3, () => true, t2);
}, pluck: function(e3, t2, n2) {
  L3(e3, (e4) => {
    t2(e4) && e4.parent && v2.removeChild(e4.parent, e4);
  }, n2);
}, some: B2, walk: L3 });
function V2() {
  return C3().stateRef.Bus;
}
function U2(e3, n2) {
  const r3 = V2().emit;
  return h(e3) || r3(e3, n2), A3(r3);
}
var W = Object.freeze({ __proto__: null, useBus: V2, useEmit: U2, usePrepareEmitter: function(e3) {
  const t2 = U2();
  return (n2) => t2(e3, n2);
} });

// node_modules/.pnpm/vest@5.1.0/node_modules/vest/dist/es/vest.production.js
var w3 = "Focused";
var B3 = "Group";
var k4 = "OmitWhen";
var j4 = "SkipWhen";
var K4 = "Suite";
var V3 = "Test";
var X2 = class {
  static setOptionalField(t2, n2, s2) {
    const r3 = t2.data.optional, i2 = r3[n2];
    O(r3, { [n2]: O({}, i2, s2(i2)) });
  }
  static getOptionalField(t2, e3) {
    var n2;
    return null !== (n2 = t2.data.optional[e3]) && void 0 !== n2 ? n2 : {};
  }
  static getOptionalFields(t2) {
    return t2.data.optional;
  }
};
var H3;
var x3;
!function(t2) {
  t2[t2.CUSTOM_LOGIC = 0] = "CUSTOM_LOGIC", t2[t2.AUTO = 1] = "AUTO";
}(H3 || (H3 = {})), function(t2) {
  t2.EAGER = "EAGER", t2.ALL = "ALL", t2.ONE = "ONE";
}(x3 || (x3 = {}));
var q2 = c2((t2, s2) => s2 ? null : O({ inclusion: {}, mode: K.createTinyState(x3.EAGER), suiteParams: [], testMemoCache: J2 }, t2));
function Y2() {
  return q2.useX().inclusion;
}
function z4() {
  return q2.useX().mode();
}
var J2 = a(10);
function Q2(e3) {
  var n2;
  const s2 = m2.useAvailableRoot(), u2 = q2.useX().suiteParams, c3 = null !== (n2 = null == u2 ? void 0 : u2[0]) && void 0 !== n2 ? n2 : {};
  if (k(e3) || S(e3))
    p(e3).forEach((e4) => {
      X2.setOptionalField(s2, e4, () => ({ type: H3.AUTO, applied: !!y(c3, e4) && vn.isBlank().test(null == c3 ? void 0 : c3[e4]), rule: null }));
    });
  else
    for (const n3 in e3) {
      const r3 = e3[n3];
      X2.setOptionalField(s2, n3, () => ({ type: H3.CUSTOM_LOGIC, rule: r3, applied: vn.isBlank().test(r3) || true === r3 }));
    }
}
function Z2(t2) {
  var e3, n2;
  if (!t2)
    return false;
  const s2 = m2.useAvailableRoot();
  return null !== (n2 = null === (e3 = X2.getOptionalField(s2, t2)) || void 0 === e3 ? void 0 : e3.applied) && void 0 !== n2 && n2;
}
var $3;
!function(t2) {
  t2.TEST_RUN_STARTED = "test_run_started", t2.TEST_COMPLETED = "test_completed", t2.ALL_RUNNING_TESTS_FINISHED = "all_running_tests_finished", t2.REMOVE_FIELD = "remove_field", t2.RESET_FIELD = "reset_field", t2.RESET_SUITE = "reset_suite", t2.SUITE_RUN_STARTED = "suite_run_started", t2.SUITE_CALLBACK_RUN_FINISHED = "SUITE_CALLBACK_RUN_FINISHED", t2.DONE_TEST_OMISSION_PASS = "DONE_TEST_OMISSION_PASS";
}($3 || ($3 = {}));
var tt = a();
function et() {
  return m2.useXAppData();
}
function nt() {
  return et().doneCallbacks();
}
function st() {
  return et().fieldCallbacks();
}
function rt() {
  return et().suiteId;
}
function it() {
  et().suiteResultCache.invalidate([rt()]);
}
function ot() {
  const [, , t2] = nt(), [, , e3] = st();
  t2(), e3();
}
function at(t2) {
  m2.useLoadRootNode(t2), it();
}
var ut;
var ct;
!function(t2) {
  t2.UNTESTED = "UNTESTED", t2.SKIPPED = "SKIPPED", t2.FAILED = "FAILED", t2.WARNING = "WARNING", t2.PASSING = "PASSING", t2.PENDING = "PENDING", t2.CANCELED = "CANCELED", t2.OMITTED = "OMITTED";
}(ut || (ut = {})), function(t2) {
  t2.RESET = "RESET";
}(ct || (ct = {}));
var lt = { initial: ut.UNTESTED, states: { "*": { [ut.OMITTED]: ut.OMITTED, [ct.RESET]: ut.UNTESTED }, [ut.UNTESTED]: { [ut.CANCELED]: ut.CANCELED, [ut.FAILED]: ut.FAILED, [ut.PASSING]: ut.PASSING, [ut.PENDING]: ut.PENDING, [ut.SKIPPED]: ut.SKIPPED, [ut.WARNING]: ut.WARNING }, [ut.PENDING]: { [ut.CANCELED]: ut.CANCELED, [ut.FAILED]: ut.FAILED, [ut.PASSING]: ut.PASSING, [ut.SKIPPED]: [ut.SKIPPED, (t2) => true === t2], [ut.WARNING]: ut.WARNING }, [ut.SKIPPED]: {}, [ut.FAILED]: {}, [ut.WARNING]: {}, [ut.PASSING]: {}, [ut.CANCELED]: {}, [ut.OMITTED]: {} } };
var Et;
var ft;
var dt;
function Nt(t2) {
  return t2 === Et.ERRORS ? ft.ERROR_COUNT : ft.WARN_COUNT;
}
!function(t2) {
  t2.WARNINGS = "warnings", t2.ERRORS = "errors";
}(Et || (Et = {})), function(t2) {
  t2.ERROR_COUNT = "errorCount", t2.WARN_COUNT = "warnCount";
}(ft || (ft = {})), function(t2) {
  t2.Error = "error", t2.Warning = "warning";
}(dt || (dt = {}));
var Tt = H(lt);
var St = class _St {
  static getData(t2) {
    return w(t2.data), t2.data;
  }
  static warns(t2) {
    return _St.getData(t2).severity === dt.Warning;
  }
  static isPending(t2) {
    return _St.statusEquals(t2, ut.PENDING);
  }
  static isOmitted(t2) {
    return _St.statusEquals(t2, ut.OMITTED);
  }
  static isUntested(t2) {
    return _St.statusEquals(t2, ut.UNTESTED);
  }
  static isFailing(t2) {
    return _St.statusEquals(t2, ut.FAILED);
  }
  static isCanceled(t2) {
    return _St.statusEquals(t2, ut.CANCELED);
  }
  static isSkipped(t2) {
    return _St.statusEquals(t2, ut.SKIPPED);
  }
  static isPassing(t2) {
    return _St.statusEquals(t2, ut.PASSING);
  }
  static isWarning(t2) {
    return _St.statusEquals(t2, ut.WARNING);
  }
  static hasFailures(t2) {
    return _St.isFailing(t2) || _St.isWarning(t2);
  }
  static isNonActionable(t2) {
    return _St.isSkipped(t2) || _St.isOmitted(t2) || _St.isCanceled(t2);
  }
  static isTested(t2) {
    return _St.hasFailures(t2) || _St.isPassing(t2);
  }
  static awaitsResolution(t2) {
    return _St.isSkipped(t2) || _St.isUntested(t2) || _St.isPending(t2);
  }
  static isAsyncTest(t2) {
    return _(_St.getData(t2).asyncTest);
  }
  static statusEquals(t2, e3) {
    return _St.getData(t2).status === e3;
  }
  static setPending(t2) {
    _St.setStatus(t2, ut.PENDING);
  }
  static fail(t2) {
    _St.setStatus(t2, _St.warns(t2) ? ut.WARNING : ut.FAILED);
  }
  static pass(t2) {
    _St.setStatus(t2, ut.PASSING);
  }
  static warn(t2) {
    _St.setData(t2, (t3) => Object.assign(Object.assign({}, t3), { severity: dt.Warning }));
  }
  static setData(t2, e3) {
    t2.data = m(e3, _St.getData(t2));
  }
  static skip(t2, e3) {
    _St.setStatus(t2, ut.SKIPPED, e3);
  }
  static cancel(t2) {
    _St.setStatus(t2, ut.CANCELED), _St.getData(t2).abortController.abort(ut.CANCELED);
  }
  static omit(t2) {
    _St.setStatus(t2, ut.OMITTED);
  }
  static reset(t2) {
    _St.setStatus(t2, ct.RESET);
  }
  static setStatus(t2, e3, n2) {
    _St.setData(t2, (t3) => Object.assign(Object.assign({}, t3), { status: Tt.staticTransition(t3.status, e3, n2) }));
  }
};
function gt(t2) {
  return T2.isIsolateType(t2, V3);
}
function Rt(t2) {
  w(gt(t2));
}
function It(t2) {
  return Rt(t2), t2;
}
function _t(t2, e3) {
  return !!e3 && !mt(t2, e3);
}
function mt(t2, e3) {
  return !(!e3 || t2.fieldName !== e3);
}
var pt = class _pt {
  static hasNoTests(t2 = _pt.defaultRoot()) {
    return !t2 || !z3.has(t2, gt);
  }
  static someIncompleteTests(t2, e3 = _pt.defaultRoot()) {
    return !!e3 && z3.some(e3, (e4) => (Rt(e4), St.isPending(e4) && t2(e4)), gt);
  }
  static someTests(t2, e3 = _pt.defaultRoot()) {
    return !!e3 && z3.some(e3, (e4) => (Rt(e4), t2(e4)), gt);
  }
  static everyTest(t2, e3 = _pt.defaultRoot()) {
    return !!e3 && z3.every(e3, (e4) => (Rt(e4), t2(e4)), gt);
  }
  static walkTests(t2, e3 = _pt.defaultRoot()) {
    e3 && z3.walk(e3, (e4, n2) => {
      t2(It(e4), n2);
    }, gt);
  }
  static hasRemainingTests(t2) {
    return _pt.someIncompleteTests((e3) => !t2 || mt(St.getData(e3), t2));
  }
  static pluckTests(t2, e3 = _pt.defaultRoot()) {
    e3 && z3.pluck(e3, (e4) => (Rt(e4), t2(e4)), gt);
  }
  static resetField(t2) {
    _pt.walkTests((e3) => {
      mt(St.getData(e3), t2) && St.reset(e3);
    }, _pt.defaultRoot());
  }
  static removeTestByFieldName(t2, e3 = _pt.defaultRoot()) {
    _pt.pluckTests((e4) => mt(St.getData(e4), t2), e3);
  }
};
function Dt() {
  const t2 = m2.useAvailableRoot(), e3 = X2.getOptionalFields(t2);
  if (P(e3))
    return;
  const n2 = /* @__PURE__ */ new Set();
  function s2(e4) {
    const { fieldName: s3 } = St.getData(e4);
    n2.has(s3) && (St.omit(e4), X2.setOptionalField(t2, s3, (t3) => Object.assign(Object.assign({}, t3), { applied: true })));
  }
  pt.walkTests((e4) => {
    if (St.isPending(e4))
      return;
    const { fieldName: r3 } = St.getData(e4);
    n2.has(r3) ? s2(e4) : function(e5) {
      const { fieldName: r4 } = St.getData(e5), i2 = X2.getOptionalField(t2, r4);
      true === m(i2.rule) && n2.add(r4);
      s2(e5);
    }(e4);
  }), W.useEmit($3.DONE_TEST_OMISSION_PASS);
}
function Ot() {
  const t2 = W.useBus();
  return e3($3.TEST_COMPLETED, (e4) => {
    if (St.isCanceled(e4))
      return;
    const { fieldName: n2 } = St.getData(e4);
    !function(t3) {
      const [e5] = st();
      t3 && !pt.hasRemainingTests(t3) && k(e5[t3]) && d(e5[t3]);
    }(n2), pt.hasRemainingTests() || t2.emit($3.ALL_RUNNING_TESTS_FINISHED);
  }), e3($3.TEST_RUN_STARTED, () => {
  }), e3($3.DONE_TEST_OMISSION_PASS, () => {
  }), e3($3.ALL_RUNNING_TESTS_FINISHED, () => {
    pt.someTests(St.isAsyncTest) && Dt(), function() {
      const [t3] = nt();
      d(t3);
    }();
  }), e3($3.RESET_FIELD, (t3) => {
    pt.resetField(t3);
  }), e3($3.SUITE_RUN_STARTED, () => {
    ot();
  }), e3($3.SUITE_CALLBACK_RUN_FINISHED, () => {
    Dt();
  }), e3($3.REMOVE_FIELD, (t3) => {
    pt.removeTestByFieldName(t3);
  }), e3($3.RESET_SUITE, () => {
    ot(), m2.reset();
  }), { subscribe: function(e4) {
    return t2.on("*", () => {
      e4();
    }).off;
  } };
  function e3(e4, n2) {
    t2.on(e4, (...t3) => {
      it(), n2(...t3);
    });
  }
}
var At;
function Ct(t2, e3) {
  const { groupName: n2 } = St.getData(t2), { groupName: s2, fieldName: r3 } = St.getData(e3);
  return mt(St.getData(t2), r3) && n2 === s2 && t2.key === e3.key;
}
pt.defaultRoot = m2.useAvailableRoot, function(t2) {
  t2.HOOK_CALLED_OUTSIDE = "hook called outside of a running suite.", t2.EXPECTED_VEST_TEST = "Expected value to be an instance of IsolateTest", t2.FIELD_NAME_REQUIRED = "Field name must be passed", t2.SUITE_MUST_BE_INITIALIZED_WITH_FUNCTION = "Suite must be initialized with a function", t2.PROMISIFY_REQUIRE_FUNCTION = "Vest.Promisify must be called with a function", t2.PARSER_EXPECT_RESULT_OBJECT = "Vest parser: expected argument at position 0 to be Vest's result object.", t2.WARN_MUST_BE_CALLED_FROM_TEST = "Warn must be called from within the body of a test function", t2.EACH_CALLBACK_MUST_BE_A_FUNCTION = "Each must be called with a function", t2.INVALID_PARAM_PASSED_TO_FUNCTION = 'Incompatible params passed to {fn_name} function. "{param}" must be of type {expected}', t2.TESTS_CALLED_IN_DIFFERENT_ORDER = `Vest Critical Error: Tests called in different order than previous run.
    expected: {fieldName}
    received: {prevName}
    This can happen on one of two reasons:
    1. You're using if/else statements to conditionally select tests. Instead, use "skipWhen".
    2. You are iterating over a list of tests, and their order changed. Use "each" and a custom key prop so that Vest retains their state.`, t2.UNEXPECTED_TEST_REGISTRATION_ERROR = "Unexpected error encountered during test registration.\n      Please report this issue to Vest's Github repository.\n      Test Object: {testObject}.\n      Error: {error}.", t2.UNEXPECTED_TEST_RUN_ERROR = "Unexpected error encountered during test run. Please report this issue to Vest's Github repository.\n      Test Object: {testObject}.", t2.INCLUDE_SELF = "Trying to call include.when on the same field.";
}(At || (At = {}));
var vt = n(function(t2, e3) {
  return St.getData(t2).groupName === e3;
});
function ht(t2) {
  return function(t3, e3) {
    return pt.someTests((n2) => Lt(n2, t3, e3));
  }(Et.ERRORS, t2);
}
function Lt(t2, e3, n2) {
  return !!St.hasFailures(t2) && (!_t(St.getData(t2), n2) && !function(t3, e4) {
    return A(t3 === Et.WARNINGS, St.warns(e4));
  }(e3, t2));
}
function Ut(t2) {
  const [e3] = z4();
  return e3 === t2;
}
function Ft(t2) {
  return Ut(x3.ONE) ? ht() : !!Ut(x3.EAGER) && ht(t2.fieldName);
}
function Gt(t2, e3, n2) {
  return n2 ? function(t3, e4, n3) {
    var s2;
    return (null === (s2 = null == t3 ? void 0 : t3[n3]) || void 0 === s2 ? void 0 : s2[e4]) || [];
  }(t2, e3, n2) : function(t3, e4) {
    const n3 = {}, s2 = Nt(e4);
    for (const r3 in t3)
      C(t3[r3][s2]) && (n3[r3] = t3[r3][e4] || []);
    return n3;
  }(t2, e3);
}
function bt(t2) {
  const e3 = { getError: function(e4) {
    return kt(Et.ERRORS, t2, e4);
  }, getErrors: function(e4) {
    return yt(t2, Et.ERRORS, e4);
  }, getErrorsByGroup: function(e4, n2) {
    return Wt(t2, Et.ERRORS, e4, n2);
  }, getWarning: function(e4) {
    return kt(Et.WARNINGS, t2, e4);
  }, getWarnings: function(e4) {
    return yt(t2, Et.WARNINGS, e4);
  }, getWarningsByGroup: function(e4, n2) {
    return Wt(t2, Et.WARNINGS, e4, n2);
  }, hasErrors: function(e4) {
    return Bt(t2, ft.ERROR_COUNT, e4);
  }, hasErrorsByGroup: function(e4, n2) {
    return wt(t2, ft.ERROR_COUNT, e4, n2);
  }, hasWarnings: function(e4) {
    return Bt(t2, ft.WARN_COUNT, e4);
  }, hasWarningsByGroup: function(e4, n2) {
    return wt(t2, ft.WARN_COUNT, e4, n2);
  }, isPending: function(e4) {
    var n2;
    return i(e4 ? null === (n2 = t2.tests[e4]) || void 0 === n2 ? void 0 : n2.pendingCount : t2.pendingCount, 0);
  }, isValid: function(e4) {
    var n2;
    return e4 ? Boolean(null === (n2 = t2.tests[e4]) || void 0 === n2 ? void 0 : n2.valid) : t2.valid;
  }, isValidByGroup: function(e4, n2) {
    const s2 = t2.groups[e4];
    if (!s2)
      return false;
    if (n2)
      return Mt(s2, n2);
    for (const t3 in s2)
      if (!Mt(s2, t3))
        return false;
    return true;
  } };
  return e3;
}
function yt(t2, e3, n2) {
  return Gt(t2.tests, e3, n2);
}
function Wt(t2, e3, n2, s2) {
  return Gt(t2.groups[n2], e3, s2);
}
function Mt(t2, e3) {
  var n2;
  return !!(null === (n2 = t2[e3]) || void 0 === n2 ? void 0 : n2.valid);
}
function wt(t2, e3, n2, s2) {
  var r3, i2;
  const o3 = t2.groups[n2];
  if (!o3)
    return false;
  if (s2)
    return C(null === (r3 = o3[s2]) || void 0 === r3 ? void 0 : r3[e3]);
  for (const t3 in o3)
    if (C(null === (i2 = o3[t3]) || void 0 === i2 ? void 0 : i2[e3]))
      return true;
  return false;
}
function Bt(t2, e3, n2) {
  var s2;
  const r3 = n2 ? null === (s2 = t2.tests[n2]) || void 0 === s2 ? void 0 : s2[e3] : t2[e3] || 0;
  return C(r3);
}
function kt(t2, e3, n2) {
  var s2;
  const r3 = e3[t2];
  return n2 ? null === (s2 = r3.find((t3) => mt(t3, n2))) || void 0 === s2 ? void 0 : s2.message : r3[0];
}
var jt;
var Kt;
var Vt;
var Xt = class {
  constructor() {
    this.errorCount = 0, this.warnCount = 0, this.testCount = 0, this.pendingCount = 0;
  }
};
var Ht = class extends Xt {
  constructor() {
    super(...arguments), this[jt] = [], this[Kt] = [], this.groups = {}, this.tests = {}, this.valid = false;
  }
};
jt = Et.ERRORS, Kt = Et.WARNINGS;
var xt = class _xt {
  constructor(t2, e3, n2) {
    this.fieldName = t2, this.message = e3, this.groupName = n2;
  }
  static fromTestObject(t2) {
    const { fieldName: e3, message: n2, groupName: s2 } = St.getData(t2);
    return new _xt(e3, n2, s2);
  }
};
function qt(t2) {
  return !!Z2(t2) || !pt.hasNoTests() && (!ht(t2) && (!function(t3) {
    return pt.someIncompleteTests((e3) => !_t(St.getData(e3), t3) && !Z2(t3));
  }(t2) && function(t3) {
    return pt.everyTest((e3) => zt(e3, t3));
  }(t2)));
}
function Yt(t2, e3) {
  return !!Z2(e3) || !function(t3, e4, n2) {
    return pt.someTests((s2) => !vt(s2, e4) && Lt(s2, t3, n2));
  }(Et.ERRORS, t2, e3) && (!function(t3, e4) {
    return pt.someIncompleteTests((n2) => !vt(n2, t3) && (!_t(St.getData(n2), e4) && !Z2(e4)));
  }(t2, e3) && function(t3, e4) {
    return pt.everyTest((n2) => !!vt(n2, t3) || zt(n2, e4));
  }(t2, e3));
}
function zt(t2, e3) {
  return !!_t(St.getData(t2), e3) || (St.isOmitted(t2) || St.isTested(t2) || function(t3) {
    const e4 = m2.useAvailableRoot(), { fieldName: n2 } = St.getData(t3);
    return X2.getOptionalField(e4, n2).type === H3.AUTO && St.awaitsResolution(t3);
  }(t2));
}
function Jt() {
  const t2 = new Ht();
  return pt.walkTests((e3) => {
    t2.tests = function(t3, e4) {
      const n2 = St.getData(e4).fieldName, s2 = Object.assign({}, t3);
      return s2[n2] = Zt(s2[n2], e4), s2[n2].valid = false !== s2[n2].valid && qt(n2), s2;
    }(t2.tests, e3), t2.groups = function(t3, e4) {
      const { groupName: n2, fieldName: s2 } = St.getData(e4);
      if (!n2)
        return t3;
      const r3 = Object.assign({}, t3);
      return r3[n2] = r3[n2] || {}, r3[n2][s2] = Zt(r3[n2][s2], e4), r3[n2][s2].valid = false !== r3[n2][s2].valid && Yt(n2, s2), r3;
    }(t2.groups, e3), t2.errors = Qt(Et.ERRORS, t2.errors, e3), t2.warnings = Qt(Et.WARNINGS, t2.warnings, e3);
  }), t2.valid = qt(), function(t3) {
    for (const e3 in t3.tests)
      t3.errorCount += t3.tests[e3].errorCount, t3.warnCount += t3.tests[e3].warnCount, t3.testCount += t3.tests[e3].testCount, t3.pendingCount += t3.tests[e3].pendingCount;
    return t3;
  }(t2);
}
function Qt(t2, e3, n2) {
  if (St.isOmitted(n2))
    return e3;
  return (t2 === Et.WARNINGS ? St.isWarning(n2) : St.isFailing(n2)) ? e3.concat(xt.fromTestObject(n2)) : e3;
}
function Zt(t2, e3) {
  const { message: n2 } = St.getData(e3), s2 = j(t2 ? Object.assign({}, t2) : null, $t);
  return St.isNonActionable(e3) || (St.isPending(e3) && s2.pendingCount++, St.isFailing(e3) ? r3(Et.ERRORS) : St.isWarning(e3) && r3(Et.WARNINGS), s2.testCount++), s2;
  function r3(t3) {
    const e4 = Nt(t3);
    s2[e4]++, n2 && (s2[t3] = (s2[t3] || []).concat(n2));
  }
}
function $t() {
  return O(new Xt(), { errors: [], valid: true, warnings: [] });
}
function te() {
  return t2 = () => {
    const t3 = Jt(), n2 = et().suiteName;
    return Object.freeze(O(t3, bt(t3), { suiteName: n2 }));
  }, (0, et().suiteResultCache)([rt()], t2);
  var t2;
}
function ee(t2, e3) {
  D3.create(k4, () => {
    q2.run({ omitted: ne() || m(t2, m(te)) }, e3);
  });
}
function ne() {
  return function() {
    var t2;
    return null !== (t2 = q2.useX().omitted) && void 0 !== t2 && t2;
  }();
}
function se(t2, e3) {
  D3.create(j4, () => {
    q2.run({ skipped: re() || m(t2, m(te)) }, e3);
  });
}
function re() {
  return function() {
    var t2;
    return null !== (t2 = q2.useX().skipped) && void 0 !== t2 && t2;
  }();
}
function ie(t2, e3) {
  return D3.create(w3, M, { focusMode: t2, match: p(e3).filter(S), matchAll: true === e3 });
}
!function(t2) {
  t2[t2.ONLY = 0] = "ONLY", t2[t2.SKIP = 1] = "SKIP";
}(Vt || (Vt = {}));
var oe = class {
  static isSkipFocused(t2, e3) {
    return (null == t2 ? void 0 : t2.data.focusMode) === Vt.SKIP && (le(t2, e3) || true === t2.data.matchAll);
  }
  static isOnlyFocused(t2, e3) {
    return (null == t2 ? void 0 : t2.data.focusMode) === Vt.ONLY && le(t2, e3);
  }
  static isIsolateFocused(t2) {
    return T2.isIsolateType(t2, w3);
  }
};
function ae(t2) {
  return ie(Vt.ONLY, ce(t2));
}
function ue(t2) {
  return ie(Vt.SKIP, ce(t2));
}
function ce(t2) {
  return false === t2 ? [] : t2;
}
function le(t2, e3) {
  var n2, s2;
  return q(null == t2 ? void 0 : t2.data.match) && (!e3 || (null === (s2 = null === (n2 = null == t2 ? void 0 : t2.data.match) || void 0 === n2 ? void 0 : n2.includes(e3)) || void 0 === s2 || s2));
}
function Ee(t2, e3) {
  return b(z3.findClosest(t2, (t3) => !!oe.isIsolateFocused(t3) && oe.isOnlyFocused(t3, e3)));
}
function fe(t2) {
  const { fieldName: e3 } = St.getData(t2);
  if (re())
    return true;
  const n2 = Y2(), s2 = function(t3) {
    return z3.findClosest(t3, (e4) => {
      var n3;
      if (!oe.isIsolateFocused(e4))
        return false;
      const { fieldName: s3 } = St.getData(t3);
      return (null === (n3 = e4.data.match) || void 0 === n3 ? void 0 : n3.includes(s3)) || e4.data.matchAll;
    });
  }(t2);
  if (oe.isSkipFocused(s2))
    return true;
  return !oe.isOnlyFocused(s2) && (!!Ee(t2) && !m(n2[e3], t2));
}
function de(t2, e3 = t2) {
  const n2 = St.getData(t2);
  return Ft(n2) ? (s2 = t2, St.skip(s2), s2) : (r3 = n2.fieldName, ne() || Z2(r3) ? function(t3) {
    return St.omit(t3), t3;
  }(t2) : fe(t2) ? function(t3) {
    return St.skip(t3, re()), t3;
  }(e3) : t2);
  var s2, r3;
}
function Ne(t2, e3) {
  const n2 = function(t3, e4) {
    const n3 = function(t4, e5) {
      if (_3.usesKey(t4))
        return It(j3.handleIsolateNodeWithKey(t4));
      if (j3.dropNextNodesOnReorder(Te, t4, e5))
        return function(t5, e6) {
          if (_3.canReorder(t5))
            return;
          $(G(At.TESTS_CALLED_IN_DIFFERENT_ORDER, { fieldName: St.getData(t5).fieldName, prevName: gt(e6) ? St.getData(e6).fieldName : void 0 }));
        }(t4, e5), t4;
      if (!gt(e5))
        return t4;
      if (St.isOmitted(e5))
        return t4;
      return e5;
    }(e4, t3);
    return de(e4, n3);
  }(e3, t2);
  return function(t3, e4, n3) {
    t3 === e4 && gt(e4) && (r3 = e4) !== (s2 = n3) && Ct(s2, r3) && St.isPending(s2) && St.cancel(s2);
    var s2, r3;
  }(n2, t2, e3), n2;
}
function Te(t2, e3) {
  return gt(e3) && !Ct(e3, t2);
}
function Se(t2, e3) {
  return gt(t2) && gt(e3) ? Ne(t2, e3) : null;
}
function ge(...t2) {
  const [e3, n2] = t2.reverse();
  return D3.create(B3, () => q2.run(Object.assign({}, n2 && { groupName: n2 }), e3));
}
function Re(t2) {
  w(S(t2));
  return Y2()[t2] = true, { when: function(e3) {
    w(e3 !== t2, At.INCLUDE_SELF);
    Y2()[t2] = function(t3) {
      return S(e3) ? Ee(t3, e3) : m(e3, m(te));
    };
  } };
}
function Ie(t2, e3, n2) {
  const s2 = Object.assign(Object.assign({}, { severity: dt.Error, status: ut.UNTESTED, abortController: new AbortController() }), { fieldName: e3.fieldName, testFn: e3.testFn });
  e3.groupName && (s2.groupName = e3.groupName), e3.message && (s2.message = e3.message);
  return D3.create(V3, t2, s2, null != n2 ? n2 : null);
}
function _e(t2) {
  if (de(t2), St.isUntested(t2))
    return function(t3) {
      const e3 = W.useBus(), n2 = function(t4) {
        return q2.run({ currentTest: t4 }, () => {
          let e4;
          const { message: n3, testFn: s2, abortController: r3 } = St.getData(t4);
          try {
            e4 = s2({ signal: r3.signal });
          } catch (s3) {
            (function(t5, e5) {
              return v(t5) && S(e5);
            })(n3, s3) && (St.getData(t4).message = s3), e4 = false;
          }
          return false === e4 && St.fail(t4), e4;
        });
      }(t3);
      try {
        _(n2) ? (St.getData(t3).asyncTest = n2, function(t4) {
          const { asyncTest: e4, message: n3 } = St.getData(t4);
          if (!_(e4))
            return;
          St.setPending(t4);
          const s2 = W.useBus(), r3 = m2.persist(() => {
            me(s2, t4);
          }), o3 = m2.persist((e5) => {
            St.isCanceled(t4) || (St.getData(t4).message = S(e5) ? e5 : n3, St.fail(t4), r3());
          });
          e4.then(r3, o3);
        }(t3)) : me(e3, t3);
      } catch (e4) {
        throw new Error(G(At.UNEXPECTED_TEST_REGISTRATION_ERROR, { testObject: JSON.stringify(t3), error: e4 }));
      }
    }(t2);
  St.isNonActionable(t2) || $(G(At.UNEXPECTED_TEST_REGISTRATION_ERROR, { testObject: JSON.stringify(t2) }));
}
function me(t2, e3) {
  St.pass(e3), t2.emit($3.TEST_COMPLETED, e3);
}
function pe(t2, ...e3) {
  const [n2, s2, r3] = N(e3[1]) ? e3 : [void 0, ...e3];
  !function(t3, e4) {
    const n3 = "test";
    w(S(t3), G(At.INVALID_PARAM_PASSED_TO_FUNCTION, { fn_name: n3, param: "fieldName", expected: "string" })), w(N(e4), G(At.INVALID_PARAM_PASSED_TO_FUNCTION, { fn_name: n3, param: "callback", expected: "function" }));
  }(t2, s2);
  const o3 = { fieldName: t2, groupName: q2.useX().groupName, message: n2, testFn: s2 };
  return W.useEmit($3.TEST_RUN_STARTED), Ie(_e, o3, r3);
}
var De = O(pe, { memo: function(t2) {
  return function(e3, ...n2) {
    const [s2, r3, i2] = n2.reverse();
    return function(t3, e4) {
      const n3 = q2.useX().testMemoCache, s3 = n3.get(t3);
      if (l(s3))
        return n3(t3, e4);
      const [, r4] = s3;
      if (St.isCanceled(r4))
        return n3.invalidate(t3), n3(t3, e4);
      return m2.addNodeToHistory(r4), r4;
    }([rt(), e3, m2.useCurrentCursor()].concat(s2), function() {
      return t2(e3, i2, r3);
    });
  };
}(pe) });
function Oe() {
  return { group: ge, include: Re, omitWhen: ee, only: ae, optional: Q2, skip: ue, skipWhen: se, test: De };
}
function Ae() {
  return Object.freeze(O({ done: m2.persist(Ce) }, te()));
}
function Ce(...t2) {
  const [n2, s2] = t2.reverse(), r3 = Ae();
  if (function(t3, e3, n3) {
    var s3, r4;
    return !!(!N(t3) || e(n3.testCount, 0) || e3 && e(null !== (r4 = null === (s3 = n3.tests[e3]) || void 0 === s3 ? void 0 : s3.testCount) && void 0 !== r4 ? r4 : 0, 0));
  }(n2, s2, r3))
    return r3;
  const i2 = () => n2(te());
  return pt.hasRemainingTests(s2) ? (function(t3, n3) {
    const [, s3] = st(), [, r4] = nt();
    n3 ? s3((s4) => O(s4, { [n3]: (s4[n3] || []).concat(t3) })) : r4((e3) => e3.concat(t3));
  }(i2, s2), r3) : (i2(), r3);
}
function ve(...t2) {
  const [s2, r3] = t2.reverse();
  !function(t3) {
    w(N(t3), At.SUITE_MUST_BE_INITIALIZED_WITH_FUNCTION);
  }(s2);
  const i2 = function({ suiteName: t3, VestReconciler: e3 }) {
    const s3 = { doneCallbacks: K.createTinyState(() => []), fieldCallbacks: K.createTinyState(() => ({})), suiteId: T(), suiteName: t3, suiteResultCache: tt };
    return m2.createRef(e3, s3);
  }({ suiteName: r3, VestReconciler: Se });
  function o3(...t3) {
    return q2.run({ suiteParams: t3 }, () => {
      return W.useEmit($3.SUITE_RUN_STARTED), e3 = function(t4, ...e4) {
        const n2 = W.useEmit();
        return () => (t4(...e4), n2($3.SUITE_CALLBACK_RUN_FINISHED), Ae());
      }(s2, ...t3), D3.create(K4, e3, { optional: {} });
      var e3;
    }).output;
  }
  return m2.Run(i2, () => {
    const t3 = Ot();
    return O(m2.persist(o3), Object.assign(Object.assign({ dump: m2.persist(() => m2.useAvailableRoot()), get: m2.persist(te), remove: W.usePrepareEmitter($3.REMOVE_FIELD), reset: W.usePrepareEmitter($3.RESET_SUITE), resetField: W.usePrepareEmitter($3.RESET_FIELD), resume: m2.persist(at), subscribe: t3.subscribe }, (n2 = m2.persist(te), { getError: (...t4) => n2().getError(...t4), getErrors: (...t4) => n2().getErrors(...t4), getErrorsByGroup: (...t4) => n2().getErrorsByGroup(...t4), getWarning: (...t4) => n2().getWarning(...t4), getWarnings: (...t4) => n2().getWarnings(...t4), getWarningsByGroup: (...t4) => n2().getWarningsByGroup(...t4), hasErrors: (...t4) => n2().hasErrors(...t4), hasErrorsByGroup: (...t4) => n2().hasErrorsByGroup(...t4), hasWarnings: (...t4) => n2().hasWarnings(...t4), hasWarningsByGroup: (...t4) => n2().hasWarningsByGroup(...t4), isPending: (...t4) => n2().isPending(...t4), isValid: (...t4) => n2().isValid(...t4), isValidByGroup: (...t4) => n2().isValidByGroup(...t4) })), Oe()));
    var n2;
  });
}
function Le(t2) {
  return O((...n2) => {
    const s2 = ve(t2), r3 = s2(...n2);
    return Object.freeze(O({ dump: s2.dump }, r3));
  }, Object.assign({}, Oe()));
}
var Pe = At.WARN_MUST_BE_CALLED_FROM_TEST;

// src/suite.ts
var suite = Le(
  (data = { title: "", description: "" }) => {
    De("title", "Username is required", () => {
      vn(data.title).isNotBlank();
    });
    De("title", "Username must be at lease 6 characters", () => {
      vn(data.title).longerThanOrEquals(6);
    });
    De("description", "Description is required", () => {
      vn(data.description).isNotBlank();
    });
  }
);
var suite_default = suite;

// src/index.tsx
var app = new Hono2();
app.use("/static/*", serveStatic({ root: "./" }));
app.get("/static/output.css", serveStatic({ path: "./src/assets/output.css" }));
app.get("/static/custom.css", serveStatic({ path: "./src/assets/custom.css" }));
app.get(
  "/static/htmx.min.js",
  serveStatic({ path: "./src/assets/htmx.min.js" })
);
app.get("/static/client.js", serveStatic({ path: "./src/assets/client.js" }));
app.get("/", (c3) => c3.html(/* @__PURE__ */ jsxDEV(Base, { children: "Todo" })));
app.get("/posts", async (c3) => {
  const posts2 = await getPosts();
  return c3.html(
    /* @__PURE__ */ jsxDEV(Base, { children: [
      /* @__PURE__ */ jsxDEV(Sidebar, { posts: posts2 }),
      /* @__PURE__ */ jsxDEV(EmptyPost, { message: "No post selected" })
    ] })
  );
});
app.get("/posts/add", async (c3) => {
  const posts2 = await getPosts();
  return c3.html(
    /* @__PURE__ */ jsxDEV(Base, { children: [
      /* @__PURE__ */ jsxDEV(Sidebar, { posts: posts2 }),
      /* @__PURE__ */ jsxDEV(
        CreatePost,
        {
          title: "Create a new post",
          action: "/posts/add",
          cancelHref: "/"
        }
      )
    ] })
  );
});
app.post("/posts/add", async (c3) => {
  const body = await c3.req.parseBody();
  const validationResult = suite_default(body);
  if (validationResult.isValid()) {
    console.log("valid");
  } else {
    console.log("invalid", validationResult.getErrors());
  }
  const id = await createPost(body);
  c3.header("HX-Location", `/posts/${id}`);
  return c3.text("ok");
});
app.get("/posts/:id/edit", async (c3) => {
  const id = c3.req.param("id");
  const post = await getPost(id);
  const posts2 = await getPosts();
  if (post) {
    return c3.html(
      /* @__PURE__ */ jsxDEV(Base, { children: [
        /* @__PURE__ */ jsxDEV(Sidebar, { posts: posts2, activePostId: id }),
        /* @__PURE__ */ jsxDEV(
          CreatePost,
          {
            title: "Edit post",
            post: { title: post.title, description: post.description },
            action: `/posts/${id}/edit`,
            cancelHref: `/posts/${id}`
          }
        )
      ] })
    );
  }
  return c3.html(
    /* @__PURE__ */ jsxDEV(Base, { children: [
      /* @__PURE__ */ jsxDEV(Sidebar, { posts: posts2 }),
      /* @__PURE__ */ jsxDEV(EmptyPost, { message: `Post with id ${id} not present` })
    ] })
  );
});
app.post("/posts/:id/edit", async (c3) => {
  const id = c3.req.param("id");
  const body = await c3.req.parseBody();
  await updatePost({ id, ...body });
  c3.header("HX-Location", `/posts/${id}`);
  return c3.text("ok");
});
app.get("/posts/:id", async (c3) => {
  const id = c3.req.param("id");
  const posts2 = await getPosts();
  const post = await getPost(id);
  const comments2 = await getComments(id);
  if (post) {
    return c3.html(
      /* @__PURE__ */ jsxDEV(Base, { children: [
        /* @__PURE__ */ jsxDEV(Sidebar, { posts: posts2, activePostId: id }),
        /* @__PURE__ */ jsxDEV(Post, { post, children: /* @__PURE__ */ jsxDEV(Comments, { comments: comments2 }) })
      ] })
    );
  }
  return c3.html(
    /* @__PURE__ */ jsxDEV(Base, { children: [
      /* @__PURE__ */ jsxDEV(Sidebar, { posts: posts2 }),
      /* @__PURE__ */ jsxDEV(EmptyPost, { message: `Post with id ${id} not present` })
    ] })
  );
});
app.delete("/posts/:id", async (c3) => {
  const id = c3.req.param("id");
  await deletePost(id);
  c3.header("HX-Location", "/posts");
  return c3.text("ok");
});
app.post("/posts/:id/comments", async (c3) => {
  const id = c3.req.param("id");
  const body = await c3.req.parseBody();
  const comment = await createComment({ postId: id, ...body });
  return c3.html(/* @__PURE__ */ jsxDEV(Comment, { comment }));
});
app.post("/fragment/search", async (c3) => {
  const body = await c3.req.parseBody();
  const result = await searchPosts(body.searchTerm);
  if (body.searchTerm === "" && result.length === 0) {
    return c3.html(/* @__PURE__ */ jsxDEV(EmptySidebarEntries, { message: "No posts present" }));
  } else if (result.length === 0) {
    return c3.html(
      /* @__PURE__ */ jsxDEV(EmptySidebarEntries, { message: `No results for ${body.searchTerm}` })
    );
  } else {
    return c3.html(/* @__PURE__ */ jsxDEV(SidebarEntries, { posts: result }));
  }
});
app.post("/posts/validate/title", async (c3) => {
  const body = await c3.req.parseBody();
  const validationResult = suite_default(body);
  if (validationResult.isValid("title")) {
    return c3.html(
      /* @__PURE__ */ jsxDEV("div", { id: "title-form-control", class: "form-control w-full", children: [
        /* @__PURE__ */ jsxDEV("label", { class: "label", children: /* @__PURE__ */ jsxDEV("span", { class: "label-text", children: "Name" }) }),
        /* @__PURE__ */ jsxDEV(
          "input",
          {
            value: body.title || "",
            type: "text",
            name: "title",
            placeholder: "Add a post name...",
            class: "input input-bordered",
            "hx-post": "/posts/validate/title",
            "hx-target": "#title-form-control",
            "hx-swap": "outerHTML"
          }
        )
      ] })
    );
  } else {
    const errors = validationResult.getErrors("title");
    return c3.html(
      /* @__PURE__ */ jsxDEV("div", { id: "title-form-control", class: "form-control w-full", children: [
        /* @__PURE__ */ jsxDEV("label", { class: "label", children: /* @__PURE__ */ jsxDEV("span", { class: "label-text", children: "Name" }) }),
        /* @__PURE__ */ jsxDEV(
          "input",
          {
            value: body.title || "",
            type: "text",
            name: "title",
            placeholder: "Add a post name...",
            class: "input input-bordered input-error",
            "hx-post": "/posts/validate/title",
            "hx-target": "#title-form-control",
            "hx-swap": "outerHTML"
          }
        ),
        /* @__PURE__ */ jsxDEV("label", { children: errors.map((error) => /* @__PURE__ */ jsxDEV("span", { class: "label-text text-red-700", children: error })) })
      ] })
    );
  }
});
serve(app);
