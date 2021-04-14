const fs = require('fs');
const path = require('path');

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

module.exports = { writeFileRecursive, formatPathSep };