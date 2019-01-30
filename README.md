# serverless-package-copy-common

> 📦 Deploy microservice Python Serverless services with common code

Before deploying, this plugin copies contents of folders containing shared code into a directory of your choice in the Serverless microservice.

### Installation

```
npm install https://github.com/akkapur/serverless-package-common.git
```

### Usage

```yml
service: your-service

plugins:
  - serverless-package-copy-common

functions:
  # Your functions here

custom:
  packageCopyCommon:
    sources:
      - '../common'
    destination: 'my-service'
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
