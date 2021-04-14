const fs = require('fs');
const path = require('path');
const { writeFileRecursive, formatPathSep } = require('./util/help');
const { getAST, getDependencies, transform } = require('./parser');

module.exports = class Compiler {
    constructor(options) {
        const { entry, output, module = {}} = options;
        this.entry = formatPathSep(entry);
        this.output = output;
        this.module = module;
        this.modules = [];
    }

    run() {
        this.buildDependencies();
        this.emitFiles();
    };

    buildModule(filename, isEntry) {
        const _path = isEntry ? filename : path.join(process.cwd(), './src', filename);
        const source = this.getSource(formatPathSep(_path));
        const ast = getAST(source);
        return {
            filename: formatPathSep(filename),
            dependencies: getDependencies(ast),
            transformCode: transform(ast)
        };
    }

    buildDependencies() {
        const entryModule = this.buildModule(this.entry, true);
        this.modules.push(entryModule);
        this.modules.map((_module) => {
            _module.dependencies.map((dependency) => {
                this.modules.push(this.buildModule(dependency));
            });
        });
    }

    getSource(modulePath) {
        let content = fs.readFileSync(modulePath, 'utf8');
        return content;
    }

    bundle() {
        let result = '';
        this.modules.map((_module) => {
            result += `'${_module.filename}' : function(require, module, exports) {${_module.transformCode}},`;
        });
        return `
            (function(modules) {
              function require(fileName) {
                const fn = modules[fileName];
                const module = { exports: {}};
                fn(require, module, module.exports)
                return module.exports
              }
              require('${this.entry}')
            })({${result}})
        `;
    }

    emitFiles() {
        const { path: outputDir, filename } = this.output;
        const outputPath = path.join(outputDir, filename);
        writeFileRecursive(outputDir, outputPath, this.bundle(), error => {
            console.log(error);
        });
    }
};