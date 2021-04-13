const fs = require('fs');
const path = require('path');
const { getAST, getDependencies, transform } = require('./parser');

function writeFileRecursive(outputDir, outputFilename, buffer, callback) {
    fs.mkdir(outputDir, { recursive: true }, (err) => {
        if (err) return callback(err);
        fs.writeFile(outputFilename, buffer, function (err) {
            if (err) return callback(err);
            return callback(null);
        });
    });
};

/**
 * 解决Linux与Windows下路径分隔符问题
 * */
function formatPathSep(string) {
    return string.split(path.sep).join('/');
}

module.exports = class Compiler {
    constructor(options) {
        const { entry, output } = options;
        this.entry = formatPathSep(entry);
        this.output = output;
        this.modules = [];
    }

    run() {
        this.buildDependencies();
        this.emitFiles();
    };

    buildModule(filename, isEntry) {
        const _path = isEntry ? filename : path.join(process.cwd(), './src', filename);
        const ast = getAST(formatPathSep(_path));
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