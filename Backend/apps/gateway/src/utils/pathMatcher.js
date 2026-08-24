/**
 * Checks whether `relativePath` (the request path with the service prefix
 * already stripped) matches one of a service's declared public paths.
 *
 * Supports:
 *  - exact match:      '/login'  matches  '/login'
 *  - wildcard suffix:  '/public/*' matches '/public/anything/here'
 */
function isPublicPath(relativePath, publicPaths = []) {
  return publicPaths.some((pattern) => {
    if (pattern.endsWith('*')) {
      const base = pattern.slice(0, -1);
      return relativePath.startsWith(base);
    }
    return relativePath === pattern || relativePath === `${pattern}/`;
  });
}

module.exports = { isPublicPath };
