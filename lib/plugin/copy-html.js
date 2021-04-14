const path = require('path');
const fs = require('fs');
const { writeFileRecursive } = require('../util/help');
const { formatPathSep } = require('../util/help');

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
            // console.log(...arguments);
            const outputPath = path.join(compiler.output.path, this.filename);
            writeFileRecursive(compiler.output.path, outputPath, this.getResource(), (error) => {
                console.log(error);
            });
        });
    }

    getResource() {
        let content = fs.readFileSync(this.template, 'utf8');
        return content;
    }
}

module.exports = CopyHtml;