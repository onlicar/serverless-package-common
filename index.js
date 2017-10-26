'use strict';

const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const yesno = require('yesno');

class PackageLib {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = Object.assign({
      libFolder: './lib'
    }, this.serverless.service.custom && this.serverless.service.custom.packageLib || {});
    this.ran = false;

    this.hooks = {
      'before:package:createDeploymentArtifacts': this.symlinkPackages.bind(this),
      'after:deploy:deploy': this.removePackages.bind(this)
    };
  }

  symlinkPackages() {
    const libs = fs.readdirSync(this.options.libFolder);
    
    // Check if folder/file with symlink name already exists in top level
    let targetExists = [];
    libs.map(pkg => {
      try {
        const stats = fs.lstatSync(path.join(process.cwd(), pkg));
        if(!stats.isSymbolicLink()) {
          targetExists.push(pkg);
        }
      } catch(e) {}
    });

    let askToOverwrite = Promise.resolve();
    if(targetExists.length > 0) {
      askToOverwrite = new Promise((resolve, reject) => {
        let targets = 'Folders';
        if(targetExists < 5) {
          targets = targetExists.join(', ');
        }
        yesno.ask(`${targets} from ${this.options.libFolder} already exist${targetExists.length == 1 ? 's' : ''} in the service folder, do you want to overwrite files?`, false, ok =>
          ok ? resolve() : reject()
        );
      });
    }

    return askToOverwrite.then(() => {
      // There is either no conflicts or the user has accepted overwriting
      this.serverless.cli.log(`[serverless-lib-package] Symlinking packages`);
      process.on('SIGTERM', () => this.removePackages());
      libs.map(pkg => {
        const target = path.join(process.cwd(), pkg);
        rimraf.sync(target);
        fs.symlinkSync(`${this.options.libFolder}/${pkg}`, target);
      });
      this.ran = true;
    });
  }

  removePackages() {
    if(this.ran) {
      const libs = fs.readdirSync(this.options.libFolder);
      libs.forEach(pkg => {
        rimraf.sync(path.join(process.cwd(), pkg));
      });
    }
  }
}

module.exports = PackageLib;
