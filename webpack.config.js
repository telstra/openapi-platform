const webpack = require("webpack");
const { join } = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const publicPath = join(__dirname, "./public");
const frontendPath = join(__dirname, "./build/frontend");
module.exports = {
  devtool: "cheap-module-source-map",
  output: {
    path: join(__dirname, "dist")
  },
  entry: ["@babel/polyfill", join(frontendPath, "index.js")],
  plugins: [
    new HtmlWebpackPlugin({
      title: "Swagger Platform",
      template: join(publicPath, "index.html")
    })
  ],
  stats: {
    colors: true,
    modules: true,
    reasons: true,
    errorDetails: true
  },
  node: {
    fs: "empty",
    net: "empty",
    tls: "empty"
  }
};
