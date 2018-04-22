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

以[TodoMVC](http://todomvc.com/examples/)页面为例，`TodoApp`的功能是管理`Todo`事项，主要的组件是`Todo`面板


#### 单个组件
`TodoItem`是单个待办事项组件，它构成了`Todo`列表，每一个`TodoItem`是一样的，所以我们首先定义`TodoItem`：

![TodoItem 面板](https://github.com/zle-loves-e2e/zle/blob/feature/doc_cn/doc/images/todoItem.png)

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

`Component`是测试框架`zle`提供的基类,用来描述组件的基本形状（`shape`）,`LatestTodoItem`继承于`Component`,这样我们可以自定义组件：

静态变量`$definition`用于描述组件的结构，由根节点（`root`）和后代（`withDescendant`）组成，其中根节点表示组件包括的范围，后代表示根节点包括的元素。如上图所示，红色方框表示了单个`TodoItem`组件，这个组件由三个后代：勾选框（`checkout box`）,名称（`item name`）和删除按钮（`delete`）。

在描述组件的构成时，我们可以给组件的根节点或者是后代起一个别名，在对元素进行操作时，只需要引用别名即可，例如：

```ts
withDescendant("button.destroy", "delete");
```

`button.destroy`为`css selector`定位符,`delete`为该元素对应的别名。

这样我们就描述好了组件的构成，同时组件需要提供操作页面元素的方法：

```ts
/**单个待办事项条目 */
export class LatestTodoItem extends Component{

  static $definition = UIDefinition.root("ul.todo-list li:nth-last-child(1)","todo")
  .withDescendant("input.toggle","checkout box")
  .withDescendant("label","item name")
  .withDescendant("button.destroy","delete");

  /**勾选待办事项 */
  async checkoutTodoITem(){
    await this.$click("checkout box")
  }

  /**删除待办事项 */
  async delteTodoItem(){
    await this.$hover("item name")
    await this.$click("delete")
  }
}
```

通过这些方法，我们可以改变`TodoItem`的状态，以及删除`TodoItem`的操作，这样我们就得到了一个完整的组件，它是由定位元素和方法组成。


#### 嵌套组件

嵌套组件是指组件由多个小的组件组成，例如

### 页面

### 测试用例

### 其他

