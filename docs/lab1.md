### Lab 1 - Register + K/V get

## Register

## K/V get

```javascript
 getCustomer(customerId, callback) {
   try {
     /**
      * Lab 1:  K/V operation - Get
      *  1.  Get customer:  bucket.get(key)
      */
     this.bucket.get(customerId, function(err, result) {
       if (!err) {
         let customer = result.value;
         callback(err, customer);
       } else {
         callback(err, null);
       }
     });
   } catch (err) {
     //Optional - add business logic to handle error types
     outputMessage(err, "repository.js:getCustomer() - error:");
     callback(err, null);
   }
 }

```