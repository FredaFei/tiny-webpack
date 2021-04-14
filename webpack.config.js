const path = require('path');

module.exports = {
    entry: path.join(__dirname, './src/index.js'),
    output: {
        path: path.join(__dirname, './dist'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: [
                    path.resolve(__dirname, './lib/loader/drop-console.js')
                ]
            },
            {
                test: /\.(c|le)ss$/,
                use: [
                    path.resolve(__dirname, './lib/loader/style-loader.js'),
                    path.resolve(__dirname, './lib/loader/less-loader.js')
                ]
            }
        ]
    },
};