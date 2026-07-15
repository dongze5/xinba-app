# 🚀 项目开发指南

## 🛠️ 技术栈核心构成

融合了当前前端最前沿的开发技术：

| 技术组件 | 版本/地位 | 核心作用 |
| :--- | :--- | :--- |
| **Vue 3** | 最新组合式 API | 基于 `<script setup>`，实现逻辑复用与极致渲染性能。 |
| **TypeScript** | 全局类型安全 | 提供全方位的代码类型推断与编译期错误拦截。 |
| **Vite 5** | 极速构建引擎 | 秒级热更新（HMR），大幅提升大型多端项目的本地启动与打包速度。 |
| **UnoCSS** | 极致轻量原子 CSS | 按需即时编译，无需下载庞大的 CSS 库，天生规避小程序包体积过大问题。 |
| **wot-ui** | 专属多端 UI 库 | 专为 Vue3 + uni-app 调优的精美扁平组件库，多端表现完全一致。 |
| **z-paging** | 高性能分页神器 | 解决移动端下拉刷新、上拉加载、虚拟滚动等痛点的高性能分页组件。 |

---

## 🌟 核心特性与功能内置

### 1. 约定式路由 (File-based Routing)
引入了类似 Next.js/Nuxt.js 的页面约定配置。
* **无需手动维护 `pages.json`**：在 `src/pages` 下新建目录和 Vue 文件，Vite 插件会自动捕获并实时编译生成 `pages.json`；
* **页面配置声明**：直接在 Vue 组件内通过独特的 `definePage` 编译宏声明页面属性（如导航栏标题、自定义导航风格等）：
  ```vue
  <script setup lang="ts">
  definePage({
    style: {
      navigationBarTitleText: '我的主页',
      navigationStyle: 'custom', // 启用自定义导航栏
    },
  })
  </script>
  ```

### 2. 统一 Layout 布局系统
支持多页面共用统一的基础母版（Layout）。可以在 `src/layouts` 下声明各类布局模板，在页面中无缝包裹应用，极大地减少了公用页头、页脚、全局弹窗的重复代码灌入。

### 3. 请求封装与登录拦截器
* **统一请求封装**：内置强大的网络请求工具，对 `uni.request` 进行了 Promise 级深度包装；
* **请求与响应拦截**：自动在 Request 中植入 Token 验证；在 Response 中拦截 401（未登录）、403（无权限）、500（系统错误）等，并统一弹出轻量提示；
* **路由登录拦截**：配置路由白名单，未登录用户点击敏感页面时会自动重定向至登录页。

### 4. UnoCSS 原子样式系统
* 完美兼容小程序端各种编译限制；
* 提供了极速原子化 CSS 编写体验，例如写 `flex items-center justify-between p-4 bg-white` 即可即时呈现布局。
* **🚨 跨端注意**：微信小程序真机上**不支持 UnoCSS 的颜色透明度简写**（如 `bg-[#22D386]/12`），多端适配开发时请编写标准的 `rgba()`。

### 5. 多语言国际化 (i18n)
内置多语言切换机制，支持中英文及多国语言的动态无感切换。

---

## 📋 环境要求

在运行和构建项目之前，请确保您的本地开发环境符合以下要求：

* **Node.js**：`>= 20.0.0` (推荐使用 LTS 版本如 v20 或 v22)
* **pnpm**：`>= 9.0.0` (项目配置强制限制使用 pnpm 进行包管理)

---

## 📱 微信小程序开发与配置说明

为了确保微信小程序端的正常联调与发布，请重点关注以下配置项：

