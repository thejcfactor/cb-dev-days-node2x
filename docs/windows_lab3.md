# Lab 3 - K/V Operations

## Lab Overview

The goal of this lab is to create the logic to enable saving, updating and retrieving orders, utilizing Couchbase’s Node.js SDK, to perform K/V get, insert/upsert, and replace operations.   See SDK documentation for details on using K/V operations.

>:exclamation:**IMPORTANT**:exclamation:<br> Make sure to read all IMPORTANT, REMEMBER, NOTES and DOCUMENTATION sections as important details will be provided in those sections.

<br>

[Back to Labs](./labs.md)<br> 

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

*getOrder()* input:
- orderId:  string - document key for an order document
- callback

*getOrder()* output:
- error object, if applicable
- order document:  see [Appendix](#sample-order-document) for a sample order document

See the following code snippet below for a possible implementation of the *getOrder()* method.  This, or a similar solution, can be used to implement the *getOrder()* method logic.

>:exclamation:**REMEMBER:**  Either comment out or replace the NOP line of code ( e.g. ```callback(null, “NOP”)``` ) with the new code created in the lab.

```javascript
 getOrder(orderId, callback) {
   try {
     /**
      * Lab 3:  K/V operation(s):
      *  1.  get order:  bucket.get(key)
      *
      */
     this.bucket.get(orderId, function(err, doc) {
       let order = !err ? doc.value : null;
       callback(err, order);
     });
   } catch (err) {
     //Optional - add business logic to handle error types
     outputMessage(err, "repository.js:getOrder() - error:");
     callback(err, null);
   }
 }

```

Notes about the code:
- Line 7: All K/V operations are done at the bucket level for 2.x SDKs (this changes for 3.x SDKs). 
    + K/V get operation parameters:
        * document key
        * callback
- Line 8:  Returning only the value of the result if there is not an error.  The lab(s) only need the document’s content to be returned.
- *outputMessage()*:  a helper method used to easily print out information to the console, method can be found in the /library directory (see API’s project structure detailed in the [Appendix](#nodejs-api-project-structure))
- try/catch & err object handling is purposefully done in a generic fashion.  The lab participant is free to add logic accordingly to test out various methods of handling errors.

Once complete, make sure the *repository.js* file is saved. Once the code has been saved, the functionality to retrieve a specific order can be tested.  Using the *getOrder()* requires authorization, if wanting to test the logic via the *SwaggerUI* page, follow the authorization steps listed in the [Appendix](#authorize-using-the-swaggerui-page).  Follow the steps below to verify the *getOrder()* logic.

1. Navigate to the *SwaggerUI* page:  http://localhost:3000/api-docs/
2. Click on the */user/getOrder* endpoint
3. After the panel expands, click the *Try it out* button
4. Enter an orderId into the provided text input field.
    - Example: order_1000
5. Click on the *Execute* button
6. The response Code should be 200 and the *Response* body should contain a *data* property that contains the document contents from the order key entered in step #4.

**Sample *Response* body:**<br>
The data object has been removed in order to save space.

```json
{
  "data": {
   ... sample order document JSON ...
  },
  "message": "Successfully retrieved order.",
  "error": null,
  "authorized": true,
  "requestId": null
}

```

#### Save an order

Open the *repository.js* file in the API repository directory (see API’s project structure detailed in the [Appendix](#nodejs-api-project-structure)).  Search for the *saveOrder()* method.  Edit the *saveOrder()* method by adding the necessary logic to insert (or upsert) an order document

Some things to think about:<br>
1. How to set the value of a new orderId?
    - Hint:  check out the provided helper methods in the [Appendix](#helper-methods)
2. What does the insert/upsert method return?
3. How to return a newly inserted order document?
    - Hint: user the method recently created

*saveOrder()* input:
- order document:  see [Appendix](#sample-order-document) for a sample order document
- callback

*saveOrder()* output:
- error object, if applicable
- order document:  see [Appendix](#sample-order-document) for a sample order document

See the following code snippet below for a possible implementation of the *saveOrder()* method.  This, or a similar solution, can be used to implement the *saveOrder()* method logic.

>:exclamation:**REMEMBER:**  Either comment out or replace the NOP line of code ( e.g. ```callback(null, “NOP”)``` ) with the new code created in the lab.

```javascript
saveOrder(order, callback) {
   try {
     /**
      * Lab 3:  K/V operation(s):
      *  1.  generate key:  order_<orderId>
      *  2.  insert order:  bucket.insert(key, document)
      *  3.  IF successful insert, GET order
      *
      */
     let scope = this;
     this.getNextOrderId(function(err, orderId) {
       if (orderId) {
         let createDateTimeStamp = Math.floor(new Date() / 1000);
         let key = `order_${orderId}`;
 
         order._id = key;
         order.orderId = orderId;
         order.doc.created = createDateTimeStamp;
         order.doc.createdBy = order.custId;
 
         scope.bucket.insert(key, order, function(err, result) {
           if (!err && result) {
             scope.getOrder(key, callback);
           } else {
             callback(err, null);
           }
         });
       }
     });
   } catch (err) {
     //Optional - add business logic to handle error types
     outputMessage(err, "repository.js:saveOrder() - error:");
     callback(err, null);
   }
 }

```

Notes about the code:
- Line 10: utilizing a helper method, getNextOrderId(), to seed the new orderId value
- Lines 12-18:  Adding document components to the provided order document.
- Line 20: All K/V operations are done at the bucket level for 2.x SDKs (this changes for 3.x SDKs). 
    + K/V insert operation parameters:
        * document key
        * document
        * callback
- Line 22:  Since an insert/upsert K/V operation does not return the document, utilizing a previous K/V get operation in order to return the recently created order.  Another approach is to just return the document that was passed into the insert/upsert operation.
- *outputMessage()*:  a helper method used to easily print out information to the console, method can be found in the /library directory (see API’s project structure detailed in the [Appendix](#nodejs-api-project-structure))
- try/catch & err object handling is purposefully done in a generic fashion.  The lab participant is free to add logic accordingly to test out various methods of handling errors.

Once complete, make sure the *repository.js* file is saved.  Once the code has been saved, the save order functionality should be active within the web UI.   Follow the steps below to verify the *saveOrder()* logic.

>**NOTE:**  Using the *saveOrder()* requires authorization, if wanting to test the logic via the *SwaggerUI* page, follow the authorization steps listed in the [Appendix](#authorize-using-the-swaggerui-page).

1. Go to http://localhost:8080
2. If not logged in:
    - In the top right corner, click the *Hello* next to the user icon, and a drop down menu should appear.
    - In the drop down menu, click *Sign In*, the web UI should redirect to the *Login* page.
    - Enter username and password credentials
    - Click *Login*
    - After logging in, the web UI should redirect to the *Home* page.  Go to step #3
3. If not at the home page (i.e. the search box isn’t showing)
    - In the top left corner, click the *Couchbase | NoEQUAL* image to go to the Home screen.
4. Enter a product in the *search box* and click the *magnifying glass* to run the search.
5. On an in stock product, click the drop down arrow in the bottom left corner, the product detail should appear along with the ability to increment/decrement a product count and add the product to the cart
6. Click the + button
7. Click *ADD TO CART*
8. The cart icon in the top right corner should increment by the number of added products.

#### Update an order

Open the *repository.js* file in the API repository directory (see API’s project structure detailed in the [Appendix](#nodejs-api-project-structure)).  Search for the *replaceOrder()* method.  Edit the *replaceOrder()* method by adding the necessary logic to update (or replace) an order document.

*replaceOrder()* input:
- order document:  see [Appendix](#sample-order-document) for a sample order document
- callback

*replaceOrder()* output:
- error object, if applicable
- order document key

See the following code snippet below for a possible implementation of the *replaceOrder()* method.  This, or a similar solution, can be used to implement the *replaceOrder()* method logic.

>:exclamation:**REMEMBER:**  Either comment out or replace the NOP line of code ( e.g. ```callback(null, “NOP”)``` ) with the new code created in the lab.

```javascript
 replaceOrder(order, callback) {
   try {
     /**
      * Lab 3:  K/V operation(s):
      *  1.  generate key:  order_<orderId>
      *  2.  replace order:  bucket.replace(key, document)
      *
      */
     let key = `order_${order.orderId}`;
     order.doc.modified = Math.floor(new Date() / 1000);
     order.doc.modifiedBy = order.custId;
     this.bucket.replace(key, order, function(err, result) {
       callback(err, !err ? key : null);
     });
   } catch (err) {
     //Optional - add business logic to handle error types     
     outputMessage(err, "repository.js:replaceOrder() - error:");
     callback(err, null);
   }
 }
```

Notes about the code:
- Lines 8-10: Setting the key for the order document and updating the audit properties.
- Line 11: All K/V operations are done at the bucket level for 2.x SDKs (this changes for 3.x SDKs). 
    + K/V replace operation parameters:
        * document key
        * document
        * callback
- Line 12:  returning the order document if successful
- *outputMessage()*:  a helper method used to easily print out information to the console, method can be found in the /library directory (see API’s project structure detailed in the [Appendix](#nodejs-api-project-structure))
- try/catch & err object handling is purposefully done in a generic fashion.  The lab participant is free to add logic accordingly to test out various methods of handling errors.

Once complete, make sure the *repository.js* file is saved.  Once the code has been saved, the replace order functionality should be active within the web UI.   Follow the steps below to verify the *replaceOrder()* logic.

>**NOTE:**  Using the *replaceOrder()* requires authorization, if wanting to test the logic via the *SwaggerUI* page, follow the authorization steps listed in the [Appendix](#authorize-using-the-swaggerui-page).

>**NOTE:**  The following steps work only if an order has already been saved, otherwise a new order will be created.  A new order should have already been created in the previous [section](#save-an-order).

1. Go to http://localhost:8080
2. If not logged in:
    - In the top right corner, click the *Hello* next to the user icon, and a drop down menu should appear.
    - In the drop down menu, click *Sign In*, the web UI should redirect to the *Login* page.
    - Enter username and password credentials
    - Click *Login*
    - After logging in, the web UI should redirect to the *Home* page.  Go to step #3
3. If not at the home page (i.e. the search box isn’t showing)
    - In the top left corner, click the *Couchbase | NoEQUAL* image to go to the Home screen.
4. Enter a product in the *search box* and click the *magnifying glass* to run the search.
5. On an in stock product, click the drop down arrow in the bottom left corner, the product detail should appear along with the ability to increment/decrement a product count and add the product to the cart
6. Click the + button
7. Click *ADD TO CART*
8. The cart icon in the top right corner should increment by the number of added products.
9. Click the cart icon in the top right corner of the page.
10. Select an address
    - Can use separate shipping and billing addresses if you want
11. Click *PURCHASE*
    - The UI should redirect to the *Orders* page, but a message saying "/user/getCustomerOrders operation not built yet" should be displayed.  This functionality is add in Lab 4.

#### Delete an order

Open the *repository.js* file in the API repository directory (see API’s project structure detailed in the [Appendix](#nodejs-api-project-structure)).  Search for the *deleteOrder()* method.  Edit the *deleteOrder()* method by adding the necessary logic to remove an order document.

*deleteOrder()* input:
- orderId:  string - document key for an order document
- callback

*deleteOrder()* output:
- error object, if applicable
- success: boolean, true if delete successful

See the following code snippet below for a possible implementation of the *deleteOrder()* method.  This, or a similar solution, can be used to implement the *deleteOrder()* method logic.

>:exclamation:**REMEMBER:**  Either comment out or replace the NOP line of code ( e.g. ```callback(null, “NOP”)``` ) with the new code created in the lab.

```javascript
deleteOrder(orderId, callback) {
   try {
     /**
      * Lab 3:  K/V operation(s):
      *  1.  delete order:  bucket.remove(key)
      *
      */
     this.bucket.remove(orderId, function(err, result) {
       let success = !err ? result != null : null;
       callback(err, success);
     });
   } catch (err) {
     //Optional - add business logic to handle error types
     outputMessage(err, "repository.js:deleteOrder() - error:");
     callback(err, null);
   }
 }
```

Notes about the code:
- Line 7: All K/V operations are done at the bucket level for 2.x SDKs (this changes for 3.x SDKs). 
    + K/V remove operation parameters:
        * document key
        * callback
- Lines 8-9:  returning boolean based on success of operation or error object if applicable.
- *outputMessage()*:  a helper method used to easily print out information to the console, method can be found in the /library directory (see API’s project structure detailed in the [Appendix](#nodejs-api-project-structure))
- try/catch & err object handling is purposefully done in a generic fashion.  The lab participant is free to add logic accordingly to test out various methods of handling errors.

Once complete, make sure the *repository.js* file is saved.  Once the code has been saved, the delete order functionality should be active within the web UI.   Follow the steps below to verify the *deleteOrder()* logic.

>**NOTE:**  Using the *deleteOrder()* requires authorization, if wanting to test the logic via the *SwaggerUI* page, follow the authorization steps listed in the [Appendix](#authorize-using-the-swaggerui-page).

>**NOTE:**  The following steps work only if an order has already been saved, otherwise a new order will be created.  A new order should have already been created in the previous [section](#save-an-order).

1. Go to http://localhost:8080
2. If not logged in:
    - In the top right corner, click the *Hello* next to the user icon, and a drop down menu should appear.
    - In the drop down menu, click *Sign In*, the web UI should redirect to the *Login* page.
    - Enter username and password credentials
    - Click *Login*
    - After logging in, the web UI should redirect to the *Home* page.  Go to step #3
3. In the top right corner, click the cart icon.  
    - Alternatively, click the *Hello {First Name}* next to the user icon and in the drop down menu, click *Cart*, the web UI should redirect to the *Cart* page.
4. On the *Cart* screen, in the *Items* section, click the *DELETE* button next to an item’s count.  The item should disappear from the cart. 
    - If all items are deleted from the cart, the web UI should redirect to the *Home* page.
    - Going back to the *Cart* page will display a message of “No items in cart”

[Back to Steps](#steps)<br> 

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

[Back to Overview](#lab-overview)<br> 

#### Authorize using the *SwaggerUI* page

In order to test some of the API logic using the swagger page, some endpoints will require authorization.  Follow the below steps in order to authorize the endpoint.

1. Navigate to the *SwaggerUI* page:  http://localhost:3000/api-docs/
2. Click on the */test/testLogin* endpoint
3. After the panel expands, click the *Try it out* button
4. Enter a username and password (make sure your username and password is registered see Lab 1 Step 1)
5. Click on the *Execute* button
6. The response *Code* should be 200 and the *Response* body should contain a data property that contains the a userInfo object and inside the userInfo object should be a *token* property.
7. Copy the *token* value 
8. Click the *Authorize* button at the top right corner of the *SwaggerUI* page
9. In the pop-up, paste the *token* value (copied in step #7) into the *Value* field
10. Click the *Authorize* button
11. Click the *Close* button
12. The *SwaggerUI* page should now show closed lock icons next to any endpoint that requires authorization

**Sample login response:**<br>
The userInfo and customerInfo objects have been removed in order to save space.  Only the token property in the userInfo object is shown.

```json
{
  "data": {
    "userInfo": {
      ... sample userInfo data ...
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjljMGM0YTM0LTY2OGYtNDg2Yi04ZTM1LTQ0ZjgyNTIxZDBhZCIsImlhdCI6MTU4OTM4NzcyMX0.lpFgZrr01TBRQFTA_5IUd7TzMoiEhhv0weuCX-70sxk"
    },
    "customerInfo": {
    ... sample customerInfo data ...
    }
  },
  "message": "Successfully logged in and created session.",
  "error": null,
  "authorized": true
}

```

[Back to Overview](#lab-overview)<br> 

#### Sample Order Document

```json
{
  "doc": {
    "type": "order",
    "schema": "1.0.0",
    "created": 1584603465196,
    "createdBy": 4075,
    "modified": 1570944661302,
    "modifiedBy": 4991
  },
  "_id": "order_100",
  "orderId": 100,
  "custId": 658,
  "orderDate": 1577676607455,
  "orderStatus": "Pending",
  "billingInfo": {
    "name": "Linwood Emard",
    "phone": "1-229-156-9636 ",
    "email": "Daisy42@hotmail.com",
    "address": {
      "address1": "6989 Frami Way Wall",
      "city": "Lake Nathanielside",
      "state": "UT",
      "zipCode": "73043-1470",
      "country": "MZ"
    }
  },
  "shippingInfo": {
    "name": "Leatha Swaniawski",
    "address": {
      "address1": "956 Percy Port Spurs",
      "city": "Kuhicport",
      "state": "MS",
      "zipCode": "71913",
      "country": "AX"
    },
    "shippingMethod": "UPS Ground"
  },
  "shippingTotal": 20.36,
  "tax": 4.72,
  "lineItems": [
    {
      "prodId": "181f86cd-49f3-4a4f-8ac6-48e28fce955e",
      "dispName": "Refined Frozen Chicken",
      "shortDescr": "Odit et officiis. Eum voluptatibus voluptatem vel. Non ut officia aut sed. Aut quaerat molestiae sint sit quia ut. Nostrum amet aut occaecati non ex voluptatem in asperiores.",
      "image": "http://lorempixel.com/640/480/transport",
      "price": 35.66,
      "qty": 1,
      "subTotal": 35.66
    }
  ],
  "grandTotal": 60.74
}

```

[Back to Overview](#lab-overview)<br> 

#### Helper Methods

The following helper methods are already implemented in the *repository.js* file and can be used when adding logic to the API.

**getNextOrderId()**

The *getNextOrderId()* method uses a counter doc and atomic operations to increment the counter doc to get the next orderId.

```javascript
 getNextOrderId(callback) {
   this.bucket.counter(
     this.counterIds["order"],
     1,
     { initial: 5000 },
     function (err, res) {
       if (err) {
         return callback(err, null);
       }
       callback(err, res.value);
     });
 }
```

**getNextCustomerId()**

The *getNextCustomerId()* method uses a counter doc and atomic operations to increment the counter doc to get the next customerId.

```javascript
 getNextCustomerId(callback) {
   this.bucket.counter(
     this.counterIds["customer"],
     1,
     { initial: 1000 },
     function (err, res) {
       if (err) {
         return callback(err, null);
       }
       callback(err, res.value);
     }
   );
 }

```

**getNextUserId()**

The *getNextUserId()* method uses a counter doc and atomic operations to increment the counter doc to get the next userId.

```javascript
 getNextUserId(callback) {
   this.bucket.counter(
     this.counterIds["user"],
     1,
     { initial: 1000 },
     function (err, res) {
       if (err) {
         return callback(err, null);
       }
       callback(err, res.value);
     }
   );
 }
```

[Back to Overview](#lab-overview)<br> 
