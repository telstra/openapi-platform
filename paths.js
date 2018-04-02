const { join } = require('path');
const root = __dirname;
const src = join(root, 'src');
const view = join(src, 'view');
module.exports = {
  src: src,
  view: view,
  test: join(root, 'test'),
  build: join(root, 'build'),
  public: join(root, 'public'),
  config: join(root, 'config')
};
