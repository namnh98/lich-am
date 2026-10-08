module.exports = function configureBabel(api) {
  api.cache(true);
  const babelPresetExpo = (() => {
    try {
      return require.resolve("babel-preset-expo");
    } catch {
      return require.resolve("babel-preset-expo", {
        paths: [require.resolve("expo/package.json", { paths: [__dirname] })],
      });
    }
  })();

  return {
    presets: [babelPresetExpo],
  };
};
