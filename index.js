'use strict';

const symlink = require('./src/symlink');

class PackageLib {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = Object.assign({
      libFolder: './lib',
      common: []
    }, this.serverless.service.custom && this.serverless.service.custom.packageLib || {});

    this.symlinked = false;

    this.hooks = {
      'before:package:createDeploymentArtifacts': this.beforeDeploy.bind(this),
      'after:deploy:deploy': this.afterDeploy.bind(this)
    };

    this.handleExit();
  }

  beforeDeploy() {
    // Copy lib folder
    return symlink.create(this.options.libFolder, this.serverless)
      .then(() => {
        this.symlinked = true;

        // Copy any common folders
        return Promise.all(this.options.common.map(commonFolder => {
            this.copiedCommon = true;
            return symlink.createFolder(commonFolder, this.serverless);
          }))
          .then(() => {
            this.serverless.cli.log(`[serverless-lib-package] Lib Package is complete`);
          });
      });
  }

  afterDeploy() {
    if(this.symlinked) {
      symlink.remove(this.options.libFolder);
    }
    if(this.copiedCommon) {
      this.options.common.forEach(commonFolder => {
        const target = commonFolder.replace(/..\//g, '');
        symlink.removeFolder(target);
      });
    }
  }

  handleExit(func) {
    ['SIGINT', 'SIGTERM', 'SIGQUIT']
      .forEach(signal => process.on(signal, () => {
        this.afterDeploy();
      }));
  }
}

module.exports = PackageLib;
