# Lab 3 - K/V Operations

## Lab Overview

The goal of this lab is to create the logic to enable saving, updating and retrieving orders, utilizing Couchbase’s Node.js SDK, to perform K/V get, insert/upsert, and replace operations.   See SDK documentation for details on using K/V operations.

>:exclamation:**IMPORTANT**:exclamation:<br> Make sure to read all IMPORTANT, REMEMBER, NOTES and DOCUMENTATION sections as important details will be provided in those sections.

## Steps

[Step 1: Add Logic to API](#step-1-add-logic-to-api)<br> 
&nbsp;&nbsp;&nbsp;&nbsp;[Retrieve an order](#retrieve-an-order)<br> 
&nbsp;&nbsp;&nbsp;&nbsp;[Save an order](#save-an-order)<br> 
&nbsp;&nbsp;&nbsp;&nbsp;[Update an order](#update-an-order)<br> 
&nbsp;&nbsp;&nbsp;&nbsp;[Delete an order](#delete-an-order)<br> 

***

### Step 1: Add Logic to API

>**Documentation:**  SDK documentation on K/V operations be found below:<br>
>-  [Retrieving Documents](https://docs.couchbase.com/nodejs-sdk/2.6/document-operations.html#retrieving-full-documents)
>-  [Creating Documents](https://docs.couchbase.com/nodejs-sdk/2.6/document-operations.html#creating-and-updating-full-documents)
>-  [Updating Documents](https://docs.couchbase.com/nodejs-sdk/2.6/document-operations.html#creating-and-updating-full-documents)

<br>

>**NOTE:** Concerning API return values:<br>
>The K/V get operation result object contains the requested document along with some other metadata and potentially performance metrics of the API call itself.  result.value is the document that people might normally expect to be the result.
>
>When designing an API, there are a number of design/optimization choices - no ‘right’ choices, but sometimes there are ‘wrong’ ones.  You might decide that uniformity is your priority, so that
>   - getOrder()
>   - saveOrder()
>   - updateOrder()
>   - deleteOrder()
>
>would all return the same value. But then the question remains, what should that return value be?
>
>**The document?**<br> 
>  In naturally asynchronous or callback oriented languages, like Node.js, you might want to return the whole document so that the callback function that is passed in has all the information it may ever need.  But if those callback functions will not access the document very often, you could be incurring a lot of network traffic (and possibly cloud data egress costs) for information that the client may never use and probably already has - it just passed in the whole document after all.
>  
>**The id?**<br>
>   Well, this is much smaller than the whole document, so more efficient, less network contention and potentially smaller egress cost. And if you pass the id into a downstream callback, it is a quick and easy operation for the callback to fetch the whole document if it ever needs it.
>   
>**A boolean?**<br>
>   If data packet size is what we want to optimize, then you would think a boolean would be the smallest, right? Well, no. Not returning anything would be even smaller.  And if you have a properly designed error handling framework (try/catch) then returning booleans that need to be checked results in some ugly, unnecessary code.
>
>So what did we optimize for this lab? Educational impact.  The sample code we provide will show how you could return different values in each case. The choice is yours.  Our examples are not optimized for API consistency - get over it :)

#### Retrieve an order

Open the *repository.js* file in the API repository directory (see API’s project structure detailed in the [Appendix](#nodejs-api-project-structure)).  Search for the *getOrder()* method.  Edit the *getOrder()* method by adding the necessary logic to update (or replace) an order document.

#### Save an order

Open the *repository.js* file in the API repository directory (see API’s project structure detailed in the [Appendix](#nodejs-api-project-structure)).  Search for the *saveOrder()* method.  Edit the *saveOrder()* method by adding the necessary logic to insert (or upsert) an order document

#### Update an order

Open the *repository.js* file in the API repository directory (see API’s project structure detailed in the [Appendix](#nodejs-api-project-structure)).  Search for the *replaceOrder()* method.  Edit the *replaceOrder()* method by adding the necessary logic to update (or replace) an order document.

#### Delete an order

Open the *repository.js* file in the API repository directory (see API’s project structure detailed in the [Appendix](#nodejs-api-project-structure)).  Search for the *deleteOrder()* method.  Edit the *deleteOrder()* method by adding the necessary logic to remove an order document.

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


