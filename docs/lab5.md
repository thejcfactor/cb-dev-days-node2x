# Lab 5 - K/V Sub-Document Operations

## Lab Overview

The goal of this lab is to create the logic, using Couchbase’s Node.js SDK, to enable saving a new customer address and updating an existing customer address.  The logic should utilize the SDK’s sub-document operations.   See SDK documentation for details on using the K/V sub-document operations.

>:exclamation:**IMPORTANT**:exclamation:<br> Make sure to read all IMPORTANT, REMEMBER, NOTES and DOCUMENTATION sections as important details will be provided in those sections.

## Steps

[Step 1: Add Logic to API](#step-1-add-logic-to-api)<br> 
&nbsp;&nbsp;&nbsp;&nbsp;[Save an address](#save-an-address)<br> 
&nbsp;&nbsp;&nbsp;&nbsp;[Update an address](#update-an-address)<br> 

***

### Step 1: Add Logic to API

>**Documentation:**  SDK documentation on sub-document operations can be found [here](https://docs.couchbase.com/nodejs-sdk/2.6/subdocument-operations.html).

#### Save an address

Open the *repository.js* file in the API repository directory (see API’s project structure detailed in the Appendix).  Search for the *saveAddress()* method.  Edit the *saveAddress()* method by adding the necessary logic to insert (or upsert) an address within a customer document.

#### Update an address

Open the *repository.js* file in the API repository directory (see API’s project structure detailed in the Appendix).  Search for the *updateAddress()* method.  Edit the *updateAddress()* method by adding the necessary logic to update an address within a customer document.

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

#### Sample Customer Document

```json
{
  "doc": {
    "type": "customer",
    "schema": "1.0.0",
    "created": 1559780511352,
    "createdBy": 195,
    "modified": 1587833486406,
    "modifiedBy": 702
  },
  "_id": "customer_100",
  "custId": 100,
  "custName": {
    "firstName": "Hilton",
    "lastName": "Schinner"
  },
  "username": null,
  "email": "Karianne39@gmail.com",
  "createdOn": "2019-06-08",
  "address": {
    "home": {
      "address1": "4810 Hegmann Manors Burgs",
      "city": "North Ivahfort",
      "state": "WY",
      "zipCode": "01961",
      "country": "KG"
    },
    "work": {
      "address1": "198 Molly Mountain Plains",
      "city": "South Clifton",
      "state": "CT",
      "zipCode": "77161",
      "country": "SA"
    }
  },
  "mainPhone": {
    "phone_number": "682126158733138",
    "extension": null
  },
  "additionalPhones": {
    "type": "Other",
    "phone_number": "987601914834116",
    "extension": null
  }
}
```