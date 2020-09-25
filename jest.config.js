module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts?(x)'],
  coveragePathIgnorePatterns: ['/__tests__/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  modulePathIgnorePatterns: ['<rootDir>/dist'],
  setupFilesAfterEnv: ['./jest.setup.js'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  testRegex: '((\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^~/(.+)': '<rootDir>/src/$1',
    '\\.css$': 'identity-obj-proxy',
  },
  globals: {
    'ts-jest': {
      diagnostics: false,
      // compiler: 'ttypescript',
      tsConfig: 'tsconfig.server.json',
    },
  },
}
