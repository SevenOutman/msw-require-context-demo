// src/mocks/handlers.js
import { rest } from "msw";

// recursively require every .js file under ./api folder
const requireMockHandler = require.context("./api", true, /\.js$/);

export const handlers = requireMockHandler
  .keys()
  .reduce((allHandlers, path) => {
    const handlers = requireMockHandler(path).default;

    // map "./path/[to]/handlers.js" -> "/api/path/:to/handlers"
    const apiPath =
      "/api/" +
      path
        // trim "./" at start
        .replace(/^\.\//, "")
        // trim ".js" at end
        .replace(/\.[^/.]+$/, "")
        // replace "[param]" with ":param"
        .replace(/\[([^/]*)\]/g, ":$1");

    const pathHandlers = Object.getOwnPropertyNames(handlers).map((method) => {
      const handler = handlers[method];

      // for every method in handlers, register an msw handler
      if (method in rest) {
        return rest[method](apiPath, handler);
      }

      return undefined;
    });

    return [...allHandlers, ...pathHandlers];
  }, []);
