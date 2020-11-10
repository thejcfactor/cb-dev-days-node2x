# Lab Catchup

## Overview
A catchup script is provided so that participants can move between labs.  If the catchup script is run, the *repository.js* file will be overwritten and any previous work will be lost.

>:exclamation:**IMPORTANT:** If running in a Windows environment, use *Git Bash* as the catchup script is a bash script.  Alternatively, manual steps can be followed to move between labs.

<br>

[Back to Project Home](../README.md)<br> 

## Paths

Participants should choose the appropriate path based on how the participant is walking through the labs.  If using *Docker*, follow the steps in the *Docker* path, if running the code locally (*Windows* users not running *Docker*, etc.) choose the local path.  The manual path can be used by any participant as that path simply outlines the steps automated by running the catchup script.

[Path:  *Docker*](#path-docker)<br> 
[Path:  Local](#path-local)<br> 
[Path:  Manual](#path-manual)<br> 

## Path: *Docker*

### Step 1: Move to the API's working directory

Move into the API’s directory (the GIT repository for the API should have been cloned after following the steps outlined in Lab 0).

```console
$ cd ~/Documents/cbDevDays/node2x/cb-dev-days-node2x
```

### Step 2: Run the catchup script

This step will execute the catchup script on the API *Docker* container.  Be sure to use the name of the API *Docker* container created in Lab 0.  The script prompts the user to select a lab.  After the lab is selected, the script updates the *repository/repository.js* file to have the changes necessary to start the selected lab.  After updating the code, the script prompts the user for the information needed to register a new customer/user and also create order(s) if necessary depending on the lab chosen.

```console
$ docker exec -it api ./resources/catchup.sh

1) Lab 1 : Registration and K/V get
2) Lab 2 : FTS operations - search for products
3) Lab 3 : K/V operations - get, save, update, and delete orders
4) Lab 4 : N1QL operations - get pending order, get customer orders
5) Lab 5 : K/V sub-document operations
6) Final : All labs completed
Please select the lab you want to jump to: 5

Please provide the following user information:

First Name: Test
Last Name: User
Email: testUser123@gmail.com
Username: testUser123
Password: password123

Successfully updated code to the end of the labs (i.e. all code is complete).
Pausing for API to reset...

Creating orders...

Processed order successfully created.

Pending cart order successfully created.

Catchup complete.  Please see Lab5 for instructions.
User credentials:
Username: testUser123
Password: password123
```

[Back to Paths](#paths)<br> 

## Path: Local

### Step 1: Move to the API's working directory

Move into the API’s directory (the GIT repository for the API should have been cloned after following the steps outlined in Lab 0).

>:exclamation:**IMPORTANT**:exclamation:<br> If using *Windows*, run the following commands in *Git Bash*

```console
$ cd ~/Documents/cbDevDays/node2x/cb-dev-days-node2x
```

This step will execute the catchup script.  The script prompts the user to select a lab.  After the lab is selected, the script updates the *repository/repository.js* file to have the changes necessary to start the selected lab.  After updating the code, the script prompts the user for the information needed to register a new customer/user and also create order(s) if necessary depending on the lab chosen.

```console
$ ./resources/catchup.sh

1) Lab 1 : Registration and K/V get
2) Lab 2 : FTS operations - search for products
3) Lab 3 : K/V operations - get, save, update, and delete orders
4) Lab 4 : N1QL operations - get pending order, get customer orders
5) Lab 5 : K/V sub-document operations
6) Final : All labs completed
Please select the lab you want to jump to: 5

Please provide the following user information:

First Name: Test
Last Name: User
Email: testUser123@gmail.com
Username: testUser123
Password: password123

Successfully updated code to the end of the labs (i.e. all code is complete).
Pausing for API to reset...

Creating orders...

Processed order successfully created.

Pending cart order successfully created.

Catchup complete.  Please see Lab5 for instructions.
User credentials:
Username: testUser123
Password: password123
```

[Back to Paths](#paths)<br> 

## Path: Manual

### Step 1: Move to the API's working directory

Move into the API’s directory (the GIT repository for the API should have been cloned after following the steps outlined in Lab 0).

**MacOS/Linux/Git Bash:**

```console
$ cd ~/Documents/cbDevDays/node2x/cb-dev-days-node2x
```

**Windows PowerShell:**

```powershell
PS C:\Users\Administrator> cd ~/Documents/cbDevDays/node2x/cb-dev-days-node2x
```

### Step 2: Copy desired lab

The starting point for each lab is located in the */resources/labs* folder (see [Appendix](#nodejs-api-project-structure) for the API’s project structure).  A participant can either manually copy the desired *repository_labXX.js* file to the */repository* directory and replace the *repository.js*, or use the following command to copy the desired lab file.

>**NOTE:** Be mindful of the current working directory with respect to the path to the source and destination files.

**MacOS/Linux/Git Bash:**

```console
$ cp ./resources/labs/repository_lab4.js ./repository/repository.js
```


**Windows PowerShell:**

```powershell
PS C:\Users\Administrator\Documents\cbDevDays\node2x> Copy-Item ".\resources\labs\repository_lab4.js" -Destination ".\repository\repository.js"
```


### Step 3: Register User

Participant can use the API's *SwaggerUI* or use the command line to register a user.

#### *SwaggerUI*

1. Navigate to the *SwaggerUI* page:  http://localhost:3000/api-docs/
2. Click on the */user/register* endpoint
3. After the panel expands, click the *Try it out* button
4. Replace the "string" input for the firstName, lastName, username, email and password in the text area.
5. Click on the *Execute* button
6. The response *Code* should be 200 and the *Response* body should contain a data property that contains the a customerInfo and userInfo object.

#### Command Line
>**NOTE:** Curl commands should be run in *Git Bash* if using Windows. 

```console
$ curl -X POST http://127.0.0.1:3000/user/register -H "accept: */*" -H "Content-Type: application/json" -d '{"firstName":"Test", "lastName":"User", "username":"testUser123", "email":"testUser123@gmail.com", "password":"password123"}' | jq
```

### Step 4:  Login User

Participant can use the API's *SwaggerUI* or use the command line to login a user.

#### *SwaggerUI*

1. Navigate to the *SwaggerUI* page:  http://localhost:3000/api-docs/
2. Click on the */user/login* endpoint
3. After the panel expands, click the *Try it out* button
4. Replace the "string" input for the username and password properties in the text area (use the username and password previously used to register).
5. Click on the *Execute* button
6. The response *Code* should be 200 and the *Response* body should contain a data property that contains the a userInfo object and inside the userInfo object should be a *token* property.

>**NOTE:** The *token* value is used in future steps.  Keep track of the value.

#### Command Line
>**NOTE:** Curl commands should be run in *Git Bash* if using Windows.

```console
$ curl -X POST http://127.0.0.1:3000/user/login -H "accept: */*" -H "Content-Type: application/json" -d '{"username":"testUser123", "password":"password123"}' | jq
```

Remember the token and custId return in the response (token:  data > userInfo > token, custId:  data > customerInfo > custId)

### Step 5:  Create Order(s)

Participant can use the API's [*SwaggerUI*](#swaggerui-2) or use the [command line](#comand-line-2) to create order(s).


#### *SwaggerUI*

**Step 5a:  Login to obtain user token**

>**NOTE:**If you have the token from logging in previously, you can skip to Step 5b.

1. Navigate to the *SwaggerUI* page:  http://localhost:3000/api-docs/
2. Click on the */test/testLogin* endpoint
3. After the panel expands, click the *Try it out* button
4. Enter a username and password (make sure your username and password is registered see Lab 1 Step 1)
5. Click on the *Execute* button
6. The response *Code* should be 200 and the *Response* body should contain a data property that contains the a userInfo object and inside the userInfo object should be a *token* property.
7. Copy the *token* value 

**Step 5b:  Authorize User**

1. Click the *Authorize* button at the top right corner of the *SwaggerUI* page
2. In the pop-up, paste the *token* value (copied in step #7) into the *Value* field
3. Click the *Authorize* button
4. Click the *Close* button
5. The *SwaggerUI* page should now show closed lock icons next to any endpoint that requires authorization

**Step 5c:  Create Order(s)**

Participants can create a previous order and/or a new/pending order depending on which lab they are moving to.  

To create a previous order:
1.  Change the necessary information in the JSON document provide [below](#previous-order).
2.  Follow the *SwaggerUI* steps [below](#swaggerui-steps).

To create a new/pending order:
1.  Change the necessary information in the JSON document provide [below](#newpending-order).
2.  Follow the *SwaggerUI* steps [below](#swaggerui-steps).

##### Previous Order

Change the following parameters in the JSON document below:<br>
    - **order.doc.createdBy**: the custId obtained in step 4 or 5a<br> 
    - **order.doc.modifiedBy**: the custId obtained in step 4 or 5a<br> 
    - **order.custId**: the custId obtained in step 4 or 5a<br> 
    - **order.billingInfo.name**:  the name of the user<br> 
    - **order.shippingInfo.name**:  the name of the user<br> 

```json
{
  "update": false,
  "order": {
    "doc": {
      "type": "order",
      "schema": "1.0.0",
      "created": 1598949211000,
      "createdBy": 0,
      "modified": 1600810411000,
      "modifiedBy": 0
    },
    "custId": 0,
    "orderStatus": "shipped",
    "orderDate": 1598949211000,
    "billingInfo": {
      "address": {
        "address": "1234 Main St",
        "city": "Some City",
        "country": "US",
        "state": "TX",
        "zipCode": "12345"
      },
      "name": ""
    },
    "shippingInfo": {
      "address": {
        "address": "1234 Main St",
        "city": "Some City",
        "country": "US",
        "state": "TX",
        "zipCode": "12345"
      },
      "name": "",
      "shippingMethod": "3 - Business Days"
    },
    "shippingTotal": 7.99,
    "tax": 51.51,
    "lineItems": [
      {
        "prodId": "00402f25-c058-41d6-8a7c-9371c68a7503",
        "dispName": "Unbranded Soft Car",
        "shortDescr": "Consequatur reiciendis voluptatem ad aspernatur. Dolorem facere ut. Necessitatibus omnis sit illo vel at sint et sequi odit. Natus minima temporibus sed. Quidem et numquam nobis omnis quia accusamus.",
        "image": "http://lorempixel.com/640/480/nature",
        "price": 142.11,
        "qty": 1,
        "subTotal": 142.11
      },
      {
        "prodId": "02403ee5-65c6-4374-bcf5-086f85a3c96b",
        "dispName": "Rustic Cotton Tuna",
        "shortDescr": "Rem quos aut architecto. Deleniti sunt rerum eius hic quia omnis. Dolor et maiores vero ex a quia aut. Quos enim voluptas qui nobis a est est repellat. Enim nulla quis explicabo est ex ex vel quidem. Est in quibusdam aut ut.",
        "image": "http://lorempixel.com/640/480/abstract",
        "price": 121.16,
        "qty": 2,
        "subTotal": 242.32
      },
      {
        "prodId": "02c48819-8975-4ab6-9c1e-03b8817cb39b",
        "dispName": "Fantastic Cotton Car",
        "shortDescr": "Nam fugit repellat possimus quidem dolor. Ipsa molestiae quo voluptatem dignissimos sunt voluptas. Dolor sed est eos numquam nihil reiciendis sint. Aliquid ducimus modi sed tempore numquam adipisci aliquid. Illum expedita nesciunt.",
        "image": "http://lorempixel.com/640/480/technics",
        "price": 79.98,
        "qty": 3,
        "subTotal": 239.94
      }
    ],
    "grandTotal": 683.87
  }
}
```

##### New/Pending Order

Change the following parameters in the JSON document below:<br>
    - **order.doc.createdBy**: the custId obtained in step 4 or 5a<br> 
    - **order.custId**: the custId obtained in step 4 or 5a<br> 

```json
{
  "update": false,
  "order": {
    "doc": {
      "type": "order",
      "schema": "1.0.0",
      "created": 1598949211000,
      "createdBy": 0
    },
    "custId": 0,
    "orderStatus": "created",
    "orderDate": 1598949211000,
    "billingInfo": {},
    "shippingInfo": {},
    "shippingTotal": 0.0,
    "tax": 0.0,
    "lineItems": [
      {
        "prodId": "033a4b02-0542-4318-b16b-08b5628622a2",
        "dispName": "Intelligent Fresh Salad",
        "shortDescr": "Libero molestiae repellendus qui odit dignissimos aspernatur laboriosam. Ut dignissimos debitis qui. Laborum non ad quos est odio molestiae ullam quas dolorem. Similique et tenetur eaque quaerat eos qui. Beatae non enim in occaecati sint exercitationem dolores voluptatem animi. Quo aut tenetur omnis est dolores numquam fuga.",
        "image": "http://lorempixel.com/640/480/cats",
        "price": 65.67,
        "qty": 2,
        "subTotal": 131.34
      },
      {
        "prodId": "035550f6-d9ed-4be5-bff5-c19c5abeb5f9",
        "dispName": "Refined Concrete Bacon",
        "shortDescr": "Ea qui corrupti. Eius totam dolor itaque itaque architecto accusantium qui inventore. Sit ab consequatur quod.",
        "image": "http://lorempixel.com/640/480/nightlife",
        "price": 90.17,
        "qty": 1,
        "subTotal": 90.17
      },
      {
        "prodId": "0402d1f4-d69f-4417-9caf-6f62131430dd",
        "dispName": "Refined Frozen Table",
        "shortDescr": "Adipisci qui nostrum nobis sed quia cum. Natus dolor est. Ex sit quaerat neque et. Adipisci aut velit unde perferendis quia.",
        "image": "http://lorempixel.com/640/480/nightlife",
        "price": 36.8,
        "qty": 3,
        "subTotal": 110.4
      }
    ],
    "grandTotal": 331.91
  }
}
```


##### *SwaggerUI* Steps
1. Navigate to the *SwaggerUI* page:  http://localhost:3000/api-docs/
2. Click on the */user/saveOrUpdateOrder* endpoint
3. After the panel expands, click the *Try it out* button
4. Replace the empty curly braces with the JSON created above from either a previous order or a new/pending order
5. Click on the *Execute* button
6. The response *Code* should be 200 and the *Response* body should contain a data property that contains the a userInfo object and inside.


#### Command line

**Step 5a:  Login to obtain user token**

>**NOTE:**If you have the token from logging in previously, you can skip to Step 5c.

```console
$ curl -X POST http://127.0.0.1:3000/user/login -H "accept: */*" -H "Content-Type: application/json" -d '{"username":"testUser123", "password":"password123"}' | jq
```

Copy the token return in the response (token:  data > userInfo > token, custId:  data > customerInfo > custId).

**Step 5b:  Authorize User**

Not applicable in the command line path.  The authorization takes place when the API is called and the auth token is passed in.

**Step 5c:  Create Order**



### Appendix
#### Node.js API Project Structure
```
|—— configuration/
|  |—— config.js
|  |—— config.json
|
|—— controllers/
|  |—— productController.js
|  |—— testController.js
|  |—— userController.js
|
|—— docs/
|
|—— library/
|  |—— outputMessage.js
|  |—— verifyToken.js
|
|—— repository/
|  |—— repository.js
|
|—— resources/
|  |—— labs/
|     |—— repository_final.js
|     |—— repository_lab0.js
|     |—— repository_lab1.js
|     |—— repository_lab2.js
|     |—— repository_lab3.js
|     |—— repository_lab4.js
|     |—— repository_lab5.js
|  |—— catchup.sh
|  |—— cart_order.json
|  |—— default_order.json
|
|—— service/
|  |—— productService.js
|  |—— userService.js
|
|—— Dockefile.dev
|—— package.json
|—— README
|—— server.js
```
