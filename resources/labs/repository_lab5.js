const config = require("configuration/config.js");

const couchbase = require("couchbase");
const N1qlQuery = require("couchbase").N1qlQuery;
const searchQuery = require("couchbase").SearchQuery;
const { v4: uuidv4 } = require("uuid");
const couchbaseErrors = couchbase.errors;
const outputMessage = require("library/outputMessage");

/**
 * Class representing a single instance of a Couchbase client.
 */
class Repository {
  constructor() {
    this.host = "test";
    this.bucketName = "";
    this.username = "";
    this.password = "";

    this.cluster = null;
    this.bucket = null;

    let {
      host,
      secure,
      bucket,
      username,
      password,
    } = global.configuration.database;
    this.connect(host, secure, bucket, username, password);
  }

  connect(host, secure, bucketName, username, password) {
    this.host = secure
      ? `couchbases://${host}?ssl=no_verify`
      : `couchbase://${host}`;
    this.bucketName = bucketName;
    this.username = username;
    this.password = password;

    this.cluster = new couchbase.Cluster(this.host);
    this.cluster.authenticate(this.username, this.password);
    let scope = this;
    this.bucket = this.cluster.openBucket(this.bucketName, function(
      err,
      result
    ) {
      if (err) {
        outputMessage(
          err,
          "repository.js:connect() - error connecting to bucket."
        );
      } else {
        outputMessage(
          scope.bucket._name,
          "repository.js:connect() - connected to bucket: "
        );
      }
    });
  }

  ping(services, callback) {
    let couchbaseServices = [];

    services.forEach((service) => {
      if (service == "KeyValue") {
        couchbaseServices.push(couchbase.ServiceType.KeyValue);
      } else if (service == "Query") {
        couchbaseServices.push(couchbase.ServiceType.Query);
      } else if (service == "Search") {
        couchbaseServices.push(couchbase.ServiceType.Search);
      }
    });

    this.bucket.ping(couchbaseServices, callback);
  }

  createAccount(userInfo, callback) {
    try {
      let scope = this;
      let acct = { customerInfo: null, userInfo: null };

      this.getNewCustomerDocument(userInfo, function(err, customerDoc) {
        if (err) {
          return callback(err, null);
        }
        scope.bucket.insert(customerDoc._id, customerDoc, function(
          err,
          savedCustomer
        ) {
          if (err) {
            return callback(err, null);
          }
          acct = { customerInfo: customerDoc };
          scope.getNewUserDocument(userInfo, function(err, userDoc) {
            if (err) {
              return callback(err, null);
            }
            scope.bucket.insert(userDoc._id, userDoc, function(err, savedUser) {
              if (err) {
                return callback(err, null);
              }
              userDoc.password = null;
              acct.userInfo = userDoc;
              callback(null, acct);
            });
          });
        });
      });
    } catch (err) {
      //Optional - add business logic to handle error types
      outputMessage(err, "repository.js:createAccount() - error:");
      callback(err, null);
    }
  }

  getUserInfo(username, adhoc, callback) {
    try {
      let sql = `
        SELECT c.custId, u.userId, u.username, u.\`password\`
        FROM \`${this.bucketName}\` u
        JOIN \`${this.bucketName}\` c ON c.username = u.username AND c.doc.type = 'customer'
        WHERE
        u.docType = 'user'
        AND u.username = $1
        LIMIT 1;`;

      let n1qlQuery = N1qlQuery.fromString(sql);

      if (adhoc) {
        n1qlQuery.adhoc(true);
      }

      let params = [username];

      this.bucket.query(n1qlQuery, params, function(err, rows) {
        if (!err && rows && rows.length > 0) {
          callback(null, rows[0]);
        } else {
          callback(err, null);
        }
      });
    } catch (err) {
      callback(err, null);
    }
  }

  createSession(username, expiry, callback) {
    let session = {
      sessionId: uuidv4(),
      username: username,
      docType: "SESSION",
    };

    try {
      let sessionKey = `session::${session.sessionId}`;
      this.bucket.insert(sessionKey, session, { expiry: expiry }, function(
        err,
        result
      ) {
        if (!err) {
          callback(err, session);
        } else {
          callback(err, result);
        }
      });
    } catch (err) {
      callback(err, null);
    }
  }

