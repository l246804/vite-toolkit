import type { Recordable } from '@rhao/types-base'
import { isObjectLike, isString } from 'lodash-es'

/**
 * 扁平化环境变量，用于 `define` 时替换复杂变量
 *
 * - 数组取值：仅支持 `env[index]` 格式
 * - 非数组取值：仅支持 `env.aaa.bbb` 格式
 *
 * ***注意：扁平化后请不要再 `define` 同 `name` 的变量，否则编译时可能回导致失败！***
 *
 * @param name 环境变量名
 * @param env 环境变量
 * @returns 扁平化后的环境变量
 *
 * @example
 * ```ts
 * flattenEnv({ a: { b: 1, c: [1, 2, 3] }, d: '4' }, '__ENV__')
 * // 扁平化后
 * {
 *   '__ENV__.a.b': 1,
 *   '__ENV__.a.c': [1, 2, 3],
 *   '__ENV__.a.c[0]': 1,
 *   '__ENV__.a.c[1]': 2,
 *   '__ENV__.a.c[2]': 3,
 *   '__ENV__.a': { b: 1, c: [1, 2, 3] },
 *   '__ENV__.d': '"4"'
 * }
 * ```
 */
export function flattenEnv(name: string, env: Recordable) {
  if (!name) throw new Error('[ViteToolkit flattenEnv] - Missing parameter "name".')

  const obj = {} as Recordable<any>
  const deep = (env: Recordable, paths: string[]) => {
    const isArr = Array.isArray(env)
    Object.entries(env).forEach(([key, value]) => {
      const _paths = paths.concat(isArr ? `[${key}]` : key)
      // 如果是 object 类型则递归遍历
      if (isObjectLike(value)) deep(value, _paths)

      // 拼接完整地址
      key = _paths.join('.').replace(/\.(?=\[\d+\])/g, '')
      obj[key] = isString(value) ? JSON.stringify(value) : value
    })
  }
  deep(env, [name])
  return obj
}
