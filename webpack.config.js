const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
    const isDev = argv.mode === 'development';
    const entry = 'src/index.ts';
    return {
        entry: path.resolve(__dirname, entry),
        devtool: isDev ? 'inline-source-map' : false,
        module: {
            rules: [
                {
                    test: /\.(js|jsx|tsx|ts)$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: 'ts-loader',
                        }
                    ]
                },
            ],
        },
        resolve: {
            alias: {
                'src': path.resolve(__dirname, 'src'),
            },
            extensions: ['.tsx', '.ts', '.jsx', '.js'],
        },
        output: isDev ? undefined : {
            path: path.resolve(__dirname, 'dist'),
            filename: 'index.js',
            libraryTarget: 'umd'
        },
        plugins: [
            isDev && new HtmlWebpackPlugin({
                filename: 'index.html',
                template: path.resolve(__dirname, 'index.html'),
                chunks: [ 'main' ]
            }),
        ].filter(x => x),
        devServer: {
            https: true,
            allowedHosts: 'all',
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
                "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
            }
        }
    }
};