  extendSession(sessionId, expiry, callback) {
    try {
      let sessionKey = `session::${sessionId}`;
      this.bucket.getAndTouch(sessionKey, expiry, function(err, result) {
        callback(err, result ? result.value : null);
      });
    } catch (err) {
      callback(err, null);
    }
  }

  removeSession(sessionId, callback) {
    try {
      let sessionKey = `session::${sessionId}`;
      this.bucket.remove(sessionKey, function(err, result) {
        callback(err, result);
      });
    } catch (err) {
      callback(err, null);
    }
  }

  /**
   * Gets a customer document by the document key.
   *
   * @param {string} customerId - Document key
   * @param {Repository~couchbaseCallback} callback - callback to handle couchbase operation's response.
   */
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

  searchProducts(product, fuzziness, callback) {
    try {
      /**
       * Lab 2:  Search operation (FTS)
       *  1.  FTS:
       *        term query w/ fuzziness
       *        use "basic-search" as index name for searchQuery
       *  2.  K/V getMulti() using FTS results
       *
       */

      let match = searchQuery
        .term(product)
        .fuzziness(fuzziness)
        .field("dispName");

      let query = searchQuery
        .new("basic-search", match)
        .limit(10)
        .highlight();

      let scope = this;
      let results = [];

      this.bucket.query(query, function(err, res, meta) {
        console.log(product);
        if (!err && res.length > 0) {
          //uncomment to see raw results
          // outputMessage(
          //   res,
          //   "repository.js:searchProducts() - search results:"
          // );
          let docIds = res.map(({ id }) => id);
          //uncomment to see doc count
          // outputMessage(
          //   docIds.length,
          //   "repository.js:searchProducts() - total docs:"
          // );
          scope.bucket.getMulti(docIds, function(err, docs) {
            if (!err) {
              for (var key in docs) {
                if (docs[key].error) {
                  continue;
                }
                results.push(docs[key].value);
              }
            }
            callback(err, results);
          });
        } else {
          callback(err, null);
        }
      });
    } catch (err) {
      //Optional - add business logic to handle error types
      outputMessage(err, "repository.js:searchProducts() - error:");
      callback(err, null);
    }
  }

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
      this.getLastOrderId(function(err, result) {
        if (result) {
          let id = result + 1;
          let createDateTimeStamp = Math.floor(new Date() / 1000);
          let key = `order_${id}`;

          order._id = key;
          order.orderId = id;
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

  getOrders(customerId, callback) {
    try {
      /**
       * Lab 4:  N1QL operations
       *  1. Get orders for customerId
       *     - WHERE order.orderStatus != 'created'
       *     - Document properties needed (more can be provided):
       *         id,
       *         orderStatus,
       *         shippingInfo.name aliased as shippedTo,
       *         grandTotal,
       *         lineItems,
       *         orderDate (hint use MILLIS_TO_STR())
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

  /**
   * Saves a new address for provided customer.
   *
   * Operation will check path='address' in customer document and add new address to
   *    address sub-document.  If the address sub-document (i.e. path='address') does not exist
   *    the address sub-document will be created.
   *
   * @param {integer} custId - Id of customer document.
   * @param {string} path - Path of address sub-document in customer document.
   * @param {Object} address - Address object for customer object.
   * @param {Repository~couchbaseCallback} callback - callback to handle couchbase operation's response.
   */
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
      callback(null, "NOP");
    } catch (err) {
      //Optional - add business logic to handle error types      
      outputMessage(err, "repository.js:saveAddress() - error:");
      callback(err, null);
    }
  }

  /**
   * Updates an address for provided customer.
   *
   * Operation will updated address sub-document (i.e. path='address') in customer document.
   *    If the address sub-document (i.e. path='address') does not exist the address sub-document
   *    will be created.
   *
   * @param {integer} custId - Id of customer document.
   * @param {string} path - Path of address sub-document in customer document.
   * @param {Object} address - Address object for customer object.
   * @param {Repository~couchbaseCallback} callback - callback to handle couchbase operation's response.
   */
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
      callback(null, "NOP");
    } catch (err) {
      //Optional - add business logic to handle error types
      outputMessage(err, "repository.js:updateAddress() - error:");
      callback(err, null);
    }
  }

  /**
   * Helper methods:
   *    getNewCustomerDocument()
   *    getNewUserDocument()
   *    getLastOrderId()
   *    getLastCustomerId()
   *    getLastUserId()
   */

  getNewCustomerDocument(userInfo, callback) {
    this.getLastCustomerId(function(err, custId) {
      if (err) {
        return callback(err, null);
      }

      let key = `customer_${custId + 1}`;
      let date = new Date();
      let createDateTimeStamp = Math.floor(date / 1000);
      let currentDay = `${date.getFullYear()}-${date.getMonth() +
        1}-${date.getDate()}`;

      let customerDoc = {
        doc: {
          type: "customer",
          schema: "1.0.0",
          created: createDateTimeStamp,
          createdBy: 1234,
        },
        _id: key,
        custId: custId + 1,
        custName: {
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
        },
        username: userInfo.username,
        email: userInfo.email,
        createdOn: currentDay,
        address: {
          home: {
            address: "1234 Main St",
            city: "Some City",
            state: "TX",
            zipCode: "12345",
            country: "US",
          },
          work: {
            address: "1234 Main St",
            city: "Some City",
            state: "TX",
            zipCode: "12345",
            country: "US",
          },
        },
        mainPhone: {
          phone_number: "1234567891",
          extension: "1234",
        },
        additionalPhones: {
          type: "work",
          phone_number: "1234567891",
          extension: "1234",
        },
      };
      callback(null, customerDoc);
    });
  }

  getNewUserDocument(userInfo, callback) {
    this.getLastUserId(function(err, userId) {
      if (err) {
        return callback(err, null);
      }

      let key = `user_${userId + 1}`;
      let userDoc = {
        docType: "user",
        _id: key,
        userId: userId + 1,
        username: userInfo.username,
        password: userInfo.password,
      };
      callback(null, userDoc);
    });
  }

  getLastOrderId(callback) {
    let sql = `
      SELECT o.orderId 
      FROM \`${this.bucketName}\` o 
      WHERE o.doc.type='order' 
      ORDER BY o.orderId DESC 
      LIMIT 1;`;
    let n1qlQuery = N1qlQuery.fromString(sql);

    this.bucket.query(n1qlQuery, function(err, rows) {
      if (err) {
        return callback(err, null);
      }
      let orderId = rows && rows.length > 0 ? parseInt(rows[0].orderId) : 0;
      callback(err, orderId);
    });
  }

  getLastCustomerId(callback) {
    let sql = `
      SELECT c.custId 
      FROM \`${this.bucketName}\` c 
      WHERE c.doc.type='customer' 
      ORDER BY c.custId DESC 
      LIMIT 1;`;
    let n1qlQuery = N1qlQuery.fromString(sql);

    this.bucket.query(n1qlQuery, function(err, rows) {
      if (err) {
        return callback(err, null);
      }
      let custId = rows && rows.length > 0 ? parseInt(rows[0].custId) : 0;
      callback(err, custId);
    });
  }

  getLastUserId(callback) {
    let sql = `
      SELECT u.userId 
      FROM \`${this.bucketName}\` u 
      WHERE u.docType='user' 
      ORDER BY u.userId DESC 
      LIMIT 1;`;
    let n1qlQuery = N1qlQuery.fromString(sql);

    this.bucket.query(n1qlQuery, function(err, rows) {
      if (err) {
        return callback(err, null);
      }
      let userId = rows && rows.length > 0 ? parseInt(rows[0].userId) : 0;
      callback(err, userId);
    });
  }

  getObjectByKey(key, callback) {
    this.bucket.get(key, function(err, result) {
      callback(err, !err ? result.value : null);
    });
  }
}

/**
 *
 * @callback Repository~couchbaseCallback
 * @param {Object} error - Couchbase error object
 * @param {Object} result - Couchbase result object
 *
 */

/**
 * @module Repository
 *
 */

module.exports = new Repository();