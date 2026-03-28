const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
/** @param {unknown} _env @param {{ mode?: string }} argv */
module.exports = (_env, argv) => {
  const isProd = argv.mode === "production";

  return {
    context: __dirname,
    entry: {
      index: "./src/main.js",
      thankyou: "./src/thankyou-main.js",
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      clean: true,
      filename: isProd ? "js/[name].[contenthash:8].js" : "js/[name].js",
      assetModuleFilename: "assets/[hash][ext][query]",
    },
    devtool: isProd ? "source-map" : "eval-source-map",
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: [MiniCssExtractPlugin.loader, "css-loader"],
        },
        {
          test: /\.(woff2|png|jpe?g|gif|webp|avif)$/i,
          type: "asset/resource",
        },
        {
          test: /\.html$/i,
          include: path.resolve(__dirname, "src/sections"),
          type: "asset/source",
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: isProd ? "css/[name].[contenthash:8].css" : "css/[name].css",
      }),
      new HtmlWebpackPlugin({
        template: "./src/index.html",
        filename: "index.html",
        chunks: ["index"],
        inject: "body",
        scriptLoading: "defer",
        minify: isProd
          ? {
              collapseWhitespace: true,
              keepClosingSlash: true,
              removeComments: true,
            }
          : false,
      }),
      new HtmlWebpackPlugin({
        template: "./src/pages/thankyoupage.html",
        filename: "pages/thankyoupage.html",
        chunks: ["thankyou"],
        inject: "body",
        scriptLoading: "defer",
        minify: isProd
          ? {
              collapseWhitespace: true,
              keepClosingSlash: true,
              removeComments: true,
            }
          : false,
      }),
    ],
    optimization: {
      minimizer: [`...`, new CssMinimizerPlugin()],
    },
    devServer: {
      static: path.join(__dirname, "dist"),
      port: 8080,
      hot: true,
      open: true,
    },
    performance: {
      hints: false,
    },
  };
};
