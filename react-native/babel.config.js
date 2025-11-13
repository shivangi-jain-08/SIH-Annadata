module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-worklets/plugin', ['module:react-native-dotenv', {
      envName: 'APP_ENV',
      moduleName: '@env',
      path: '.env',
      blocklist: null,
      allowlist: ['GEMINI_API_KEY', 'WEATHER_API_KEY', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'],
      safe: false,
      allowUndefined: false,
      verbose: true,
    }]],

  };
};
