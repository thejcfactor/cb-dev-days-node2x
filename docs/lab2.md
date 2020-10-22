# Lab 2 - FTS Operations

## Lab Overview

The goal of this lab is to create the logic to enable searching for products by utilizing Couchbase’s Node.js SDK to perform full text search (FTS) operations and return multiple documents based on FTS results.   See SDK documentation for details on FTS operations.

>:exclamation:**IMPORTANT**:exclamation:<br> Make sure to read all IMPORTANT, REMEMBER, NOTES and DOCUMENTATION sections as important details will be provided in those sections.

## Steps

[Step 1: Add Logic to API](#step-1-add-logic-to-api)<br> 

***

### Step 1: Add Logic to API

>**Documentation:**  SDK documentation on full text search can be found [here](https://docs.couchbase.com/nodejs-sdk/2.6/full-text-searching-with-sdk.html).

>:exclamation:**IMPORTANT:**:exclamation: The K/V get operation result object contains the document along with some other metadata.  For purposes of this lab, and all other labs, only the document contents should be returned.  Therefore, upon a successful get operation, result.value is what should be returned.

*searchProducts()* input:
- product:  string - search term to use on products
- fuzziness:  integer between 0 and 2
- callback

*searchProducts()* output:
- error object, if applicable
- products:  array - product documents found in search

See the following code snippet below for a possible implementation of the *searchProducts()* method.  This, or a similar solution, can be used to implement the *searchProducts()* method logic.  

>:exclamation:**REMEMBER:**  Either comment out or replace the NOP line of code ( e.g. ```callback(null, “NOP”)``` ) with the new code created in the lab.

```javascript
```

Notes about the code:
- Line 10:  All K/V operations are done at the bucket level for 2.x SDKs (this changes for 3.x SDKs).
- Lines 12 - 15:  
- Line 20:  
- Line 27:  
- Line 33:  
- *outputMessage()*:  a helper method used to easily print out information to the console, method can be found in the /library directory (see API’s project structure detailed in the [Appendix](#nodejs-api-project-structure))
- try/catch & err object handling is purposefully done in a generic fashion.  The lab participant is free to add logic accordingly to test out various methods of handling errors.

### Appendix
#### Node.js API Project Structure

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


