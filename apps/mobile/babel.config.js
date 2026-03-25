module.exports = function (api) {
  api.cache(true);

  const isWeb = process.env.EXPO_TARGET === 'web' ||
    process.env.RCT_METRO_FOCUS === 'web';

  const plugins = [
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@': './src',
          '@shared': '../../shared/src',
        },
      },
    ],
  ];

  if (!isWeb) {
    plugins.push('react-native-reanimated/plugin');
  }

  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
    ],
    plugins,
  };
};
