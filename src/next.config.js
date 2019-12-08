const { resolve } = require('path')
const { readFileSync } = require('fs')
const withYarnaimoConfig = require('@yarnaimo/next-config')

const firebaserc = JSON.parse(
    readFileSync(resolve(__dirname, '../.firebaserc'), 'utf8'),
)
const projectId = firebaserc.projects.default
const dev = process.env.NODE_ENV !== 'production'

const nextConfig = {
    // assetPrefix: dev ? '' : `https://static-${projectId}.web.app`,
    distDir: '.next',
    pwa: {
        dest: 'public',
        register: false,
    },
    experimental: {
        publicDirectory: true,
    },
    sassLoaderOptions: {
        includePaths: [resolve(__dirname, '../node_modules')],
    },
}

module.exports = withYarnaimoConfig(nextConfig)
