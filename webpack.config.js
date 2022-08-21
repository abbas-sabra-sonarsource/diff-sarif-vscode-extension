// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const CopyPlugin = require("copy-webpack-plugin");
const outputPath = require('path').join(__dirname, 'out');
const webpack = require('webpack');

const common = {
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
            'process.env.MY_ENV': JSON.stringify(process.env.MY_ENV),
            'process.env.IGNORE_MOBX_MINIFY_WARNING': JSON.stringify(process.env.IGNORE_MOBX_MINIFY_WARNING),
          }),
        new webpack.ProvidePlugin({
         Buffer: ['buffer', 'Buffer'],
         process: 'process/browser', // provide a shim for the global `process` variable

        }),
      ],
    resolve: {
        mainFields: ['browser', 'module', 'main'],
        extensions: ['.ts', '.js', '.tsx'], // support ts-files and js-files
        alias: {
        },
        fallback: {
            assert: require.resolve('assert'),
            buffer: require.resolve('buffer'),
            console: require.resolve('console-browserify'),
            constants: require.resolve('constants-browserify'),
            crypto: require.resolve('crypto-browserify'),
            domain: require.resolve('domain-browser'),
            events: require.resolve('events'),
            http: require.resolve('stream-http'),
            https: require.resolve('https-browserify'),
            os: require.resolve('os-browserify/browser'),
            path: require.resolve('path-browserify'),
            punycode: require.resolve('punycode'),
            process: require.resolve('process/browser'),
            querystring: require.resolve('querystring-es3'),
            stream: require.resolve('stream-browserify'),
            string_decoder: require.resolve('string_decoder'),
            sys: require.resolve('util'),
            timers: require.resolve('timers-browserify'),
            tty: require.resolve('tty-browserify'),
            url: require.resolve('url'),
            util: require.resolve('util'),
            vm: require.resolve('vm-browserify'),
            zlib: require.resolve('browserify-zlib'),
        },
      },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'ts-loader',
                    options: { transpileOnly: true }, // 4x speed increase, but no type checks.
                }],
            },
            {
                test: /\.s?css$/,
                use:  ['style-loader', 'css-loader', 'sass-loader'],
            },
            {
                test: /\.ttf$/,
                type: 'asset/resource'
            },
        ]
    },

    devtool: 'source-map', // 'inline-source-map' hits breakpoints more reliability, but inflate file size.
    output: {
        filename: '[name].js', // Default, consider omitting.
        path: outputPath,
    },

    stats: {
        all: false,
        assets: true,
        builtAt: true,
        errors: true,
        performance: true,
        timings: true,
    },
};

module.exports = [
    {
        ...common,
        name: 'Panel', // Ordered 1st for devServer. https://github.com/webpack/webpack/issues/1849
        entry: { panel: './src/panel/index.tsx' },
        output: {
            ...common.output,
            libraryTarget: 'umd',
            globalObject: 'this',
        },
        devServer : {
            client: {
                overlay: {
                    errors: true,
                    warnings: false, // Workaround for: "Module not found: Error: Can't resolve 'applicationinsights-native-metrics' in '.../node_modules/applicationinsights/out/AutoCollection'"
                },
            },
            static: {
                directory: __dirname, // Otherwise will default to /public
            },
            port: 8000
        },
        performance: {
            hints: 'warning',
            maxAssetSize: 400 * 1024,
            maxEntrypointSize: 400 * 1024,
        },
        plugins: [
            new CopyPlugin({
                patterns: [ 'src/panel/init.js' ],
            }),
        ],
    },
    {
        ...common,
        name: 'Context',
        entry: { context: './src/extension/index.ts' },
        output: {
            ...common.output,
            libraryTarget: 'commonjs2',
            devtoolModuleFilenameTemplate: '../[resource-path]' // https://code.visualstudio.com/api/working-with-extensions/bundling-extension#configure-webpack
        },
        target: 'webworker',
       
        externals: {
            vscode: 'commonjs vscode' // the vscode-module is created on-the-fly and must be excluded.
        },
    },
];
