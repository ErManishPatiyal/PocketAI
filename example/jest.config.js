module.exports = {
  preset: '@react-native/jest-preset',
  moduleNameMapper: {
    '^@pocketai/sdk$': '<rootDir>/../packages/sdk/src/index.ts',
  },
};
