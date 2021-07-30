import * as webpack from 'webpack';
import { ServicePlugin, ProjectOptions, PluginAPI } from '@vue/cli-service';
import Config from 'webpack-chain';
import { ESBuildMinifyPlugin } from 'esbuild-loader';
import nodeObjectHash from 'node-object-hash';
import HardSourceWebpackPlugin, { ExcludeModulePlugin } from 'hard-source-webpack-plugin';

const esbLoaderPkg = require('esbuild-loader/package.json');
const tsPkg = require('typescript/package.json');

interface IFasterOpts {
  disabled?: boolean;
  target?: string | string[];
  hardSourceWebpackPluginOption?: Options;
  excludeModulePluginOption?: HardSourceWebpackPlugin.ExcludeModulePlugin.Option | HardSourceWebpackPlugin.ExcludeModulePlugin.Option[]
}

type WebpackConfiguration = (webpackConfig?: webpack.Configuration) => string;

interface Options {
  cacheDirectory?: string | undefined;
  configHash?: string | WebpackConfiguration;
  environmentHash?: {
    root: string;
    directories: string[];
    files: string[];
  };
  info?: {
    mode: 'none' | 'test';
    level: 'debug' | 'log' | 'info' | 'warn' | 'error';
  };
  cachePrune?: {
    maxAge: number;
    sizeThreshold: number;
  };
}

function getOptions (options: ProjectOptions): IFasterOpts {
  const fasterOpts = (options.pluginOptions as any)?.faster || {};
  return fasterOpts;
}

function configRuleJs(jsRule: Config.Rule<Config.Module>, api: PluginAPI, target: string | string[]) {
  jsRule.uses
    .delete('thread-loader')
    .delete('babel-loader');

  jsRule.use('cache-loader')
    .loader(require.resolve('cache-loader'))
    .options(api.genCacheConfig('js-esbuild-loader', {
        target,
        esbuildLoaderVersion: require('esbuild-loader/package.json').version,
    }));

  jsRule
    .use('esbuild-loader')
    .loader('esbuild-loader')
    .options({
        target,
    });
}

function configureMinimizer (config: Config, target: string | string[]) {
   /** 忽略ts警告 */
  const minimizers = (config.optimization as any).minimizers as any;

  if (minimizers) {
    minimizers.delete('terser');
  }

  config.optimization.minimizer('esbuild-minify')
    .use(ESBuildMinifyPlugin, [{
      target,
    }]);
}

function configRuleTs (tsRule: Config.Rule<Config.Module>, api: PluginAPI, target: string | string[]) {
  tsRule.uses
    .delete('thread-loader')
    .delete('babel-loader')
    .delete('ts-loader');
  tsRule.use('cache-loader')
    .loader(require.resolve('cache-loader'))
    .options(api.genCacheConfig('ts-esbuild-loader', {
      target,
      esbuildLoaderVersion: esbLoaderPkg.version,
      typescriptVersion: tsPkg.version,
    }, 'tsconfig.json'));

  tsRule
    .use('esbuild-loader')
    .loader('esbuild-loader')
    .options({
      target,
      loader: 'ts',
    });
}

const fasterPlugin: ServicePlugin = (api, options) => {
  const fasterOpts = getOptions(options);
  const target = fasterOpts.target || ['es2015'];
  const excludeModulePluginOption = fasterOpts.excludeModulePluginOption;
  const hardSourceWebpackPluginOption = fasterOpts.hardSourceWebpackPluginOption || {};

  if (fasterOpts.disabled === true) return;

  api.chainWebpack((config) => {
    const jsRule = config.module.rule('js').test(/\.m?jsx?$/);
    const tsRule = config.module.rules.get('ts');

    configRuleJs(jsRule, api, target);

    if (tsRule) {
      configRuleTs(tsRule, api, target);
    }
    configureMinimizer(config, target);
  })

  api.configureWebpack((config) => {
    config.plugins?.push(
      new HardSourceWebpackPlugin(Object.assign({
        configHash(webpackConfig: WebpackConfiguration) {
          return nodeObjectHash({ sort: false }).hash(webpackConfig);
        },
        environmentHash: {
          root: process.cwd(),
          directories: [],
          files: ['package-lock.json', 'yarn.lock'],
        },
      }, hardSourceWebpackPluginOption)),
    );

    if (excludeModulePluginOption) {
      config.plugins?.push(
        new ExcludeModulePlugin(excludeModulePluginOption),
      );
    }
  })
};

export = fasterPlugin;
