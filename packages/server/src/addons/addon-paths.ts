import { join } from 'path';
/**
 * The method really only exists so you can mock the addon directory.
 * It's the file without the extension
 */
export function addonsBasePath() {
  return join(process.cwd(), 'openapi-platform-server.addons');
}

export function addonsPath() {
  return addonsBasePath() + '.js';
}
