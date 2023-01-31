import { red } from 'kolorist'
import { createDebug } from './utils'

export type _RawViteEnv = Record<string, string>
export type _ViteEnv = Record<string, any>

export type Converter<ViteEnv extends _ViteEnv> = {
  [K in keyof ViteEnv]?: (value: string) => ViteEnv[K]
}

export function convertEnv<ViteEnv extends _ViteEnv>(
  viteEnv: _RawViteEnv,
  allowMountToProcessEnv: boolean,
  converter: Converter<ViteEnv>
): ViteEnv {
  const debug = createDebug('convertEnv')
  debug('开始转换 "viteEnv"')

  const res = Object.entries(viteEnv).reduce((env, [key, value]) => {
    debug(`等待转换的 key 是 "${key}", value 是 "${value}"`)

    let val = (value || '').trim() as any

    if (typeof converter[key] === 'function') {
      debug(`根据 key "${key}" 获取到自定义转换器`)
      val = converter[key](val)
    } else {
      debug(`根据 key "${key}" 未获取到自定义转换器，采用默认转换器`)
      try {
        // eslint-disable-next-line no-new-func
        val = new Function(`return ${val}`)()
      } catch (err) {
        debug(red(`默认转换失败：${err.message}`))
      }
    }

    debug(`转换结果：${val}，类型：${typeof val}`)

    env[key] = val
    if (allowMountToProcessEnv) {
      debug(`追加 key "${key}" 到 "process.env"`)
      typeof val === 'object' && debug('value 类型是 "object"，将使用 "JSON.stringify" 进行序列化')

      process.env[key] = typeof val === 'object' ? JSON.stringify(val || '') : val
    }

    return env
  }, {} as any)

  debug('转换 "viteEnv" 结束')
  return res
}
