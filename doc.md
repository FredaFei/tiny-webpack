接着上次的[手写 Webpack打包实现](https://github.com/FredaFei/tiny-webpack/blob/webpack/doc.md)
篇，实现一个简易的 Plugin

#### 准备工作

初始化项目，目录结构如下：

```
tiny-webpack
├── dist
│   ├── bundle.js
├── lib  // 手写webpack源码目录
│   ├──plugin // 手写loader源码目录
│   │   ├── copy-html.js
│   ├── ...
├── src 
│   ├── index.html
│   ├── index.js
├── index.js
├── webpack.config.js
├── package.json
```

依赖安装

```
npm install tapable
```

### `tapable`是什么？

> The tapable package expose many Hook classes, which can be used to create hooks for plugins.

为创建插件提供`hook`

**Webpack Plugin 机制：**

+ 在`Webpack`对应的生命周期发布信息
+ 订阅到该信息的插件，执行其回调

本文参考`html-webpack-plugin`插件的功能，实现的插件有如下功能：

+ 拷贝`.html`文件到打包目录
+ 自动插入打包后的js文件到`.html`文件中
+ 支持自定义`title`

下面使用`tapable`中提供的`SyncHook`类进行`plugin`开发：

```js
// ./lib/plugin/copy-html.js
...

class CopyHtml {
    constructor(options) {
        this.options = options;
        this.filename = options.filename || 'index.html';
        this.template = formatPathSep(options.template);
    }

    /**
     * @param compiler 是Compiler 的实例，apply仅表示函数名
     * */
    apply(compiler) {
        compiler.hooks.done.tap('copy', () => {
            const { output } = compiler;
            const { path: outputDir, filename } = output;
            const outputFilename = path.join(outputDir, this.filename);
            writeFileRecursive(outputDir, outputFilename, this.transform(filename), (error) => {
                console.log(error);
            });
        });
    }

    getResource() {
        if (!this.template) {
            console.error(`${template}参数未传`);
            return;
        }
        return fs.readFileSync(this.template, 'utf8');
    }

    transform(bundle) {
        const source = this.getResource();
        const title = `<title>${this.options.title || '这是默认title'}</title>`;
        const script = `<script src="${bundle}"></script>`;
        return source.replace('<!--copy-html-title-->', title).replace('<!--copy-html-script-->', script);
    }
}

module.exports = CopyHtml;
```

```js
// ./lib/compiler.js
...
constructor(options)
{
...
    this.plugins = plugins;
    // 插件的生命周期钩子
    this.hooks = {
        entryOption: new SyncHook(),  // 入口选项
        compile: new SyncHook(),      // 编译
        afterCompile: new SyncHook(),  // 编译完成
        afterPlugins: new SyncHook(),   // 编译完插件
        run: new SyncHook(),         // 运行
        emit: new SyncHook(),        // 发射
        done: new SyncHook()
    };
    this.plugins.map(plugin => {
        // apply 并不改变this，仅表示函数名，其参数this为Compiler实例
        plugin.apply(this);
    });
    this.hooks.afterPlugins.call();
}

run()
{
    // 触发对应的hook
    this.hooks.run.call();
    this.hooks.compile.call();
...
    this.hooks.emit.call();
    this.hooks.done.call();
}
...
```

```js
// index.js
...
const compiler = new Compiler(webpackConfig);

compiler.run();
```

```js
// webpack.config.js
...
const CopyHtml = require('./lib/plugin/copy-html');
...
plugins: [
    new CopyHtml({
        filename: 'index.html',
        title: 'copy-plugin',
        template: path.resolve(__dirname, './src/index.html')
    })
]
```

运行`npm run build`，浏览器打开`dist/index.html`查看效果吧。

[完整代码](https://github.com/FredaFei/tiny-webpack/tree/plugin)

以上是整个手写 Plugin 实现的全部内容。

**Webpack 手写系列**

+ [手写 Webpack打包实现](https://github.com/FredaFei/tiny-webpack/blob/webpack/doc.md)
+ [手写 Loader](https://github.com/FredaFei/tiny-webpack/blob/loader/doc.md)
+ [手写 Webpack Plugin](https://github.com/FredaFei/tiny-webpack/blob/plugin/doc.md)
