const { resolve, join } = require('path')
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

const registerSW = config => {
    registerScript = join(__dirname, 'register.js')
    console.log(
        `> [PWA] auto register service worker with: ${resolve(registerScript)}`,
    )

    const entry = config.entry
    config.entry = async () =>
        entry().then(entries => {
            if (
                entries['main.js'] &&
                !entries['main.js'].includes(registerScript)
            ) {
                entries['main.js'].unshift(registerScript)
            }
            return entries
        })
}

const config = {
    assetPath: dev ? '' : `https://static-${projectId}.web.app`,
    distDir: '.next',
    register: false,
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
        registerSW(config)

        config.plugins = config.plugins || []
        config.plugins.push(
            new webpack.IgnorePlugin({
                resourceRegExp: /(?:^|\/)firebase-admin$/,
                contextRegExp: /.*/,
            }),
        )
        return config
    },
}

module.exports = withFonts(withCss(withSass(withPWA(config))))
