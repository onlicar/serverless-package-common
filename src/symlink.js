const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const yesno = require('yesno');

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
  const target = path.join(process.cwd(), path.basename(folder));

  // Check if folder/file with symlink name already exists in top level
  return askToOverwrite(exists(target) ? [target] : [], folder)
    .then(() => {
      // There is either no conflict or the user has accepted overwriting
      serverless.cli.log(`[serverless-package-common] Symlinking ${folder}`);
      rimraf.sync(target);
      fs.symlinkSync(folder, target);
    });
};

const removeFolder = folder => {
  rimraf.sync(path.join(process.cwd(), folder));
};

module.exports = { createFolder, removeFolder };
