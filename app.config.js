module.exports = ({ config }) => {
  const mapsKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY?.trim();

  if (!mapsKey) return config;

  return {
    ...config,
    android: {
      ...config.android,
      config: {
        ...config.android?.config,
        googleMaps: {
          ...config.android?.config?.googleMaps,
          apiKey: mapsKey,
        },
      },
    },
  };
};
