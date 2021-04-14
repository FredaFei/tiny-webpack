const less = require('less');

module.exports = function (source) {
    let css = '';
    less.render(source, function (err, output) {
        css = output.css;
    });
    // css = css.replace(/\n/g, '\\n');
    return css;
};