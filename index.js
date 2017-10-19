'use strict';

const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

class PackageLib {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = {
      libFolder: options.libFolder || './lib'
    };

    this.hooks = {
      'before:package:createDeploymentArtifacts': this.symlinkPackages.bind(this),
      'after:deploy:deploy': this.removePackages.bind(this)
    };
  }

  symlinkPackages() {
    this.serverless.cli.log(`[serverless-lib-package] Symlinking packages`);
    const libs = fs.readdirSync(this.options.libFolder);
    libs.forEach(pkg => {
      fs.symlinkSync(`${this.options.libFolder}/${pkg}`, path.join(process.cwd(), pkg));
    });

    process.on('SIGTERM', () => this.removePackages());
  }

  removePackages() {
    const libs = fs.readdirSync(this.options.libFolder);
    libs.forEach(pkg => {
      rimraf.sync(path.join(process.cwd(), pkg));
    });
  }
}

module.exports = PackageLib;
