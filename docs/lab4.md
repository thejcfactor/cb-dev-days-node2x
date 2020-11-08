# Lab 4 - N1QL Operations

## Lab Overview

The goal of this lab is to create the logic to enable retrieving customer specific orders, either new/pending orders or all orders, utilizing Couchbase’s Node.js SDK, to perform N1QL operations.  See SDK documentation for details on using N1QL operations.

>:exclamation:**IMPORTANT**:exclamation:<br> Make sure to read all IMPORTANT, REMEMBER, NOTES and DOCUMENTATION sections as important details will be provided in those sections.

<br>

[Back to Labs](./labs.md)<br> 

## Steps

[Step 1: Add Logic to API](#step-1-add-logic-to-api)<br> 
&nbsp;&nbsp;&nbsp;&nbsp;[Retrieving orders](#retrieving-orders)<br> 
&nbsp;&nbsp;&nbsp;&nbsp;[Retrieving new/pending order](#retrieving-newpending-order)<br> 

***

### Step 1: Add Logic to API

>**Documentation:**  SDK documentation on N1QL operations be found below:<br>
>-  [Aliasing](https://docs.couchbase.com/server/current/n1ql/n1ql-language-reference/identifiers.html#identifier-alias)
>-  [Date functions](https://docs.couchbase.com/server/current/n1ql/n1ql-language-reference/datefun.html)
>-  [Query parameterization](https://docs.couchbase.com/nodejs-sdk/2.6/n1ql-queries-with-sdk.html#placeholders)
>- [Metadata functions](https://docs.couchbase.com/server/current/n1ql/n1ql-language-reference/metafun.html#meta)


#### Retrieving orders

Open the *repository.js* file in the API repository directory (see API’s project structure detailed in the [Appendix](#nodejs-api-project-structure)).  Search for the *getOrders()* method.  Edit the *getOrders()* method by adding the necessary logic to retrieve a customer’s order documents.

Some things to think about:<br>
1. What fields in a document are needed?
2. How does aliasing work in N1QL?
3. How to work with N1QL date formats?
    - How to get from epoch timestamps to datetime (and vice-versa)?
4. How to use query parameterization?

*getOrders()* input:
- customerId:  integer
- callback

*getOrders()* output:
- error object, if applicable
- subset of order document:  see [Appendix](#sample-order-document) for a sample order document
  + Properties needed:
    * order document Id
      - Hint:  see Metadata functions in documentation above
    * shippingInfo.name aliased as shippedTo
    * grandTotal
    * lineItems
    * orderDate, converted to human readable date and aliased to same name (i.e. orderDate)
      - Hint: see Date Functions in documentation above

See the following code snippet below for a possible implementation of the *getOrders()* method.  This, or a similar solution, can be used to implement the *getOrders()* method logic.

>:exclamation:**REMEMBER:**  Either comment out or replace the NOP line of code ( e.g. ```callback(null, “NOP”)``` ) with the new code created in the lab.


```javascript
 getOrders(customerId, callback) {
   try {
     /**
      * Lab 4:  N1QL operations
      *  1. Get orders for customerId
      *     - Document properties needed (more can be provided):
      *         id,
      *         orderStatus,
      *         shippingInfo.name aliased as shippedTo,
      *         grandTotal,
      *         lineItems,
      *         orderDate (hint, use MILLIS_TO_STR())
      *
      */
     let sql = `
       SELECT
         META(o).id,
         o.orderStatus,
         o.shippingInfo.name AS shippedTo,
         o.grandTotal,
         o.lineItems,
         MILLIS_TO_STR(o.orderDate) AS orderDate
       FROM \`${this.bucketName}\` o
       WHERE o.doc.type = 'order' AND o.custId=$1
       ORDER BY o.orderDate DESC NULLS FIRST`;
 
     let n1qlQuery = N1qlQuery.fromString(sql);
 
     this.bucket.query(n1qlQuery, [customerId], function(err, rows) {
       let orders = !err ? rows : null;
       callback(err, orders);
     });
   } catch (err) {
     //Optional - add business logic to handle error types
     outputMessage(err, "repository.js:getOrders() - error:");
     callback(err, null);
   }
 }
```
Notes about the code:
- Lines 14-24: N1QL query string.  N1QL utilizes the following:
  + Aliasing (e.g. “o.shippingInfo.name AS shippedTo”, etc.)
  + Converting the orderDate epoch timestamp to human readable date (e.g. MILLIS_TO_STR())
  + SDK’s positional parameterization to find a specific custId (e.g. o.custId = $1)
  + Ordering the query results
- Line 26:  creating the SDK N1qlQuery object from a query string
- Line 28: All N1QL operations are done at the bucket level for 2.x SDKs (this changes for 3.x SDKs). 
    + Query operation parameters:
        * N1qlQuery object
        * array of parameters
        * callback
- Line 30:  Returning the query result rows, can just return the raw row information as orders.
- *outputMessage()*:  a helper method used to easily print out information to the console, method can be found in the /library directory (see API’s project structure detailed in the [Appendix](#nodejs-api-project-structure))
- try/catch & err object handling is purposefully done in a generic fashion.  The lab participant is free to add logic accordingly to test out various methods of handling errors.

Once complete, make sure the *repository.js* file is saved.  Since the API *Docker* container maps to the API’s working directory, any updates made to the API code should be reflected in the container.  Once the code has been saved, the functionality to retrieve a customer’s previous (i.e. not new/pending order) orders should be active within the web UI.   Follow the steps below to verify the *getOrders()* logic.

>**NOTE:**  Using the *getOrders()* requires authorization, if wanting to test the logic via the *SwaggerUI* page, follow the authorization steps listed in the [Appendix](#authorize-using-the-swaggerui-page).

1. Go to http://localhost:8080
2. If not logged in:
    - In the top right corner, click the *Hello* next to the user icon, and a drop down menu should appear.
    - In the drop down menu, click *Sign In*, the web UI should redirect to the *Login* page.
    - Enter username and password credentials
    - Click *Login*
    - After logging in, the web UI should redirect to the *Home* page.  Go to step #3
3. In the top right corner, click the *Hello {First Name}* next to the user icon and in the drop down menu, click *Orders*, the web UI should redirect to the *Orders* page.
4. The *Orders* page should now display any previous orders associated with the logged in customer.

#### Retrieving new/pending order

Open the *repository.js* file in the API repository directory (see API’s project structure detailed in the [Appendix](#nodejs-api-project-structure)).  Search for the *getNewOrder()* method.  Edit the *getNewOrder()* method by adding the necessary logic to retrieve the latest new/pending order document.

Some things to think about:<br>
1. What fields in a document are needed?
2. How to use query parameterization?

*getNewOrder()* input:
- customerId:  integer
- callback

*getNewOrder()* output:
- error object, if applicable
- subset of order document:  see [Appendix](#sample-order-document) for a sample order document
  + Properties needed:
    * doc, custId, orderStatus, orderDate, billingInfo, shippingInfo, shippingTotal, tax, lineItems, grandTotal, orderId, _id

See the following code snippet below for a possible implementation of the *getNewOrder()* method.  This, or a similar solution, can be used to implement the *getNewOrder()* method logic.

>:exclamation:**REMEMBER:**  Either comment out or replace the NOP line of code ( e.g. ```callback(null, “NOP”)``` ) with the new code created in the lab.

```javascript
 getNewOrder(customerId, callback) {
   try {
     /**
      * Lab 4:  N1QL operations
      *  1. Get latest order for customerId
      *     - WHERE order.orderStatus = 'created'
      *     - Document properties needed (more can be provided):
      *         doc, custId, orderStatus,
      *         billingInfo, shippingInfo, shippingTotal,
      *         tax, lineItems, grandTotal, orderId, _id
      *
      */
     let sql = `
       SELECT o.doc, o.custId, o.orderStatus,
       o.billingInfo, o.shippingInfo, o.shippingTotal,
       o.tax, o.lineItems, o.grandTotal, o.orderId, o._id
       FROM \`${this.bucketName}\` o
       WHERE o.doc.type = 'order'
         AND o.custId=$1 AND o.orderStatus = 'created'
       ORDER BY o.orderDate DESC NULLS FIRST
       LIMIT 1;`;
 
     let n1qlQuery = N1qlQuery.fromString(sql);
 
     this.bucket.query(n1qlQuery, [customerId], function(err, rows) {
       let order = !err ? rows : null;
       callback(err, order);
     });
   } catch (err) {
     //Optional - add business logic to handle error types
     outputMessage(err, "repository.js:getNewOrder() - error:");
     callback(err, null);
   }
 }
```
Notes about the code:
- Lines 13-21: N1QL query string.  N1QL utilizes the following:
  + SDK’s positional parameterization to find a specific custI (e.g. o.custId = $1).
  + Ordering the query results
  + Limiting query results
- Line 23:  creating the SDK N1qlQuery object from a query string
- Line 28: All N1QL operations are done at the bucket level for 2.x SDKs (this changes for 3.x SDKs). 
    + Query operation parameters:
        * N1qlQuery object
        * array of parameters
        * callback
- Line 27:  Returning the query result rows, can just return the raw row information as the latest order.
- *outputMessage()*:  a helper method used to easily print out information to the console, method can be found in the /library directory (see API’s project structure detailed in the [Appendix](#nodejs-api-project-structure))
- try/catch & err object handling is purposefully done in a generic fashion.  The lab participant is free to add logic accordingly to test out various methods of handling errors.

Once complete, make sure the *repository.js* file is saved.  Since the API *Docker* container maps to the API’s working directory, any updates made to the API code should be reflected in the container.  Once the code has been saved, the functionality to retrieve a customer’s new/pending order should be active within the web UI.   To verify if the logic is working correctly, after an order has been created (see Lab 3), the cart icon on the top left should be populated with the items from the pending order after a page refresh, if the session is still active, or after logging in.

>**NOTE:** Until this logic is created, a message saying *“/user/checkForNewOrder operation not built yet.”* appears at the top of various pages as the web UI uses this call to populate the cart page upon a new login or page refresh.

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
