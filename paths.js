const { join } = require('path');
const root = __dirname;
const src = join(root, 'src');
const view = join(src, 'view');
const model = join(src, 'model');
const basic = join(view, 'basic');
const styles = join(src, 'styles');
const state = join(src, 'state');
const build = join(root, 'build');
const buildBackend = join(build, 'backend');
module.exports = {
  src,
  view,
  model,
  basic,
  styles,
  state,
  buildBackend,
  test: join(root, 'test'),
  build: join(root, 'build'),
  public: join(root, 'public'),
  config: join(root, 'config')
};
