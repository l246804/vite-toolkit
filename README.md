# vite-toolkit

一个 `Vite` 配置工具包。

## 功能清单

- [x] 检查运行环境
- [x] 解析环境变量，区分数据真实类型
- [x] 环境变量共享至 `process.env`

## 示例

### 解析并挂载全局环境变量

> **注意：当允许将加载的环境变量挂载至 `process.env` 时，`typeof` 为 `object` 的类型将被 `JSON.stringify` 序列化为字符串！**

```ts
// global.d.ts 为全局类型文件，其内定义环境变量
declare global {
  declare interface ViteEnv {
    VITE_APP_TITLE: string
    VITE_APP_TIMEOUT: number
  }

  // 定义全局环境变量对象
  const __ENV__: ViteEnv
}

export {}
```

```shell
# .env.development
# 应用标题
VITE_APP_TITLE=应用标题
# 应用接口超时默认时间
VITE_APP_TIMEOUT=5000
# 应用代理
VITE_APP_PROXY=[{ prefix: '/api', target: 'http://127.0.0.1:5555' }]
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { createToolkit } from '@lei-xx/vite-toolkit'

export default defineConfig((configEnv) => {
  const toolkit = createToolkit<ViteEnv>(configEnv, { allowMountToProcessEnv: true })

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

### 多文件共享唯一实例

用于在 `vite.config.ts` 中创建全局唯一实例，在其他文件中能轻松获取，避免传递额外参数。

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { ToolkitStatic } from '@lei-xx/vite-toolkit'

export default defineConfig((configEnv) => {
  const toolkit = ToolkitStatic.createSingleInstance<ViteEnv>(configEnv, { allowMountToProcessEnv: true })

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
import { ToolkitStatic } from '@lei-xx/vite-toolkit'

export const createPlugins = () => {
  const toolkit = ToolkitStatic.getSingleInstance<ViteEnv>()

  console.log(toolkit.isDev())

  return [
    // ...
  ]
}
```