import process from 'node:process'
import { red } from 'kolorist'
import type { Recordable } from '@rhao/types-base'
import { isString } from 'lodash-es'
import { createDebug } from './utils'

export type ViteEnv = Recordable<any>

export type Transformer<VE extends ViteEnv> = {
  [K in keyof VE]?: (value: string) => VE[K]
}

export function transformEnv<VE extends ViteEnv>(
  viteEnv: VE,
  allowMountToProcessEnv: boolean,
  transformer: Transformer<VE>,
): ViteEnv {
  const debug = createDebug('transformEnv')
  debug('开始转换 "viteEnv"')

  const res = Object.entries(viteEnv).reduce((env, [key, value]) => {
    debug(`待转换的 key 是 "${key}", value 是 "${value}"`)

    let val = (value || '').trim() as any

    try {
      if (typeof transformer[key] === 'function') {
        debug(`根据 key "${key}" 获取到自定义转换器`)
        val = transformer[key]!(val)
      } else {
        debug(`根据 key "${key}" 未获取到自定义转换器，采用默认转换器`)
        // eslint-disable-next-line no-new-func
        val = val === '' ? val : new Function(`return ${val}`)()
      }
    } catch (err: unknown) {
      debug(red(`默认转换失败：${(err as Error).message}`))
    }

    debug(`转换结果：${val}，类型：${typeof val}`)

    env[key] = val
    if (allowMountToProcessEnv) {
      debug(`追加 key "${key}" 到 "process.env"`)
      typeof val === 'object' && debug('value 类型是 "object"，将使用 "JSON.stringify" 进行序列化')

      process.env[key] = isString(val) ? val : JSON.stringify(val ?? null)
    }

    return env
  }, {} as Recordable)

  debug('转换 "viteEnv" 结束')
  return res
}
