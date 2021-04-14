const Compiler = require('./lib/compiler');
const webpackConfig = require('./webpack.config');

const compiler = new Compiler(webpackConfig);

compiler.hooks.entryOption.call();
compiler.run();