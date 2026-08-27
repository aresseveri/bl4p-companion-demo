const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Her brand fonts are woff2. Metro does not treat that as an asset by default,
// so requiring them from expo-font fails with "extension is not registered".
if (!config.resolver.assetExts.includes('woff2')) {
  config.resolver.assetExts.push('woff2');
}

module.exports = config;
