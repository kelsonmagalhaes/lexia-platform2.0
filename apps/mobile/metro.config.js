const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');
const fs = require('fs');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

process.env.EXPO_ROUTER_APP_ROOT = path.resolve(projectRoot, 'app');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Mapear todos os pacotes Expo/RN para o node_modules raiz
const rootModules = path.resolve(workspaceRoot, 'node_modules');
const mobileModules = path.resolve(projectRoot, 'node_modules');

function resolveFrom(name) {
  const rootPath = path.join(rootModules, name);
  const mobilePath = path.join(mobileModules, name);
  if (fs.existsSync(mobilePath)) return mobilePath;
  if (fs.existsSync(rootPath)) return rootPath;
  return rootPath;
}

config.resolver.extraNodeModules = new Proxy({}, {
  get: (_, name) => resolveFrom(name),
});

module.exports = withNativeWind(config, { input: './src/global.css' });
