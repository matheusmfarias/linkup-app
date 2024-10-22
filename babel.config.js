module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Adicione plugins aqui se necessário
    ],
  };
};
