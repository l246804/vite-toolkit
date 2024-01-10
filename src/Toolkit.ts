import { cwd, env } from 'node:process'
import { type ConfigEnv, loadEnv } from 'vite'
import type { Env, Transformer } from './transformEnv'
import { transformEnv } from './transformEnv'
import { transformProxy } from './transformProxy'
import { flattenEnv } from './flattenEnv'

export interface ToolkitOptions<VE extends Env> {
  /**
   * 允许通过 `loadEnv` 加载的环境变量挂载至 `process.env`
   *
   * ***注意：由于 `process.env` 值均为 `string`，非 `string` 类型的数据将使用 `JSON.stringify` 序列化！***
   *
   * @example
   * ```ts
   * const env = { a: 1, b: [{c: 2}], d: null, e: '4' }
   *
   * // 挂载后
   * process.env
   * // a => '1'
   * // b => '[{"c":2}]'
   * // d => 'null'
   * // e => '4'
   * ```
   * @default false
   */
  allowMountToProcessEnv?: boolean
  /**
   * `Vite` 环境变量转换器，用于手动转换指定环境变量值
   * @default
   * ```ts
   * try {
   *   return new Function(`return ${value}`)()
   * } catch (e) {
   *   return value
   * }
   * ```
   */
  envTransformer?: Transformer<VE>
}

export class Toolkit<VE extends Env> {
  private static _instance

  /**
   * 配置项
   */
  options: Required<ToolkitOptions<VE>>

  constructor(
    public configEnv: ConfigEnv,
    options: ToolkitOptions<VE> = {},
  ) {
    this.options = {
      allowMountToProcessEnv: false,
      envTransformer: {},
      ...options,
    } as Required<ToolkitOptions<VE>>
  }

  /**
   * 创建唯一实例
   */
  static createInstance<VE extends Env>(configEnv: ConfigEnv, options: ToolkitOptions<VE> = {}) {
    if (!Toolkit._instance) Toolkit._instance = new Toolkit(configEnv, options)
    return Toolkit._instance
  }

  /**
   * 获取唯一实例
   */
  static getInstance<VE extends Env>(): Toolkit<VE> | null {
    return Toolkit._instance
  }

  /**
   * 加载环境变量，同 `vite.loadEnv`
   */
  loadEnv(mode = this.configEnv.mode, envDir = cwd(), prefixes?: string | string[]) {
    const { allowMountToProcessEnv, envTransformer } = this.options
    const viteEnv = loadEnv(mode, envDir, prefixes) as VE
    return transformEnv(viteEnv, allowMountToProcessEnv, envTransformer)
  }

  /**
   * 获取当前模式
   */
  getMode() {
    return this.configEnv.mode
  }

  /**
   * 判断当前模式是否为指定模式
   */
  eqMode(mode: string) {
    return this.getMode() === mode
  }

  /**
   * 判断指定模式是否为内置模式
   *
   * 内置模式：
   * - `development`
   * - `production`
   */
  isBuiltinMode(mode = this.getMode()) {
    return ['development', 'production'].includes(mode)
  }

  /**
   * 获取 `NODE_ENV`
   */
  getNodeEnv() {
    return env.NODE_ENV
  }

  /**
   * 判断当前环境是否为指定环境
   */
  eqNodeEnv(nodeEnv: string) {
    return env.NODE_ENV === nodeEnv
  }

  /**
   * 是否为生产环境
   */
  isProd() {
    return this.eqNodeEnv('production')
  }

  /**
   * 是否为开发环境
   */
  isDev() {
    return !this.isProd()
  }

  /**
   * 获取当前执行命令
   */
  getCommand() {
    return this.configEnv.command
  }

  /**
   * 判断当前执行命令是否为指定命令
   */
  eqCommand(cmd: ConfigEnv['command']) {
    return this.getCommand() === cmd
  }

  /**
   * 是否为 `build` 命令
   */
  isBuild() {
    return this.eqCommand('build')
  }

  /**
   * 是否为 `serve` 命令
   */
  isServe() {
    return this.eqCommand('serve')
  }

  flattenEnv = flattenEnv

  transformProxy = transformProxy
}

export function createToolkit<VE extends Env>(configEnv: ConfigEnv, options?: ToolkitOptions<VE>) {
  return new Toolkit<VE>(configEnv, options)
}
