# vue-cli-plugin-faster

> Vue CLI plugin to use [esbuild](https://esbuild.github.io/) and [hard-source-webpack-plugin](https://github.com/mzgoddard/hard-source-webpack-plugin#readme)

## 简单配置

```ts
interface FasterOpts {
  // 是否开启该插件，true为禁用
  disabled?: boolean;
  // 默认['es2015']
  target?: string | string[];
  // hard-source-webpack-plugin的配置
  hardSourceWebpackPluginOption?: any;
  // hard-source-webpack-plugin excludeModulePlugin的配置
  excludeModulePluginOption?: any
}

// vue.config.js

module.exports = {
  pluginOptions: {
    faster: {}
  }
}
```
