const fs = require('fs');
const path = require('path');
const fse = require('fs-extra')

const copyFolder = (serverless, commonFolder, destinationFolder) => {
  return targetFuncs(serverless)
  .map(f => {
    const destDir = path.join(serverless.config.servicePath, f.module, destinationFolder);
    const folderToCopy = path.join(serverless.config.servicePath, commonFolder);

    try {
      serverless.cli.log(`[serverless-package-copy-common] Copying from ${folderToCopy} to ${destDir}`);
      
      if (!fs.existsSync(destDir)){
        fs.mkdirSync(destDir, { recursive: true });
      }

      fse.copySync(folderToCopy, destDir)

      serverless.cli.log(`[serverless-package-copy-common] Copy finished`);
      return true;
    } catch (err) {
      serverless.cli.log(`[serverless-package-copy-common] Error Copying. ${err}`);
      return false;
    }
  });
};

const targetFuncs = (serverless) => {
  let inputOpt = serverless.processedInput.options;
  return inputOpt.function
    ? [inputOpt.functionObj]
    : values(this.serverless.service.functions);
};

module.exports = { copyFolder };
