import type { ConfigEnv } from 'vite'
import { loadEnv } from 'vite'
import type { ModeMapping, _ModeMapping } from './modeMapping'
import { BASE_MODE_MAPPING } from './modeMapping'
import type { Converter, _ViteEnv } from './convertEnv'
import { convertEnv } from './convertEnv'
import type { DeepPartial } from './utils'

export interface ToolkitOptions<VE extends _ViteEnv, MM extends _ModeMapping = {}> {
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
  modeMapping: ModeMapping<MM>
  /**
   * 允许通过 `loadEnv` 加载的环境变量挂载至 `process.env`
   * @default false
   */
  allowMountToProcessEnv: boolean
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
  envConverter: Converter<VE>
}

export class ToolkitStatic<VE extends _ViteEnv, MM extends _ModeMapping = {}> {
  private static _instance = null

  private _configEnv: ConfigEnv
  public get configEnv() {
    return this._configEnv
  }

  private _baseOptions: ToolkitOptions<VE, MM>
  public get baseOptions() {
    return this._baseOptions
  }

  constructor(configEnv: ConfigEnv, options?: DeepPartial<ToolkitOptions<VE, MM>>) {
    this._configEnv = configEnv
    this._baseOptions = {
      modeMapping: Object.assign({}, BASE_MODE_MAPPING, options?.modeMapping) as ModeMapping<MM>,
      allowMountToProcessEnv: options?.allowMountToProcessEnv ?? false,
      envConverter: options?.envConverter ?? {}
    }
  }

  /**
   * 创建唯一实例
   */
  static createSingleInstance<VE extends _ViteEnv, MM extends _ModeMapping = {}>(
    configEnv: ConfigEnv,
    options?: DeepPartial<ToolkitOptions<VE, MM>>
  ) {
    if (!this._instance) this._instance = new ToolkitStatic(configEnv, options)
    return this._instance
  }

  /**
   * 获取唯一实例
   */
  static getSingleInstance<VE extends _ViteEnv, MM extends _ModeMapping = {}>(): ToolkitStatic<
    VE,
    MM
  > | null {
    return this._instance
  }

  loadEnv(mode = this.configEnv.mode, envDir = process.cwd(), prefix?: string | string[]) {
    const { allowMountToProcessEnv, envConverter } = this.baseOptions
    const viteEnv = loadEnv(mode, envDir, prefix)
    return convertEnv(viteEnv, allowMountToProcessEnv, envConverter)
  }

  getMode(key: keyof ModeMapping<MM>) {
    return this._baseOptions.modeMapping[key]
  }

  eqMode(key: keyof ModeMapping<MM>) {
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

export function createToolkit<VE extends _ViteEnv, MM extends _ModeMapping = {}>(
  configEnv: ConfigEnv,
  options?: DeepPartial<ToolkitOptions<VE, MM>>
) {
  return new ToolkitStatic<VE, MM>(configEnv, options)
}
