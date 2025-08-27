const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.transformer.babelTransformerPath = require.resolve('./src/lib/transformer.js');

config.resolver.sourceExts = [...config.resolver.sourceExts, 'md', 'mdx'];
config.resolver.assetExts = [...config.resolver.assetExts, 'avif'];

module.exports = config;
