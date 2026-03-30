const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

/** @param {string} name */
function assetSourceToString(source) {
  if (typeof source === "string") return source;
  const s = source && typeof source.source === "function" ? source.source() : source;
  if (Buffer.isBuffer(s)) return s.toString("utf8");
  return String(s ?? "");
}

class CriticalCssInlineAndDeferPlugin {
  /**
   * @param {{ isProd: boolean }} opts
   */
  constructor(opts) {
    this.isProd = opts.isProd;
  }

  /** @param {import("webpack").Compiler} compiler */
  apply(compiler) {
    compiler.hooks.compilation.tap("CriticalCssInlineAndDeferPlugin", (compilation) => {
      const hooks = HtmlWebpackPlugin.getHooks(compilation);
      hooks.beforeEmit.tapAsync("CriticalCssInlineAndDeferPlugin", (data, cb) => {
        try {
          let html = data.html;
          let criticalCss = "";

          for (const { name, source } of compilation.getAssets()) {
            if (/^css\/critical\.[a-f0-9]+\.css$/i.test(name) || name === "css/critical.css") {
              criticalCss = assetSourceToString(source);
              break;
            }
          }

          if (criticalCss) {
            criticalCss = criticalCss.replace(
              /\/\*# sourceMappingURL=[^*]+\*\/\s*$/i,
              ""
            );
            criticalCss = criticalCss.replace(
              /url\(\.\.\/assets\//g,
              "url(assets/"
            );
            if (html.includes("</title>")) {
              html = html.replace("</title>", `</title><style>${criticalCss}</style>`);
            } else {
              html = html.replace("</head>", `<style>${criticalCss}</style></head>`);
            }
          }

          if (data.outputName === "index.html") {
            html = html.replace(
              /<link\s+[^>]*(?:href="(css\/index\.[^"]+\.css)"[^>]*rel="stylesheet"|rel="stylesheet"[^>]*href="(css\/index\.[^"]+\.css)")[^>]*\/?>/gi,
              (_, href1, href2) => {
                const href = href1 || href2;
                return `<link rel="preload" href="${href}" as="style" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" href="${href}"></noscript>`;
              }
            );
          }

          data.html = html;

          if (this.isProd && data.outputName === "index.html") {
            for (const { name } of compilation.getAssets()) {
              if (
                /^css\/critical\.[a-f0-9]+\.css$/i.test(name) ||
                /^js\/critical\.[a-f0-9]+\.js$/i.test(name) ||
                /^js\/critical\.[a-f0-9]+\.js\.map$/i.test(name)
              ) {
                compilation.deleteAsset(name);
              }
            }
          }

          cb(null, data);
        } catch (e) {
          cb(e);
        }
      });
    });
  }
}

/** @param {unknown} _env @param {{ mode?: string }} argv */
module.exports = (_env, argv) => {
  const isProd = argv.mode === "production";

  return {
    context: __dirname,
    entry: {
      critical: "./src/critical.js",
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
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: isProd ? "css/[name].[contenthash:8].css" : "css/[name].css",
      }),
      // Секции — сырой HTML: пути вроде assets/images/... должны лежать в dist (devServer смотрит только в dist).
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, "src/assets"),
            to: "assets",
            noErrorOnMissing: true,
          },
        ],
      }),
      new CriticalCssInlineAndDeferPlugin({ isProd }),
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
