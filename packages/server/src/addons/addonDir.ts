import { join } from 'path';
/**
 * The method really only exists so you can mock the addon directory
 */
export function addonDir() {
  return join(process.cwd(), 'addons');
}
