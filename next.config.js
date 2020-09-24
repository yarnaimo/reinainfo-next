const { resolve } = require('path')
const withYarnaimoConfig = require('@yarnaimo/next-config')

const nextConfig = {
  distDir: '.next',
  pwa: {
    dest: 'public',
    register: false,
  },
  experimental: {
    publicDirectory: true,
  },
  sassLoaderOptions: {
    sassOptions: {
      includePaths: [resolve(__dirname, './node_modules')],
    },
  },
}

module.exports = withYarnaimoConfig(nextConfig)
