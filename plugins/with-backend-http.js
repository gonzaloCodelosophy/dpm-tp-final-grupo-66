const { withAndroidManifest } = require('expo/config-plugins');

// El backend de desarrollo usa HTTP en la red local.
module.exports = function withBackendHttp(config) {
  return withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application?.[0];

    if (application) {
      const usaHttp = process.env.EXPO_PUBLIC_API_URL?.startsWith('http://') === true;

      application.$['android:usesCleartextTraffic'] = String(usaHttp);
    }

    return config;
  });
};
