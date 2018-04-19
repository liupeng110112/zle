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

[TodoMVC](http://todomvc.com/examples/)主要的功能是管理`Todo`事项，最主要的组件是`Todo`面板

![TodoApp 面板](https://github.com/zle-loves-e2e/zle/blob/feature/doc_cn/doc/images/todoApp.png)

这个组件由三个小的组件组成(`NewTodoItem`，`TodoItemList`，`FilterItem`),我们以`TodoItemList`为例，`TodoItemList`是由若干个`TodoItem`构成，每一个`TodoItem`是一样的，所以我们只用定义好`TodoItem`就行：

```ts
/**单个待办事项条目 */
export class LatestTodoItem extends Component {
  static $definition = UIDefinition.root(
    "ul.todo-list li:nth-last-child(1)",
    "todo"
  )
    .withDescendant("input.toggle", "checkout box")
    .withDescendant("label", "item name")
    .withDescendant("button.destroy", "delete");
}
```

这里我们的组件的名称并不叫`TodoItem`而是 `LatestTodoItem`（最后一个或者最新一个`TodoItem`)

```html
<li class="" data-reactid=".0.1.1.$4563e89d-be94-4788-bdad-bd5d5c902186">...</li>
<li class="" data-reactid=".0.1.1.$cebf7043-e7fa-4d16-b1ad-a5b1158f0d30">...</li>
<li class="" data-reactid=".0.1.1.$faa17b94-d34f-4513-912c-36afd4775280">...</li>
```
