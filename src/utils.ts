import { debug } from 'debug'

export function createDebug(namespace: string) {
  return debug(`[vite-toolkit:${namespace}]`)
}
