//@ts-check

'use strict';

const path = require('path');
const StringReplacePlugin = require("string-replace-webpack-plugin");

let DEBUG_WEBPACK = !!process.env.DEBUG_WEBPACK;

/**@type {import('webpack').Configuration}*/
const config = {
  target: 'node', // vscode extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/

  entry: './src/extension.ts', // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
  output: {
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    path: path.resolve(__dirname, 'out'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
    devtoolModuleFilenameTemplate: '../[resource-path]'
  },
  devtool: 'source-map',
  externals: {
    vscode: 'commonjs vscode' // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
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
      },
      {
        test: /pysys-vscode-extension/,
        loader: StringReplacePlugin.replace({
            replacements: [
                {
                    // Rewrite references to resources so file-loader can process them.
                    //
                    // e.g. change this:
                    //   path.join(__dirname, '..', '..', '..', '..', 'resources', 'dark', 'Loading.svg')
                    //
                    //     to this:
                    //
                    // require(__dirname + '/..' + '/..' + '/..' + '/..' + '/resources' + '/dark' + '/Loading.svg')
                    //
                    pattern: /path.join\((__dirname|__filename),.*'resources',.*'\)/ig,
                    replacement: function (match, offset, string) {
                        let pathExpression = match.
                            replace(/path\.join\((.*)\)/, '$1').
                            replace(/\s*,\s*['"]/g, ` + '/`);
                        let requireExpression = `require(${pathExpression})`;
                        let resolvedExpression = `path.resolve(__dirname, ${requireExpression})`;

                        return requireExpression;
                    }
                }
            ]
        })
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
                name: '[path][name].[ext]'
            }
          }
        ],
      },
    ]
  }
};
module.exports = config;