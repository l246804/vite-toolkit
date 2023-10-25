import type { Recordable } from '@rhao/types-base'
import { isString, omit } from 'lodash-es'
import type { ProxyOptions } from 'vite'

export type ProxyItem = [
  prefix: string,
  target: string,
  rewrite?: string,
  options?: Omit<ProxyOptions, 'target' | 'rewrite'>,
]

export type ProxyList = ProxyItem[]

export type ProxyTargetList = Recordable<ProxyOptions>

/**
 * 创建开发服务代理
 * @example
 * ```ts
 * const proxy = createProxy(
 *   [
 *     // normal
 *     ['/api', 'http://xxx.cn/'],
 *
 *     // rewrite prefix
 *     ['/api/locale', 'http://xxx.cn/', '/api'],
 *
 *     // override options, not support target and rewrite
 *     ['/api/test', 'http://xxx.cn/', null, { ws: false, changeOrigin: false }],
 *
 *     // use https
 *     ['/api/https', 'https://xxx.cn/'],
 *   ]
 * )
 *
 * // proxy
 * {
 *   '/api': {
 *     target: 'http://xxx.cn/',
 *     changeOrigin: true,
 *     ws: true,
 *   },
 *   '/api/locale': {
 *     target: 'http://xxx.cn/',
 *     rewrite: (path) => path.replace(/^\/api\/locale/, '/api'),
 *     changeOrigin: true,
 *     ws: true,
 *   },
 *   '/api/test': {
 *     target: 'http://xxx.cn/',
 *     ws: false,
 *     changeOrigin: false,
 *   },
 *   '/api/https': {
 *      target: 'https://xxx.cn/',
 *      changeOrigin: true,
 *      ws: true,
 *      // https is require secure=false
 *      secure: false,
 *    }
 * }
 * ```
 */
export function createProxy(list: ProxyList = []) {
  const ret: ProxyTargetList = {}
  const httpsRE = /^https:\/\//
  for (const [prefix, target, rewrite, options] of list) {
    const isHttps = httpsRE.test(target)

    // https://github.com/http-party/node-http-proxy#options
    const opts: ProxyOptions = {
      target,
      changeOrigin: true,
      ws: true,
      ...omit(options, ['target', 'rewrite']),
    }
    if (isString(rewrite)) opts.rewrite = (path) => path.replace(new RegExp(`^${prefix}`), rewrite)
    if (isHttps) opts.secure = false

    ret[prefix] = opts
  }
  return ret
}
