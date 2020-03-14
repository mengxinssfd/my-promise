const path = require("path");
const HtmlPlugin = require("html-webpack-plugin");
const config = {
    entry: {
        stateMachine: "./src/dev.ts",
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].js",
    },
    module: {
        rules: [
            {
                test: /\.tsx?/,
                use: "ts-loader",
            },
        ],
    },
    resolve: {
        extensions: [".js", ".ts"],
    },
    plugins: [
        new HtmlPlugin({
            template: './index.html',
            filename: 'index.html',
            chunks: ['stateMachine'],// 于loader一样，在后面的会插到前面去
        })
    ]
};
module.exports = config;