module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|svg|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
    ],
  },
}
