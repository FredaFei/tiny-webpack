const path = require('path');
const fs = require('fs');
const { writeFileRecursive } = require('../util/help');
const { formatPathSep } = require('../util/help');

class CopyHtml {
    /**
     * @param options {filename 输出文件名 template 模板地址 title 文档标题}
     * */
    constructor(options) {
        this.options = options;
        this.filename = options.filename || 'index.html';
        this.template = formatPathSep(options.template);
    }

    /**
     * @param compiler 是Compiler 的实例，apply仅表示函数名
     * */
    apply(compiler) {
        //监听entryOption钩子
        // compiler.hooks.entryOption.tap('EntryOptionPlugin', () => {
        //     console.log('我监听到了EntryOptionPlugin');
        // });
        //监听done钩子
        compiler.hooks.done.tap('copy', () => {
            const { output } = compiler;
            const { path: outputDir, filename } = output;
            const outputFilename = path.join(outputDir, this.filename);
            console.log('copy-html 插件运行开始');
            writeFileRecursive(outputDir, outputFilename, this.transform(filename), (error) => {
                console.log('copy-html 插件运行结束');
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