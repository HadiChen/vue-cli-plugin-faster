import type HardSourceWebpackPlugin from 'hard-source-webpack-plugin';
import type * as webpack from 'webpack';

export interface IFasterOpts {
  disabled?: boolean;
  target?: string | string[];
  hardSourceWebpackPluginOption?: Options | false;
  excludeModulePluginOption?: HardSourceWebpackPlugin.ExcludeModulePlugin.Option | HardSourceWebpackPlugin.ExcludeModulePlugin.Option[];
}

export type WebpackConfiguration = (webpackConfig?: webpack.Configuration) => string;

export interface Options {
  cacheDirectory?: string;
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
