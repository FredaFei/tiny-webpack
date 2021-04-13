const Compiler = require('./lib/compiler');
const webpackConfig = require('./build/webpack.config');

new Compiler(webpackConfig).run();