# `@rhao/vite-toolkit`

`vite` 配置工具包。

## 功能清单

- [x] 检查运行环境
- [x] 解析环境变量，区分真实数据类型
- [x] 环境变量挂载至 `process.env`

## 示例

解析并挂载全局环境变量

> 注意：当允许将加载的环境变量挂在至 `process.env` 时，非 `string` 类型的数据将被 `JSON.stringify` 序列化为字符串！

```ts
// global.d.ts 定义全局类型文件
declare global {
  // 定义 vite 环境变量
  declare interface ViteEnv {
    VITE_APP_TITLE: string
    VITE_APP_TIMEOUT: number
  }

  // 推荐挂载至单一变量
  const __ENV__: ViteEnv
}

export {}
```

```shell
# .env.development
# 应用标题
VITE_APP_TITLE=应用标题
# 应用接口默认超时时间
VITE_APP_TIMEOUT=5000
# 应用代理
VITE_APP_PROXY=[{prefix: '/api', target: 'http://127.0.0.1:5555'}]
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { createToolkit } from '@rhao/vite-toolkit'

export default defineConfig((configEnv) => {
  const toolkit = createToolkit<ViteEnv>(configEnv, { allowMountToProcessEnv: true })

  /**
   * {
   *   VITE_APP_TITLE: '应用标题',
   *   VITE_APP_TIMEOUT: 5000,
   *   VITE_APP_PROXY: [{ prefix: '/api', target: 'http://127.0.0.1:5555' }]
   * }
   */
  const env = toolkit.loadEnv()

  return {
    // ...
    define: {
      // 挂载全局环境变量
      __ENV__: env
    }
  }
})
```

## 多文件共享唯一实例

用于在 `vite.config.ts` 中创建全局唯一工具实例，在其他文件中能够直接获取，避免繁琐的传递。

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { Toolkit } from '@rhao/vite-toolkit'

export default defineConfig((configEnv) => {
  const toolkit = Toolkit.createInstance<ViteEnv>(configEnv, { allowMountToProcessEnv: true })

  /**
   * {
   *   VITE_APP_TITLE: '应用标题',
   *   VITE_APP_TIMEOUT: 50000,
   *   VITE_APP_PROXY: [{ prefix: '/api', target: 'http://127.0.0.1:5555' }]
   * }
   */
  const env = toolkit.loadEnv()

  return {
    // ...
    define: {
      // 挂载全局环境变量
      __ENV__: env
    }
  }
})
```

```ts
// plugin.ts
import { Toolkit } from '@rhao/vite-toolkit'

export function createPlugins() {
  const toolkit = Toolkit.getInstance<ViteEnv>()

  console.log(toolkit?.isDev())

  return [
    // ...
  ]
}
```
