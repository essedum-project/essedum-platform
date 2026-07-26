const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const mf = require('@angular-architects/module-federation/webpack');
const path = require('path');
const share = mf.share;

// Map @essedum/shared-lib (consumed via tsconfig path mapping, not as an installed
// npm package) into the federation share graph so the same instance is reused
// across host + MFEs.
const sharedMappings = new mf.SharedMappings();
sharedMappings.register(
  path.join(__dirname, '../../tsconfig.json'),
  ['@essedum/shared-lib']
);

// Use the raw ModuleFederationPlugin (matching the host's webpack.config.js) instead
// of withModuleFederationPlugin. The high-level wrapper's auto-configured
// splitChunks interacts badly with Angular's component-style extraction in this
// build pipeline — component `styles:` arrays end up containing webpack runtime
// JS (rxjs module wrapper) instead of the compiled CSS, breaking all
// component-level styling. The explicit config below matches the host and produces
// clean component styles.
module.exports = {
  output: {
    uniqueName: 'integration-hub',
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
      name: 'integration',
      filename: 'remoteEntry.js',
      library: { type: 'module' },
      exposes: {
        './Module': './projects/integration-hub/src/app/remote-entry/entry.module.ts',
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
