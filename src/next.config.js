const { resolve } = require('path')
const { readFileSync } = require('fs')
const webpack = require('webpack')

const withSass = require('@zeit/next-sass')
const withCss = require('@zeit/next-css')
const withPWA = require('next-pwa')
const withFonts = require('next-fonts')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

const firebaserc = JSON.parse(
    readFileSync(resolve(__dirname, '../.firebaserc'), 'utf8'),
)
const projectId = firebaserc.projects.default
const dev = process.env.NODE_ENV !== 'production'

module.exports = withFonts(
    withCss(
        withSass(
            withPWA({
                assetPath: dev ? '' : `https://static-${projectId}.web.app`,
                distDir: '.next',
                pwa: {
                    dest: 'public',
                },
                experimental: {
                    publicDirectory: true,
                },
                sassLoaderOptions: {
                    includePaths: [resolve(__dirname, '../node_modules')],
                },
                /**
                 * @param {webpack.Configuration} [config]
                 */
                webpack: config => {
                    config.plugins = config.plugins || []

                    config.plugins.push(
                        new webpack.IgnorePlugin({
                            resourceRegExp: /(?:^|\/)firebase-admin$/,
                            contextRegExp: /.*/,
                        }),
                        // new webpack.IgnorePlugin({
                        //     resourceRegExp: /^got$/,
                        //     contextRegExp: /.*/,
                        // }),
                        // new BundleAnalyzerPlugin(),
                    )
                    return config
                },
            }),
        ),
    ),
)
