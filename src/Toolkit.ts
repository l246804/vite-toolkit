import { cwd } from 'node:process'
import { type ConfigEnv, loadEnv } from 'vite'
import { merge } from 'lodash-es'
import { BASE_MODE_MAPPING } from './modeMapping'
import type { BaseModeMapping, ModeMapping, ModeMappingKey } from './modeMapping'
import type { Transformer, ViteEnv } from './transformEnv'
import { transformEnv } from './transformEnv'

export interface ToolkitOptions<VE extends ViteEnv, MM extends ModeMapping = ModeMapping> {
  /**
   * `Vite` 的 `mode` 映射
   * @default
   * ```ts
   * {
   *   dev: 'development',
   *   prod: 'production',
   *   test: 'test'
   * }
   * ```
   */
  modeMapping?: MM & Partial<BaseModeMapping>
  /**
   * 允许通过 `loadEnv` 加载的环境变量挂载至 `process.env`
   *
   * ***注意：由于 `process.env` 值均为 `string`，除过 `string` 类型的数据将使用 `JSON.stringify` 序列化！***
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

export class Toolkit<VE extends ViteEnv, MM extends ModeMapping = ModeMapping> {
  private static _instance

  options: Required<ToolkitOptions<VE, MM>>

  constructor(
    public configEnv: ConfigEnv,
    options?: ToolkitOptions<VE, MM>,
  ) {
    this.options = merge(
      {},
      {
        allowMountToProcessEnv: false,
        envTransformer: {},
        modeMapping: BASE_MODE_MAPPING,
      },
      options,
    ) as Required<ToolkitOptions<VE, MM>>
  }

  /**
   * 创建唯一实例
   */
  static createInstance<VE extends ViteEnv, MM extends ModeMapping>(
    configEnv: ConfigEnv,
    options?: ToolkitOptions<VE, MM>,
  ) {
    if (!this._instance) this._instance = new Toolkit(configEnv, options)
    return this._instance
  }

  /**
   * 获取唯一实例
   */
  static getInstance<VE extends ViteEnv, MM extends ModeMapping>(): Toolkit<VE, MM> | null {
    return this._instance
  }

  /**
   * 加载环境变量，同 `vite.loadEnv`
   */
  loadEnv(mode = this.configEnv.mode, envDir = cwd(), prefixes?: string | string[]) {
    const { allowMountToProcessEnv, envTransformer } = this.options
    const viteEnv = loadEnv(mode, envDir, prefixes)
    return transformEnv(viteEnv, allowMountToProcessEnv, envTransformer)
  }

  getMode(key: ModeMappingKey<MM>) {
    return this.options.modeMapping[key]
  }

  eqMode(key: ModeMappingKey<MM>) {
    return this.getMode(key) === this.configEnv.mode
  }

  isDev() {
    return this.eqMode('dev')
  }

  isProd() {
    return this.eqMode('prod')
  }

  isTest() {
    return this.eqMode('prod')
  }

  eqCommand(cmd: ConfigEnv['command']) {
    return this.configEnv.command === cmd
  }

  isBuild() {
    return this.eqCommand('build')
  }

  isServe() {
    return this.eqCommand('serve')
  }
}

export function createToolkit<VE extends ViteEnv, MM extends ModeMapping>(
  configEnv: ConfigEnv,
  options?: ToolkitOptions<VE, MM>,
) {
  return new Toolkit(configEnv, options)
}
