const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const mf = require('@angular-architects/module-federation/webpack');
const path = require('path');
const share = mf.share;

const sharedMappings = new mf.SharedMappings();
sharedMappings.register(
  path.join(__dirname, '../../tsconfig.json'),
  ['@essedum/shared-lib']
);

// Raw ModuleFederationPlugin — see modules/agent-studio/projects/agent-studio/webpack.config.js
// for why withModuleFederationPlugin is avoided (corrupts component styles).
module.exports = {
  output: {
    uniqueName: 'admin-console',
    publicPath: 'auto',
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 30000,
      maxSize: 2000000,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
    },
    runtimeChunk: false,
  },
  resolve: {
    alias: {
      ...sharedMappings.getAliases(),
    },
  },
  experiments: {
    outputModule: true,
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'admin-console',
      filename: 'remoteEntry.js',
      library: { type: 'module' },
      exposes: {
        './Module': './projects/admin-console/src/app/remote-entry/entry.module.ts',
      },
      shared: share({
        '@angular/core':            { singleton: true, strictVersion: false, requiredVersion: 'auto' },
        '@angular/common':          { singleton: true, strictVersion: false, requiredVersion: 'auto' },
        '@angular/common/http':     { singleton: true, strictVersion: false, requiredVersion: 'auto' },
        '@angular/router':          { singleton: true, strictVersion: false, requiredVersion: 'auto' },
        '@angular/forms':           { singleton: true, strictVersion: false, requiredVersion: 'auto' },
        '@angular/platform-browser':            { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        '@angular/platform-browser/animations': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        '@angular/animations':      { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        '@angular/material':        { singleton: true, strictVersion: false, requiredVersion: 'auto' },
        '@angular/cdk':             { singleton: true, strictVersion: false, requiredVersion: 'auto' },
        'rxjs':                     { singleton: true, strictVersion: true, requiredVersion: '^7.8.1' },
        'rxjs/operators':           { singleton: true, strictVersion: true, requiredVersion: '^7.8.1' },
        ...sharedMappings.getDescriptors(),
      }),
    }),
    sharedMappings.getPlugin(),
  ],
};
