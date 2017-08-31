'use strict';

const path = require('path');

module.exports = function(options) {
  return Object.assign({
    setupPreprocessorRegistry(type, registry) {
      if (type === 'self') {
        this.treePaths.addon = path.resolve(__dirname, '..', 'dist', 'modules', 'src');

        registry.add('js', {
          name: 'babel-with-app-settings',
          ext: 'js',
          toTree: tree => this.project.findAddonByName('ember-cli-babel').transpileTree(tree)
        });
      }
    }
  }, options);
}