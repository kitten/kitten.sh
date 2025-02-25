const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: true,
    inlineRequires: true,
  },
});

config.transformer.babelTransformerPath = require.resolve('./src/lib/transformer.js');

config.resolver.unstable_enablePackageExports = true;
config.resolver.sourceExts = [...config.resolver.sourceExts, 'md', 'mdx'];
config.resolver.assetExts = [...config.resolver.assetExts, 'avif'];

module.exports = config;
