import type { UserConfigExport } from "@tarojs/cli"
import TerserWebpackPlugin from "terser-webpack-plugin"

export default {
   logger: {
    quiet: false,
    stats: true
  },
  mini: {
    webpackChain(chain) {
      chain.merge({
        plugin: {
          install: {
            plugin: TerserWebpackPlugin,
            args: [
              {
                terserOptions: {
                  compress: true,
                  keep_classnames: true,
                  keep_fnames: true
                }
              }
            ]
          }
        }
      })
    }
  },
  h5: {}
} satisfies UserConfigExport<'webpack5'>
