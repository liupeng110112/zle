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

![TodoItem](https://github.com/zle-loves-e2e/zle/blob/feature/doc_cn/doc/images/todoItem.png)

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

嵌套组件是指组件由多个小的组件组成，例如`Todo`面板是由三个小的组件组成(`NewTodoItem`，`TodoItemList`，`FilterItem`)

![TodoApp 面板](https://github.com/zle-loves-e2e/zle/blob/feature/doc_cn/doc/images/todoApp.png)

```ts
import { Component, UIDefinition, chain } from "zle";

/**todo面板 */
export class TodoPanel extends Component{
  static $definition = UIDefinition.root("section.todoapp")
    .withDescendant(NewTodo)

  /**获取添加新条目的输入框 */
  async getNewTodo(){
    return await this.$context.waitFor(NewTodo)
  }

  /**获取Todo列表 */
  async getTodoList(){
    return await this.$context.waitFor(TodoList)
  }

  /**获取过滤器 */
  async getFIlter(){
    return await this.$context.waitFor(Filter)
  }

  /**获得最新一条待办事项 */
  async getLatestItem(){
    return await this.$context.waitFor(LatestTodoItem)
  }

```

嵌套组件和单个组件一样，也可以用`root`和`withDescendant`的方式来描述这个组件，同时提供操作元素的方法。可以看到这个组件的后代组件只有`NewTodo`,其他两个组件也是它的后代，但是为什么没有添加进去呢？因为当我们初次打开[TodoMVC](http://todomvc.com/examples/)的时候，看到的`Todo`面板是这样的：

![TodoAppIniti 面板](https://github.com/zle-loves-e2e/zle/blob/feature/doc_cn/doc/images/todoAppIniti.png)

可以看到，只包含`NewTodo`这个组件，如果把`TodoItemList`和`FilterItem`也作为`TodoApp`的后代，当加载`TodoApp`组件的时候，就会出现加载超时的异常。



### 页面

页面由若干个组件构成：

```ts
import { Page, chain } from "zle";
import {  TodoPanel } from "../components/NewTodo";

export class TodoApp extends Page {
  static $url = "http://todomvc.com/examples/react/";
  static $initialComponents = [TodoPanel];

  getTodoPanel(){
    return chain(async ()=>{
      return await this.$context.waitFor(TodoPanel)
    });
  }
}
```

与`Componet`一样，`Page`是`zle`提供的基类，`TodoApp`继承于它。页面的描述包括:`$url`用于描述页面的路径，`$initialComponents`描述了初次打开页面需要包含的组件。当然页面也需要提供一些方法，这些方法主要用于页面和页面之间的跳转。

### 测试用例

这里运行测试的测试框架是[mocha](https://mochajs.org/),是现在最流行的JavaScript测试框架之一，在浏览器和Node环境都可以使用。

在`test`目录下面有`initialize.ts`文件:

```ts
import { initialize, context } from "zle";

initialize({ 
  executablePath:"",
  headless: false,
  slowMo:0
  args:["--window-size=1920,1080"] });

setup(async () => {
  await context.page.setViewport({ width: 1920, height: 900 });
  await context.page.setRequestInterception(true);
  context.page.on("request", e => {
    if (e.url().startsWith("https://www.google-analytics.com/")) {
      e.abort();
    } else {
      e.continue();
    }
  });
});

```

`initialize`函数用于指定测试用例运行参数:

 * `executablePath`:指定`Chrome`或者`chromium`的路径，如果不指定需要添加环境变量`ZLE_EXECUTABLE_PATH`用于指定`Chrome`或者`chromium`的路径；

 * `headless`:在运行的过程中浏览器是“无头”(`true`)还是“有头”(`false`)的方式运行

 * `slowMo`:降低`Puppeteer`的操作速度，单位为毫秒

 * `args`:其他以西参数，比如窗口大小`"--window-size=1920,1080"`,不如需要以`headless`的模式运行的时候，必须添加`--no-sandbox`。

 * [更多](https://github.com/GoogleChrome/puppeteer/blob/master/lib/Launcher.js)


 `setup`是`mocha`提供的测试组件，它会在每一个测试用例运行之前运行，这里`setup`的主要功能是跳过请求中带有`google-analytics`请求，以为一般我们无法访问谷歌，这样会导致打开页面的时候无法加载，所以我们需要跳过这些请求。


```ts
test("add todo item", async () => {
  const app = await context.waitFor(TodoApp);
  await app.getTodoPanel()
     .addTodoItem("test1")
     .addTodoItem("test2")
     .addTodoItem("test3")
     .$inspect(async self =>{
       assert.equal(await self.getLeftItemNuber(),"3")
     })
     .emptyTodoList()
     .$done();
});

test("checkout todo item",async()=>{
  const app = await context.waitFor(TodoApp)
  await app.getTodoPanel()
    .addTodoItem("test1")
    .addTodoItem("test2")
    .checkoutItem()
    .addTodoItem("test3")
    .$inspect(async self =>{
      assert.equal(await self.getLeftItemNuber(),"2")
    })
    .emptyTodoList()
    .$done()
})
```

每一个测试用例都以`test`开头，表明这是一个测试用例。首先我们需要调用`zle`提供的`waitFor`函数初始化一个页面，`waitFor`函数的主要功能有两个，一个是根据指定的`$url`跳转到相应的页面，然后根据指定的`$initialComponents`,检查组件是否加载完成。

在调用页面和组件提供的方法时，我们可以用以`.`开头的调用方法，是因为在`zle`中提供了`chain`方法，用它对我们的方法进行包装就可以链式调用了：

```ts
/**添加待办事项 */
addTodoItem(item:string ){
  return chain(async ()=>{
    let newTodo = await this.getNewTodo()
    await newTodo.inputItem(item)
    return this.$context.waitFor(TodoPanel);
  });
}
```

这个方法作用是添加新的待办事项，返回的是一个`chainable`,表明它是可以被链式调用的。

`$inspect`函数主要用以检查一些中间的结果，例如测试用例`checkout todo item`,我们添加了三个待办事项，其中一个标记为已完成，这个时候需要验证标记为已完成的功能是不是正常的，就需要去检查剩下的待办事项是不是只用两个：

```ts
.$inspect(async self =>{
  assert.equal(await self.getLeftItemNuber(),"2")
})
```

最后，测试用例结束以后需要以`$done`结尾，表明这个测试用例结束。

### 其他

最后，关于封装组件的一些建议：

* 公共（Public）方法表示页面对象能提供的服务，组件应该允许软件客户端做（看）任何人可以做（看）的事情。

* 不要暴露页面的内部细节，一些复杂UI界面所具备的多层级关系仅是为了组织UI界面，这样的符合结构不应该关联到页面对象上。

*  一般来说不要下断言，页面对象被广泛用于测试场景，但不应该在自身上下断言。提供方法访问存储在页面中的状态是它们的职责所在。断言逻辑则是测试客户端的事情。

* 方法可以返回其他页面对象，这意味着你可以方便的组织用户使用应用的路径。

*  不要表示整张页面，别理会术语“页面”对象，这些对象不应以每张页面的方式创建，而是按页面上突出的组件的方式创建。

*  一个动作如果产生不同结果，应该组织为不同的方法，例如，分别提供一个成功登录的方法和一个失败登录的方法。

相关链接：

* [Readable. Stable. Maintainable. E2E Testing @ Facebook](https://youtu.be/diYgXpktTqo)
* [Martin Fowler: PageObject](https://martinfowler.com/bliki/PageObject.html)
* [Selenium: PageObjects](https://github.com/SeleniumHQ/selenium/wiki/PageObjects)
* [Justin Abrahms: Selenium's Page Object Pattern](https://justin.abrah.ms/python/selenium-page-object-pattern--the-key-to-maintainable-tests.html)
* [Kim Schiller: Getting started with Page Object Pattern for your Selenium tests](https://www.pluralsight.com/guides/software-engineering-best-practices/getting-started-with-page-object-pattern-for-your-selenium-tests)



