const { join } = require('path');
const root = __dirname;
module.exports = {
  src: join(root, 'src'),
  test: join(root, 'test'),
  build: join(root, 'build'),
  public: join(root, 'public'),
  config: join(root, 'config')
};