### 1. 配置真实的小程序 AppID
* **修改位置**：编辑 [src/manifest.json](file:///Users/dongze/Downloads/ai-root/xinba-app/src/manifest.json) 文件。
* **修改项**：在 `"mp-weixin"` 节点下，将 `"appid"` 的值（默认为 `'wxa2abb91f64032a2b'`）替换为您自己在微信公众平台申请的小程序 AppID。
* **本地开发联调**：`"setting"` 节点下默认设置了 `"urlCheck": false`，已关闭域名的合法性校验，方便您在本地或局域网环境直接联调后端接口。

### 2. 页面路由与窗口配置 (约定式路由声明)
* 本模板基于 Vite 插件自动生成配置，**严禁直接修改编译后的 `src/pages.json`**，否则文件会被重新编译覆盖。
* 当您需要新增页面、修改窗口样式或设置全局参数时，请在具体页面的 Vue 代码内，通过 `definePage` 编译宏进行声明配置：
  ```vue
  <script setup lang="ts">
  definePage({
    style: {
      navigationBarTitleText: '页面标题',
      enablePullDownRefresh: false, // 是否开启下拉刷新
    }
  })
  </script>
  ```

### 3. 导入微信开发者工具
* **调试运行**：在终端执行开发指令 `pnpm dev:mp-weixin`；
* **导入路径**：微信开发者工具中选择“导入项目”，导入项目的绝对路径必须选择编译生成的 **`dist/dev/mp-weixin`** 文件夹（切记不要导入整个项目的根目录，否则微信工具无法识别）。

### 4. 主包体积与分包优化 (Subpacking)
* 微信小程序对首屏主包有严格的 `2MB` 大小限制。项目在 `manifest.json` 中默认启用了分包优化属性：`"optimization": { "subPackages": true }`。若后期业务拓展导致页面激增，请按目录分包存放，以确保能正常提交审核。

---

## ⚙️ 环境变量与后端接口配置 (`env/` 目录)

项目根目录下的 `env/` 文件夹包含了所有的环境配置文件，用于统一管理应用的各项常量与接口基地址：

* **`env/.env`**：全局基础环境变量（默认读取）；
* **`env/.env.development`**：开发环境专属变量（`pnpm dev` 阶段叠加读取）；
* **`env/.env.production`**：生产打包专属变量（`pnpm build` 阶段叠加读取）；
* **`env/.env.test`**：测试环境专属变量。

配置项核心指南：

### 1. 🔗 替换正式后端 API 请求地址
当您需要接入正式的后端接口时，**不需要修改任何网络请求的业务代码**，仅需修改 `env/.env` 文件中的以下字段：
* **`VITE_SERVER_BASEURL`**：主后台请求基地址（默认指向模拟的 `https://ukw0y1.laf.run`）。将其直接替换为您的正式后端 API 域名即可。
* **分环境接口自动适配（微信小程序专属）**：
  模板天然支持根据微信小程序的发布状态（开发版/体验版/正式版）自动切换不同的后端接口地址，避免每次手动发布打包时改代码：
  ```ini
  # 取消注释并修改为您不同环境的真实接口，不配置时会回退读取 VITE_SERVER_BASEURL
  # VITE_SERVER_BASEURL__WEIXIN_DEVELOP = 'https://dev.api.com'   # 开发版
  # VITE_SERVER_BASEURL__WEIXIN_TRIAL   = 'https://trial.api.com' # 体验版
  # VITE_SERVER_BASEURL__WEIXIN_RELEASE = 'https://prod.api.com'  # 正式发布版
  ```

### 2. 📱 命令行一键自动拉起“微信开发者工具”
如果您在终端运行 `pnpm dev:mp-weixin` 时，系统提示无法自动为您打开“微信开发者工具”，通常是因为您更改了微信开发工具的默认安装路径：
* **解决办法**：在 `env/.env` 中配置 `WECHAT_DEVTOOLS_CLI_PATH` 变量指向您本地微信工具的 cli 命令行路径。
  * **macOS 示例**：
    ```ini
    WECHAT_DEVTOOLS_CLI_PATH = '/Applications/wechatwebdevtools.app/Contents/MacOS/cli'
    ```
  * **Windows 示例**：
    ```ini
    WECHAT_DEVTOOLS_CLI_PATH = 'C:\Program Files (x86)\Tencent\微信web开发者工具\cli.bat'
    ```

---

## 💻 命令行指令大全

允许在任意终端通过命令行快速启动开发或执行构建，无需打开 HBuilderX 导入项目。

### 1. 安装依赖
```bash
pnpm install
```

### 2. 启动本地开发调试（实时热更新）
```bash
# H5 网页端开发
pnpm dev

# 微信小程序端开发（推荐 🛠️）
pnpm dev:mp-weixin

# 支付宝小程序端开发
pnpm dev:mp-alipay

# App 端开发（联调原生真机/模拟器）
pnpm dev:app
```

### 3. 编译打包生成产物（生产构建）
```bash
# 打包 H5 网页端
pnpm build:h5

# 打包微信小程序（产物生成在 dist/build/mp-weixin 目录下）
pnpm build:mp-weixin

# 打包 App 客户端
pnpm build:app
```

---

## 🎨 编辑器推荐与配置（以 VSCode 为例）

为保证最佳的开发体验和 TypeScript 类型提示，推荐使用 **VSCode**，并安装以下官方推荐插件：

### 1. 必备扩展插件
* **Vue - Official (原 Volar)**：Vue3 官方语言工具，提供极其精准的模板与 TS 类型推断；
* **UnoCSS**：提供强大的原子类名智能联想、颜色色块直接预览和快速导航；
* **ESLint** & **Prettier**：代码质量校验与全自动格式化规范；
* **TypeScript Vue Plugin**：让 TS 完美支持在 Vue 模板中声明的类型。

### 2. 自动导入 (unplugin) 与辅助工具
内置了 `unplugin-auto-import` 和 `unplugin-vue-components` 插件。
* 编写代码时，像 `ref`, `computed`, `watch`, `onLoad`, `onShow` 等 Vue & uni-app 的核心 API，**无需手动进行 `import` 引入**，保存时系统会自动补全，代码极其干净。

---

## 💡 开发最佳实践建议

1. **清除与重载缓存**：
   项目内置了 Pinia 的持久化缓存。如果在调试中遇到“状态和旧数据依然顽固残留”的现象，请在 **“设置”中执行“清除缓存”**，小程序会物理抹除手机本地 Storage 并重新 ReLaunch 载入，这是最干净的重置手段。
2. **跨端编译隔离**：
   在编写特定平台代码时，合理利用条件编译宏（如 `// #ifdef MP-WEIXIN`、`// #ifndef H5`）进行隔离，保证各端体积和表现完美。
