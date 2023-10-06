# mikoto

## 工具选择

- [`tsx`]('https://github.com/esbuild-kit/tsx')：TypeScript 开发时运行 。通过测试 `esbuild-runner/register` 是最快的，但是长期未更新，支持内容较少；`@swc-node/register` ，`esbuild-register` 以及 `tsx` 倒是不相上下。`tsx` 还需要 10 M，为啥选呢？主要是支持功能多，包括在 commonjs 中 import esm。
- [swc](https://swc.rs/docs/getting-started)：SWC 是一个可扩展的基于 Rust 的平台，适用于下一代快速开发人员工具。Next.js，Parcel 和 Deno 等工具以及Vercel，ByteDance，Tencent，Shopify等公司都在使用它。。
- [turbo](https://turbo.build/repo/docs)：Turborepo是一个针对 JavaScript 和 TypeScript 代码库优化的智能构建系统。
- [dprint](https://dprint.dev)： 用 Rust 编写的可插入且可配置的代码格式化平台。
