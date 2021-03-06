const path = require("path");
const config = {
    entry: {
        myPromise: "./src/index.ts",
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
};
module.exports = config;