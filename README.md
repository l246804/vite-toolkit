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

## 客户端使用

> 由于 `define` 提供的 `__ENV__` 会在编译时以字面量形式代替，由于 `__ENV__` 是对象类型，多次使用会被硬编码进源码中，所以这里在一个文件内单独导出并使用，可搭配 `unplugin-auto-import` 插件自动导入效果更佳。

### 直接使用 __ENV__

```ts
// 编译前
// 第一次
console.log(__ENV__.VITE_APP_TITLE)

// 第二次
console.log(__ENV__.VITE_APP_TITLE)


// 编译后
// 第一次
console.log({ VITE_APP_TITLE: '应用标题', VITE_APP_TIMEOUT: 50000, VITE_APP_PROXY: [{ prefix: '/api', target: 'http://127.0.0.1:5555' }] }.VITE_APP_TITLE)

// 第二次
console.log({ VITE_APP_TITLE: '应用标题', VITE_APP_TIMEOUT: 50000, VITE_APP_PROXY: [{ prefix: '/api', target: 'http://127.0.0.1:5555' }] }.VITE_APP_TITLE)
```

### 提取单独文件管理

```ts
// src/env.ts
export const ENV = __ENV__
```

```ts
import { ENV } from '@/env'

// 编译前
// 第一次
console.log(ENV.VITE_APP_TITLE)

// 第二次
console.log(ENV.VITE_APP_TITLE)


// 编译后
// 第一次
console.log(ENV.VITE_APP_TITLE)

// 第二次
console.log(ENV.VITE_APP_TITLE)
```

### 安装 `unplugin-auto-import`

```ts
// vite.config.ts
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig({
  // ...
  plugins: [
    // ...
    AutoImport({
      imports: [
        {
          // 自动导入 ENV 变量
          '@/env': ['ENV']
        }
      ],
      dts: 'src/types/auto-imports.d.ts',
      vueTemplate: true,
    })
  ]
})
```
