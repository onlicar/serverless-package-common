'use strict';

const symlink = require('./src/symlink');

class PackageCopyCommon {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = Object.assign({
      sources: [],
      destination: ''
    }, this.serverless.service.custom && this.serverless.service.custom.packageCopyCommon || {});

    this.hooks = {
      'before:package:createDeploymentArtifacts': this.copyCommon.bind(this),
      'before:deploy:function:packageFunction': this.copyCommon.bind(this)
    };
  }

  copyCommon() {
    const destination = this.options.destination;
    return Promise.all(this.options.sources.map(commonFolder => {
        return symlink.copyFolder(this.serverless, commonFolder, destination);
      }))
      .then(() => {
        this.serverless.cli.log(`[serverless-package-copy-common] Package Copy Common is complete`);
      });
  }
}

module.exports = PackageCopyCommon;
