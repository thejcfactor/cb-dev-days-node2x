# Lab 5 - K/V Sub-Document Operations

## Lab Overview

The goal of this lab is to create the logic, using Couchbase’s Node.js SDK, to enable saving a new customer address and updating an existing customer address.  The logic should utilize the SDK’s sub-document operations.   See SDK documentation for details on using the K/V sub-document operations.

>:exclamation:**IMPORTANT**:exclamation:<br> Make sure to read all IMPORTANT, REMEMBER, NOTES and DOCUMENTATION sections as important details will be provided in those sections.

<br>

[Back to Labs](./labs.md)<br> 

## Steps

[Step 1: Add Logic to API](#step-1-add-logic-to-api)<br> 
&nbsp;&nbsp;&nbsp;&nbsp;[Save an address](#save-an-address)<br> 
&nbsp;&nbsp;&nbsp;&nbsp;[Update an address](#update-an-address)<br> 

***

### Step 1: Add Logic to API

>**Documentation:**  SDK documentation on sub-document operations can be found [here](https://docs.couchbase.com/nodejs-sdk/2.6/subdocument-operations.html).

#### Save an address

Open the *repository.js* file in the API repository directory (see API’s project structure detailed in the [Appendix](#nodejs-api-project-structure)).  Search for the *saveAddress()* method.  Edit the *saveAddress()* method by adding the necessary logic to insert (or upsert) an address within a customer document.

Some things to think about:<br>
1. The customer document model
2. What if the path provided doesn't exist?
3. Updating the parent document's audit properties

*saveAddress()* input:
- custId:  integer - id of a customer
- path: string - sub-document path
- address:  object - customer document address object (see [Appendix](#sample-customer-document) for sample customer document)
- callback

*saveAddress()* output:
- error object, if applicable
- customer document key

See the following code snippet below for a possible implementation of the *saveAddress()* method.  This, or a similar solution, can be used to implement the *saveAddress()* method logic.

>:exclamation:**REMEMBER:**  Either comment out or replace the NOP line of code ( e.g. ```callback(null, “NOP”)``` ) with the new code created in the lab.

```javascript
 saveAddress(custId, path, address, callback) {
   try {
     /**
      * Lab 5:  K/V sub-document operation(s):
      *  1.  generate key:  customer_<custId>
      *  2.  get customer addresses
      *  3.  create business logic to add new address
      *  4.  update customer address path
      *  5.  update customer modified date and modifiedBy
      *
      *
      *  When updating, think about pros/cons to UPSERT v. REPLACE
      */
     let key = `customer_${custId}`;
     let scope = this;
 
     this.bucket
       .lookupIn(key)
       .exists(path)
       .get(path)
       .execute(function(err, result) {
         //use functions result.exists(path) & result.content(path)
         //to gather contents or verify if path exists
         if (!err && result) {
           let addresses = {};
           if (result.exists(path)) {
             addresses = result.content(path);
           }
 
           let { name, ...newAddress } = address;
           addresses[name] = newAddress;
 
           let modifiedDate = Math.floor(new Date() / 1000);
 
           scope.bucket
             .mutateIn(key)
             .upsert(path, addresses)
             .upsert("doc.modified", modifiedDate)
             .upsert("doc.modifiedBy", custId)
             .execute(function(err, result) {
               callback(err, !err ? key : null);
             });
         }else{
           callback(err, null);
         }  
       });
   } catch (err) {
     //Optional - add business logic to handle error types     
     outputMessage(err, "repository.js:saveAddress() - error:");
     callback(err, null);
   }
 }
```

Notes about the code:
- Line 13:  Creating the document’s key since the key is not passed in, but the custId.
- Line 16:  All K/V operations are done at the bucket level for 2.x SDKs (this changes for 3.x SDKs).
- Lines 17-19:  Using sub-document lookup-in operation to check if path exists and obtain current customer addresses.
- Lines 25-30:  Checking if the address path exists, if so, due to the customer document model, need to add a new key to the address sub-document object.  See [Appendix](#sample-customer-document) for sample customer document. 
- Line 32:  Setting the current date in order to update the parent document audit properties.
- Lines 34-42:  Upserting the new address and audit properties using sub-document operations.
- *outputMessage()*:  a helper method used to easily print out information to the console, method can be found in the /library directory (see API’s project structure detailed in the [Appendix](#nodejs-api-project-structure))
- try/catch & err object handling is purposefully done in a generic fashion.  The lab participant is free to add logic accordingly to test out various methods of handling errors.

Once complete, make sure the *repository.js* file is saved.  Since the API *Docker* container maps to the API’s working directory, any updates made to the API code should be reflected in the container.  Once the code has been saved, the functionality to add a new address should be active within the web UI.  Follow the steps below to verify the *saveAddress()* logic.

>**NOTE:**  Using the *saveAddress()* requires authorization, if wanting to test the logic via the *SwaggerUI* page, follow the authorization steps listed in the [Appendix](#authorize-using-the-swaggerui-page).

1. Go to http://localhost:8080
2. If not logged in:
    - In the top right corner, click the *Hello* next to the user icon, and a drop down menu should appear.
    - In the drop down menu, click *Sign In*, the web UI should redirect to the *Login* page.
    - Enter username and password credentials
    - Click *Login*
    - After logging in, the web UI should redirect to the *Home* page.  Go to step #3
3. In the top right corner, click the *cart* icon
    - Alternatively, click the *Hello {First Name}* next to the *user* icon and in the drop down menu, click *Cart*, the web UI should redirect to the *Cart* page.
4. In the *Cart* page, click on the “+” in the *Shipping* or *Billing* sections
5. Fill out the fields in the form (some are required fields)
6. Click *Save*
7. If the address saves correctly, a message will appear saying “Successfully saved new address” and the selected address should update.

#### Update an address

Open the *repository.js* file in the API repository directory (see API’s project structure detailed in the Appendix).  Search for the *updateAddress()* method.  Edit the *updateAddress()* method by adding the necessary logic to update an address within a customer document.

Some things to think about:<br>
1. Update the entire customer address path or just a portion?
2. Upsert v. replace
3. What if the provided path doesn't exist?

*updateAddress()* input:
- custId:  integer - id of a customer
- path: string - sub-document path
- address:  object - customer document address object (see [Appendix](#sample-customer-document) for sample customer document)
- callback

*updateAddress()* output:
- error object, if applicable
- customer document key

See the following code snippet below for a possible implementation of the *updateAddress()* method.  This, or a similar solution, can be used to implement the *updateAddress()* method logic.

>:exclamation:**REMEMBER:**  Either comment out or replace the NOP line of code ( e.g. ```callback(null, “NOP”)``` ) with the new code created in the lab.

```javascript
 updateAddress(custId, path, address, callback) {
   try {
     /**
      * Lab 5:  K/V sub-document operation(s):
      *  1.  generate key:  customer_<custId>
      *  2.  update customer document address path
      *  3.  update customer document modified date and modifiedBy
      *
      *  When updating, think about pros/cons to UPSERT v. REPLACE
      */
     let key = `customer_${custId}`;
     let modifiedDate = Math.floor(new Date() / 1000);
     this.bucket
       .mutateIn(key)
       .upsert(path, address)
       .upsert("doc.modified", modifiedDate)
       .upsert("doc.modifiedBy", custId)
       .execute(function(err, result) {
         callback(err, !err ? key : null);
       });
   } catch (err) {
     //Optional - add business logic to handle error types
     outputMessage(err, "repository.js:updateAddress() - error:");
     callback(err, null);
   }
 }

```

Notes about the code:
- Line 10:  Creating the document’s key since the key is not passed in, but the custId.
- Line 12:  All K/V operations are done at the bucket level for 2.x SDKs (this changes for 3.x SDKs).
- Lines 13-16:  Using sub-document mutate-in operation to update entire address path and update parent document audit properties
- *outputMessage()*:  a helper method used to easily print out information to the console, method can be found in the /library directory (see API’s project structure detailed in the [Appendix](#nodejs-api-project-structure))
- try/catch & err object handling is purposefully done in a generic fashion.  The lab participant is free to add logic accordingly to test out various methods of handling errors.

Once complete, make sure the *repository.js* file is saved.  Since the API *Docker* container maps to the API’s working directory, any updates made to the API code should be reflected in the container.  Once the code has been saved, the product search functionality should be active within the web UI.  Follow the steps below to verify the *updateAddress()* logic.

>**NOTE:**  Using the *updateAddress()* requires authorization, if wanting to test the logic via the *SwaggerUI* page, follow the authorization steps listed in the [Appendix](#authorize-using-the-swaggerui-page).

1. Go to http://localhost:8080
2. If not logged in:
    - In the top right corner, click the *Hello* next to the user icon, and a drop down menu should appear.
    - In the drop down menu, click *Sign In*, the web UI should redirect to the *Login* page.
    - Enter username and password credentials
    - Click *Login*
    - After logging in, the web UI should redirect to the *Home* page.  Go to step #3
3. Click the *Hello {First Name}* next to the user icon and in the drop down menu, click *User Profile*, the web UI should redirect to the *User Profile* page.
4. On the *User Profile* page, click *edit* on one of the addresses (example: home)
5. Update the City and State to match yours
6. Click *Save*
7. If the address updates correctly, a message will appear saying “Successfully updated address”.

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

[Back to Overview](#lab-overview)<br> 