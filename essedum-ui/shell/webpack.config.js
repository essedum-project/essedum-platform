const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const mf = require("@angular-architects/module-federation/webpack");
const path = require("path");
const share = mf.share;

const sharedMappings = new mf.SharedMappings();
sharedMappings.register(
  path.join(__dirname, 'tsconfig.json'),
  ['@essedum/shared-lib']
);

module.exports = {
  output: {
    uniqueName: "shell",
    publicPath: "auto"
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
    runtimeChunk: false
  },
  resolve: {
    alias: {
      ...sharedMappings.getAliases(),
    },
    fallback: {
      "buffer": require.resolve("buffer/")
    }
  },
  experiments: {
    outputModule: true
  },
  plugins: [
    new ModuleFederationPlugin({
      library: { type: "module" },

      // Host: remotes are loaded dynamically via manifest (mf.manifest.json).
      // No static remotes block is required when using `type: 'manifest'` in loadRemoteModule.
      remotes: {},

      shared: share({
        "@angular/core":        { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        "@angular/common":      { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        "@angular/common/http": { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        "@angular/router":      { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        "@angular/forms":       { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        "@angular/material":    { singleton: true, strictVersion: false, requiredVersion: 'auto' },
        "@angular/cdk":         { singleton: true, strictVersion: false, requiredVersion: 'auto' },
        "primeng":              { singleton: true, strictVersion: false, requiredVersion: 'auto' },
        "@essedum/shared-lib":  { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        'rxjs':                 { singleton: true, strictVersion: true, requiredVersion: '^7.8.1' },
        'rxjs/operators':       { singleton: true, strictVersion: true, requiredVersion: '^7.8.1' },
        ...sharedMappings.getDescriptors()
      })

    }),
    sharedMappings.getPlugin()
  ],
};
