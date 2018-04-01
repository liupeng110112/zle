## 指引

### 从种子项目开始

执行下列命令将种子项目拷贝到本地：

```shell
git clone https://github.com/zle-loves-e2e/zle-seed <test-repo-name>
cd <test-repo-name>
```

此时种子项目仍未完成初始化，您有两个选择：

* 大多数情况下，请直接执行 `yarn` 来完成初始化，这个过程会下载 Chromium 二进制程序，可能会耗时一段时间，请确保您的网络与 NPM（镜像）源的连接质量。
* 如果您已经安装了 Chromium 并且不希望再下载另一个，请执行 `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true yarn` ，并且确保 ZLE 能够正确找到 Chromium 的二进制程序。

### 种子项目结构概览

OK，此时您已经成功完成种子项目的初始化，浏览下当前项目，您会看到下面的目录结构：

```
├── components  // 存放测试组件
├── package.json  // 不需要介绍
├── pages  // 存放测试页面
├── test  // 存放测试用例
│   ├── initialize.ts  // 初始化测试钩子（全局）
│   └── mocha.opts  // 测试框架Mocha的配置参数
├── tsconfig.json  // TypeScript语言编译器的配置参数
```

这是 ZLE 团队推荐的测试项目结构。

### 编写您的第一个测试组件

(Coming soon...)
