module.exports = {
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/config/'],
  transform: {
    '^.+\\.tsx?$': './backend.transform.js',
  },
  resetModules: true,
  resetMocks: true,
};
