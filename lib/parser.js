const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const { transformFromAstSync } = require('@babel/core');

module.exports = {
    getAST(source) {
        return parser.parse(source, {
            sourceType: 'module', //表示要解析的是ES模块
        });
    },
    getDependencies(ast) {
        const dependencies = [];
        traverse(ast, {
            ImportDeclaration({ node }) {
                dependencies.push(node.source.value);
            }
        });
        return dependencies;
    },
    transform(ast) {
        // 将获得的ES6的AST转化成ES5
        const { code } = transformFromAstSync(ast, null, {
            presets: [ '@babel/preset-env' ],
        });
        return code;
    },
};