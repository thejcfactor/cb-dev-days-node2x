# Lab 3 - N1QL Operations

## Lab Overview

The goal of this lab is to create the logic to enable retrieving customer specific orders, either new/pending orders or all orders, utilizing Couchbase’s Node.js SDK, to perform N1QL operations.  See SDK documentation for details on using N1QL operations.

>:exclamation:**IMPORTANT**:exclamation:<br> Make sure to read all IMPORTANT, REMEMBER, NOTES and DOCUMENTATION sections as important details will be provided in those sections.

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

#### Retrieving new/pending order

Open the *repository.js* file in the API repository directory (see API’s project structure detailed in the [Appendix](#nodejs-api-project-structure)).  Search for the *getNewOrder()* method.  Edit the *getNewOrder()* method by adding the necessary logic to retrieve the latest new/pending order document.

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

