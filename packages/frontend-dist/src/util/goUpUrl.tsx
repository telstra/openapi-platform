/**
 * Removes trailing forward slashes from the given string.
 *
 * @param s The string to strip
 */
function stripSlashes(s: string) {
  for (let i = s.length - 1; i >= 0; i--) {
    if (s[i] !== '/') {
      return s.slice(0, i + 1);
    }
  }
  return '';
}

/**
 * Takes the given URL and goes up a directory a given number of times.
 *
 * @param url The URL to transform
 * @param up The number of times to go up a directory
 */
export function goUpUrl(url: string, up: number = 1) {
  let result = stripSlashes(url);
  for (let i = 0; i < up; i++) {
    result = result.slice(0, result.lastIndexOf('/'));
  }
  return result;
}
