const Compiler = require('./lib/compiler');
const webpackConfig = require('./webpack.config');

new Compiler(webpackConfig).run();