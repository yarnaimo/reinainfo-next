module.exports = {
  ...require('@yarnaimo/tss/jest.config.js'),
  roots: ['<rootDir>/src', '<rootDir>/server'],
  setupFilesAfterEnv: [
    '<rootDir>/node_modules/@yarnaimo/tss/jest.setup.js',
    '<rootDir>/jest.setup.js',
  ],
}
