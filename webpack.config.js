const path = require("path");

module.exports = {
  entry: './src/index.js',
  mode: "production",
  output: {
    filename: "main.bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        include: [path.resolve(__dirname, "./src/assets/js")],
        loader: "babel-loader"
      }
    ]
  }
};