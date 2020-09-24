const { resolve } = require('path')
const webpack = require('webpack')
const withPWA = require('next-pwa')
const withFonts = require('next-fonts')
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  distDir: '.next',
  pwa: {
    disable: process.env.NODE_ENV === 'development',
    dest: 'public',
  },
  sassOptions: {
    includePaths: [resolve(__dirname, './node_modules')],
  },

  /**
   * @param {webpack.Configuration} [config]
   */
  webpack(config) {
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /(?:^|\/)firebase-admin$/,
        contextRegExp: /.*/,
      }),
    )

    return config
  },
}

module.exports = withPWA(withFonts(withBundleAnalyzer(nextConfig)))
