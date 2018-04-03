# serverless-package-common

> 📦 Deploy microservice Python Serverless services with common code

Before deploying, this plugin symlinks folders containing shared code into the root directory of your Serverless microservice.

### Installation

```
npm i serverless-package-common --save-dev
```

### Usage

```yml
service: your-service

plugins:
  - serverless-package-common

functions:
  # Your functions here

custom:
  packageCommon:
    common:
      - '../common'
```

#### Example Directory Structure

```
my-project@1.0.0
└── common
    └── resource.py
└── my-service
    └── handler.py
    └── serverless.yml
└── other-service
    └── handler.py
    └── serverless.yml
```

In handler.py, common code is import like so:
```py
from common.resource import shared_resource
```

#### Developing

To use with [serverless-offline](https://github.com/dherault/serverless-offline) or test suites, set your `PYTHONPATH` to the project's root directory. You can add this script to run as `offline:start` in package.json.

start-offline.sh
```bash
#!/bin/bash
# Run serverless offline for a given microservice

service=${1}

if [ -z "$service" ]
    then
        echo "No service specified"
        echo "Usage: npm run offline:start <service>"
        exit
    fi
        export PYTHONPATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
        echo "Setting PYTHONPATH to project root:" $PYTHONPATH

        cd $service

        serverless offline start
```
