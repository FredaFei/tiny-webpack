接着上次的[手写webpack](https://github.com/FredaFei/tiny-webpack/blob/webpack/doc.md)
篇，实现一个简易的 Loader

#### 准备工作

初始化项目，目录结构如下：

```
tiny-webpack
├── dist
│   ├── bundle.js
├── lib  // 手写webpack源码目录
│   ├──loader // 手写loader源码目录
│   │   ├── drop-console.js
│   │   ├── style-loader.js
│   │   ├── less-loader.js
│   ├── ...
├── src 
│   ├──style 
│   │   ├── theme.less
│   │   ├── index.css
│   ├── index.html
│   ├── index.js
├── index.js
├── webpack.config.js
├── package.json
```

依赖安装

```
npm install less @babel/generator @babel/types
```

**loader 执行流程：**

+ loader是一个函数
+ loader接收一个参数`source`，对其解析处理后返回
+ 解析loader时，其顺序为从后往前

本文实现的loader有：

+ less转换为css loader

```js
// ./lib/loader/less-loader.js
const less = require('less');

module.exports = function (source) {
    let css = '';
    less.render(source, function (err, output) {
        css = output.css;
    });
    // css = css.replace(/\n/g, '\\n');
    return css;
};
```

+ css 加载loader

```js
// ./lib/loader/style-loader.js
module.exports = function (source) {
    let style = `
    let style = document.createElement('style')
    style.innerHTML = ${JSON.stringify(source)}
    document.head.appendChild(style)
   `;
    return style;
};
```

+ 过滤掉代码中的`console` loader

```js
// ./lib/loader/drop-console.js
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generator = require('@babel/generator').default;
const types = require('@babel/types');

module.exports = function (source) {
    const ast = parser.parse(source, { sourceType: 'module' });
    traverse(ast, {
        CallExpression(path) {
            if (types.isMemberExpression(path.node.callee) && types.isIdentifier(path.node.callee.object, { name: 'console' })) {
                path.remove();
            }
        }
    });
    const output = generator(ast, { sourceType: 'module' }, source);
    return output.code;
};
```

在`compiler.js`中更新`getSource`函数。

``` js
// ./lib/compiler.js
...
getSource(modulePath) {
    let content = fs.readFileSync(modulePath, 'utf8');
    let rules = this.module.rules;
    for (let i = 0; i < rules.length; i++) {
        let rule = rules[i];
        let { test, use } = rule;
        let len = use.length;
         // 是否需要通过 loader 进行转化
        if (test.test(modulePath)) {
            while (len > 0) {
                let loader = require(use[--len]);
                content = loader(content);
            }
        }
    }
    return content;
}
...
```

``` js
// ./webpack.config.js
const path = require('path');

module.exports = {
    ...
    module: {
        rules: [
            {
                test: /\.js$/,
                use: [
                    path.resolve(__dirname, './lib/loader/drop-console.js')
                ]
            },
            {
                test: /\.(c|le)ss$/,
                use: [
                    path.resolve(__dirname, './lib/loader/style-loader.js'),
                    path.resolve(__dirname, './lib/loader/less-loader.js')
                ]
            }
        ]
    },
    ...
};
```

`src/style/theme.less`

```less
body {
    div {
        border: 1px solid plum;
        padding: 10px;
        margin-bottom: 10px;
    }

    .title {
        font-size: 18px;
        color: #333333;
        line-height: 30px;
    }
}
```

`src/style/index.css`

```css
body {
    color: blue;
}

p {
    text-align: center;
}
```

```js
...
// src/index.js
import './style/theme.less';
import './style/index.css';

...
```

运行`npm run build`，浏览器打开`src/index.html`查看效果吧。

[完整代码](https://github.com/FredaFei/tiny-webpack)

以上是整个手写 Loader 实现的全部内容。

**Webpack 手写系列**

+ [手写 Webpack打包实现](https://github.com/FredaFei/tiny-webpack/blob/webpack/doc.md)
+ [手写 Loader](https://github.com/FredaFei/tiny-webpack/blob/loader/doc.md)
+ [手写 Webpack Plugin](https://github.com/FredaFei/tiny-webpack/blob/plugin/doc.md)
