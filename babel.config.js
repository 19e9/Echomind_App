module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo', // Expo için gerekli preset
      ['@babel/preset-react', { runtime: 'automatic' }] // Modern JSX
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './', // "@/components/..." gibi importları çalıştırır
          },
        },
      ],
    ],
  };
};
