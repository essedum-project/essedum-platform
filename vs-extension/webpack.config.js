//@ts-check

'use strict';

const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
const extensionConfig = {
  target: 'node', // VS Code extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
	mode: 'none', // this leaves the source code as close as possible to the original (when packaging we set this to 'production')

  entry: './src/extension.ts', // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
  output: {
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
    clean: true // Clean the output directory before emit
  },
  optimization: {
    minimize: true,
  },
  externals: {
    vscode: 'commonjs vscode' // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
    // modules added here also need to be added in the .vscodeignore file
  },
  resolve: {
    // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/app/pipeline/pipeline-cards.html',
          to: 'app/pipeline/pipeline-cards.html'
        },
        {
          from: 'src/app/pipeline/pipeline-cards.css',
          to: 'app/pipeline/pipeline-cards.css'
        },
        {
          from: 'src/app/pipeline/pipeline-cards-client.js',
          to: 'app/pipeline/pipeline-cards-client.js'
        },
        {
          from: 'src/app/pipeline-agent/pipeline-agent.html',
          to: 'app/pipeline-agent/pipeline-agent.html'
        },
        {
          from: 'src/app/pipeline-agent/pipeline-agent-client.js',
          to: 'app/pipeline-agent/pipeline-agent-client.js'
        },
        {
          from: 'src/constants/pipeline-agent-constants.js',
          to: 'constants/pipeline-agent-constants.js'
        },
        {
          from: 'src/app/pipeline-agent/pipeline-agent.css',
          to: 'app/pipeline-agent/pipeline-agent.css'
        },
        {
          from: 'src/auth/login/login-screen.html',
          to: 'auth/login/login-screen.html'
        },
        {
          from: 'src/auth/login/login-screen.css',
          to: 'auth/login/login-screen.css'
        },
        {
          from: 'src/auth/login/login-screen-client.js',
          to: 'auth/login/login-screen-client.js'
        },
        {
          from: 'src/auth/providers/login-fallback.html',
          to: 'auth/providers/login-fallback.html'
        },
        // Navigation screen files
        {
          from: 'src/app/navigation/navigation-screen.html',
          to: 'app/navigation/navigation-screen.html'
        },
        {
          from: 'src/app/navigation/navigation-screen.css',
          to: 'app/navigation/navigation-screen.css'
        },
        {
          from: 'src/app/navigation/navigation-screen-client.js',
          to: 'app/navigation/navigation-screen-client.js'
        },
        // Job logs viewer files
        {
          from: 'src/app/job-logs/job-logs-viewer.html',
          to: 'app/job-logs/job-logs-viewer.html'
        },
        {
          from: 'src/app/job-logs/job-logs-viewer.css',
          to: 'app/job-logs/job-logs-viewer.css'
        },
        {
          from: 'src/app/job-logs/job-logs-viewer-client.js',
          to: 'app/job-logs/job-logs-viewer-client.js'
        },
        {
          from: 'src/app/job-logs/job-log-details.html',
          to: 'app/job-logs/job-log-details.html'
        },
        {
          from: 'src/app/job-logs/job-log-details-client.js',
          to: 'app/job-logs/job-log-details-client.js'
        },
        {
          from: 'src/app/job-logs/console-logs.html',
          to: 'app/job-logs/console-logs.html'
        },
        {
          from: 'src/app/job-logs/console-logs-client.js',
          to: 'app/job-logs/console-logs-client.js'
        },
        {
          from: 'src/app/job-logs/output-artifacts.html',
          to: 'app/job-logs/output-artifacts.html'
        },
        // Media folder - copy all files
        {
          from: 'media',
          to: 'media'
        }
      ]
    })
  ],
  devtool: 'nosources-source-map',
  infrastructureLogging: {
    level: "log", // enables logging required for problem matchers
  },
};
module.exports = [ extensionConfig ];