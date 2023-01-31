import { debug } from 'debug'

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Record<string, any> ? Partial<T[K]> : T[K]
}

export const createDebug = (namespace: string) => debug(`vite-toolkit:${namespace}`)
