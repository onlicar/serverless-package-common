'use strict';

const symlink = require('./src/symlink');

class PackageCommon {
  constructor(serverless, options, { log }) {
    this.log = log;
    this.serverless = serverless;
    this.options = Object.assign({
      common: []
    }, this.serverless.service.custom && this.serverless.service.custom.packageCommon || {});

    this.symlinked = false;

    this.hooks = {
      'before:package:createDeploymentArtifacts': this.beforePackage.bind(this),
      'after:package:finalize': this.afterPackage.bind(this)
    };

    this.handleExit();
  }

  beforePackage() {
    // Symlink common folders
    return Promise.all(this.options.common.map(commonFolder => {
        this.symlinked = true;
        return symlink.createFolder(commonFolder, this.serverless);
      }))
      .then(() => {
        this.log.success('Common packaging complete');
      });
  }

  afterPackage() {
    if(this.symlinked) {
      this.options.common.forEach(commonFolder => {
        symlink.removeFolder(commonFolder);
      });
    }
  }

  handleExit(func) {
    ['SIGINT', 'SIGTERM', 'SIGQUIT']
      .forEach(signal => process.on(signal, () => {
        this.afterPackage();
      }));
  }
}

module.exports = PackageCommon;
