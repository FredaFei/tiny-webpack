const Compiler = require('./lib/compiler');
const webpackConfig = require('./webpack.config');

const compiler = new Compiler(webpackConfig);

// 在外部触发entryOption钩子
// compiler.hooks.entryOption.call();
compiler.run();