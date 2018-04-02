const { join } = require('path');
const root = __dirname;
const src = join(root, 'src');
const view = join(src, 'view');
const model = join(src, 'model');
const basic = join(view, 'basic');
module.exports = {
  src,
  view,
  model,
  basic,
  test: join(root, 'test'),
  build: join(root, 'build'),
  public: join(root, 'public'),
  config: join(root, 'config')
};
