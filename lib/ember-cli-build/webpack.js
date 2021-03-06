const CachingWriter = require('broccoli-caching-writer');
const Webpack = require('webpack');
const path = require('path');
const glob = require('glob');

class WebpackPlugin extends CachingWriter {
  constructor(input, { annotation, entry, destDir, webpack } = {}) {
    super(input, { annotation });

    if (!webpack) {
      throw new Error('must supply webpack options');
    }

    this.destDir = destDir || '.';
    this.webpackOptions = webpack;
  }

  build() {
    let promises = this.inputPaths.map(context => {
      let { entry } = this.webpackOptions;

      if (typeof entry === 'function') {
        let callback = entry;

        entry = function() {
          let original = process.cwd();

          try {
            process.chdir(context);
            return callback();
          } finally {
            process.chdir(original);
          }
        }
      }

      let options = Object.assign({}, this.webpackOptions, {
        context,
        entry,
        resolve: Object.assign({}, this.webpackOptions.resolve, {
          modules: [path.resolve(process.cwd(), 'node_modules'), context]
        }),
        output: Object.assign({}, this.webpackOptions.output, {
          path: path.resolve(this.outputPath, this.destDir)
        })
      });

      let compiler = Webpack(options);

      return new Promise((res, rej) => {
        compiler.run((err, stats) => {
          if (err) rej(err);
          res(stats);
        })
      });
    });

    return Promise.all(promises);
  }
}

module.exports = function webpack(input, options) {
  input = Array.isArray(input) ? input : [input];
  return new WebpackPlugin(input, options);
};
