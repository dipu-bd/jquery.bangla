const path = require('path');

module.exports = {
  entry: {
    'bangla-input': './src/index.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].min.js'
  }
};
