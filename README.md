# serverless-package-lib

> 📦 Deploy Python Lambda functions with custom dependencies stored in a lib folder

Before deploying, this Serverless plugin symlinks third-party libraries from a lib folder to the root directory of your service so that imports work in the deployed python functions.

### Installation

```
npm i serverless-package-lib --save-dev
```

### Usage

```yml
server: your-service

plugins:
  - serverless-package-lib

functions:
  # Your functions here

custom:
  packageLib:
    libFolder: './my-lib' # Optional because the default is './lib'
```
