const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);

// CBOR-X
// metro.config.js
// const { getDefaultConfig } = require('metro-config');

// module.exports = (async () => {
//   const config = await getDefaultConfig();

//   config.resolver.extraNodeModules = {
//     stream: require.resolve('stream-browserify'),
//     buffer: require.resolve('buffer'),
//     util: require.resolve('util'),
//     process: require.resolve('process/browser'),
//   };

//   return config;
// })();