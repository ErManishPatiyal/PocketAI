const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

/**
 * Metro configuration for the PocketAI monorepo example app.
 * Watches the workspace so @pocketai/sdk resolves from packages/sdk.
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [workspaceRoot],
  resolver: {
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(workspaceRoot, 'node_modules'),
    ],
    extraNodeModules: {
      '@pocketai/sdk': path.resolve(workspaceRoot, 'packages/sdk'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(projectRoot), config);
