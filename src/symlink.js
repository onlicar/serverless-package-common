const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const yesno = require('yesno');
const ncp = require('ncp').ncp;
const fse = require('fs-extra')

const exists = path => {
  try {
    const stats = fs.lstatSync(path);
    console.log(path);
    if(!stats.isSymbolicLink()) {
      return true;
    }
  } catch(e) {}

  return false;
};

const askToOverwrite = (targetExists, folder) => {
  let ask = Promise.resolve();
  if(targetExists.length > 0) {
    ask = new Promise((resolve, reject) => {
      let targets = 'Folders';
      console.log(targetExists);
      if(targetExists.length < 5) {
        targets = targetExists.join(', ');
      }
      yesno.ask(`${targets} from ${folder} already exist${targetExists.length == 1 ? 's' : ''} in the service folder, do you want to overwrite files?`, false, ok =>
        ok ? resolve() : reject()
      );
    });
  }

  return ask;
};

// Symlink a folder
const createFolder = (folder, serverless) => {
  //const target = path.join(process.cwd(), folder.replace(/..\//g, ''));
  const target = path.join(process.cwd(), folder);
  // Check if folder/file with symlink name already exists in top level
  return askToOverwrite(exists(target) ? [target] : [], folder)
    .then(() => {
      // There is either no conflict or the user has accepted overwriting
      serverless.cli.log(`[serverless-package-common] Symlinking folder ${target}`);
      rimraf.sync(target);
      fs.symlinkSync(folder, target);
    });
};

const copyFolder = (serverless) => {

  return targetFuncs(serverless)
/*   .map(f => {
    if (!get(f, 'module')) {
      set(f, ['module'], '.');
    }
    return f;
  }) */
  .map(f => {
    serverless.cli.log(
      `Copying common modules for ${f.module}...`
    );
    const folderToCopy = path.join(serverless.config.servicePath, 'src');
    const destination = path.join(serverless.config.servicePath, f.module);
    try {
      serverless.cli.log(`Copying from ${folderToCopy} to ${destination}`);
      fse.copySync(folderToCopy, destination)
      serverless.cli.log(`[serverless-package-common] Copy finished`);
      return true;
    } catch (err) {
      serverless.cli.log(`[serverless-package-common] Error Copying. ${err}`);
      return false;
    }
  });
};

const removeFolder = folder => {
  const folderToRemove = path.join(process.cwd(), folder);
  serverless.cli.log(`[serverless-package-common] Un-Symlinking folder ${folderToRemove}`);
  rimraf.sync(folderToRemove);
};

const targetFuncs = (serverless) => {
  let inputOpt = serverless.processedInput.options;
  return inputOpt.function
    ? [inputOpt.functionObj]
    : values(this.serverless.service.functions);
};

module.exports = { createFolder, removeFolder, copyFolder };
