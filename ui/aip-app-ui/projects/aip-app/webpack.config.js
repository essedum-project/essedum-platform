const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = {
  ...withModuleFederationPlugin({
    name: 'aip-app',
    exposes: {
      './Component': './projects/aip-app/src/app/aip.module.ts',
    },

    shared: {
      ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
      'rxjs': { singleton: true, strictVersion: true, requiredVersion: '^7.8.1' },
      'rxjs/operators': { singleton: true, strictVersion: true, requiredVersion: '^7.8.1' },

    },

  }),

  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 30000,
      maxSize: 1000000,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
    },
    runtimeChunk: false
  },
};
