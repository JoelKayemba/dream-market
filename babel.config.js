module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@store': './src/store',
            '@theme': './src/theme',
            '@hooks': './src/hooks',
            '@utils': './src/utils',
            '@api': './src/api',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};




















