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
