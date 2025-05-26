const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  // Make sure environment variables are properly loaded
  chainWebpack: config => {
    config.plugin('define').tap(args => {
      Object.keys(process.env).forEach(key => {
        if (key.startsWith('VUE_APP_')) {
          args[0]['process.env'][key] = JSON.stringify(process.env[key])
        }
      })
      return args
    })
  }
})
