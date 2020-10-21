# Project Overview
This project is a node.js API that can demonstrate some of the capabilities of Couchbase.  It was built for Couchbase Developer Days and works in conjuction with a Web UI (Github repository [here](https://github.com/thejcfactor/cb-dev-days-web)).  The API is built using the Couchbase 2.x node.js SDK (SDK documentation [here](https://docs.couchbase.com/nodejs-sdk/2.6/start-using-sdk.html)).

The master branch contains the full completed API.  Each lab that is associated with Couchbase Developer Days has a corresponding start and completed branch.  See [Labs](#couchbase-developer-day-labs) section for branch details.

# Couchbase Developer Day Labs
#### Prerequites
#### Lab 0:  Environment Setup
In this lab, the user will complete the following:
1. Setup the Web UI using *Docker*
2. Setup the node.js API for Lab 0 using *Docker*

#### Lab 1

#### Lab Branches
|Lab | Description | Start Branch | Complete Branch |
|---|---|---|---|
|Lab 0 | API setup | lab0 | N/A |
|Lab 1 | K/V get() | lab1-start | lab1-complete |

# Project Structure
```
|—— configuration
|  |—— config.js
|  |—— config.json
|
|—— controllers
|  |—— productController.js
|  |—— testController.js
|  |—— userController.js
|
|—— library
|  |—— outputMessage.js
|  |—— verifyToken.js
|
|—— repository
|  |—— repository.js
|
|—— service
|  |—— productService.js
|  |—— userService.js
|
|—— Dockefile.dev
|—— package.json
|—— server.js
```

# Configuration
The following configurations values can be changed by making updates to the ./configuration/config.json file.
- API port
  - type:  integer
  - default:  3000
- database:
  - host:
    - type: string
    - default:  localhost
  - bucket
    - type: string
    - default:  retail-sample
  - username
    - type: string
    - default: Administrator
  - password
    - type: string
    - default: password
- session TTL (seconds): 
  - type: integer
  - default:  300