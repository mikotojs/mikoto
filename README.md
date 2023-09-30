# mikoto

## 工具选择

- TypeScript 开发时运行 [`tsx`]('https://github.com/esbuild-kit/tsx')。通过测试 `esbuild-runner/register` 是最快的，但是长期未更新，支持内容较少；`@swc-node/register` ，`esbuild-register` 以及 `tsx` 倒是不相上下。`tsx` 还需要 10 M，为啥选呢？主要是支持功能多，包括在 commonjs 中 import esm。
- 代码转换 [swc](https://swc.rs/docs/getting-started)。
- turbo
