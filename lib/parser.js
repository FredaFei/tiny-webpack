const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const { transformFromAst } = require('babel-core');

module.exports = {
    getAST(path) {
        const source = fs.readFileSync(path, 'utf-8');
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
        const { code } = transformFromAst(ast, null, {
            presets: [ 'env' ],
        });
        return code;
    },
};