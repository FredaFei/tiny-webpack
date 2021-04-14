/**
 * @desc 删除console
 * @date 2021/4/14 16:45
 */
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