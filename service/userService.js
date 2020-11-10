const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const config = require("configuration/config.js");
const secret = global.configuration.secret;
const ttl = global.configuration.sessionTTL;

//connection made in server.js -> should cache the repository so only 1 instance instantiated (i.e. singleton pattern)
const db = require("repository/repository");

const outputMessage = require("library/outputMessage");
const { Response } = require("library/response");

module.exports = {
  register,
  login,
  extendSession,
  getUserFromSession,
  getCustomer,
  getCustomerOrders,
  getNewOrder,
  getOrder,
  saveOrUpdateOrder,
  deleteOrder,
  saveOrUpdateAddress
};

function register(userInfo, callback) {
  userInfo.password = bcrypt.hashSync(userInfo.password, 10);
  let response = new Response(null, "Operation not built yet.", null, null);
  db.createAccount(userInfo, function(err, acct) {
    outputMessage(acct, "userService.js:register() - acct:");
    if (!err) {
      //NOP is to take into account potential lab for registering user
      if (acct == "NOP") {
        return callback(response);
      }
      response.data = acct;
      response.message = "Successfully registered customer/user.";
      callback(response);
    } else {
      if(err == "Username already exists"){
        response.message = "Cannot create user.  Username already exists."
      }else{
        response.message = "Error registering customer/user.";
      }
      response.error = err;
      callback(response);
    }
  });
}

function login(req, callback) {
  verifyUser(req.username, req.pw, null, function(validUserRes){
    if(validUserRes.error || validUserRes.message.includes("Operation not")){
      return callback(validUserRes);
    }

    let response = new Response(null, "Operation not built yet.", null, null);

    if (!validUserRes.data) {
      response.message = "Invalid user.  Check username and password.";
      response.authorized = false;
      return callback(response);
    }

    let key = `customer_${validUserRes.data.custId}`;
    db.getObjectByKey(key, function(err, customerInfo){
      if(customerInfo){
        createSession(req.username, function(sessionRes){
          if(sessionRes.error){
            return callback(sessionRes);
          }

          let token = jwt.sign({ id: sessionRes.data.sessionId }, secret);
          response.data = {
            userInfo: {
              userId: validUserRes.data.userId,
              username: validUserRes.data.username,
              token: token,
            },
            customerInfo: customerInfo,
          };
          response.message = "Successfully logged in (session created).";
          response.authorized = true;
          callback(response);
        });
      }else{
        response.message = "Invalid user.  Check username";
        response.authorized = false;
        response.error = err;
        callback(response);
      }
    });

  });
}

function getUserFromSession(jwt, callback) {
  verifyUser(jwt.sessionRes.data.username, null, true, function(validUserRes){
    if(validUserRes.error || validUserRes.message.includes("Operation not")){
      return callback(validUserRes);
    }

    let response = new Response(null, "Operation not built yet.", null, null);

    if (!validUserRes.data) {
      response.message = "Invalid user.  Check username and password.";
      response.authorized = false;
      return callback(response);
    }

    let key = `customer_${validUserRes.data.custId}`;
    db.getObjectByKey(key, function(err, customerInfo){
      if(customerInfo){
        response.data = {
          userInfo: {
            userId: validUserRes.data.userId,
            username: validUserRes.data.username,
            token: jwt.token,
          },
          customerInfo: customerInfo,
        };
        response.message = "Successfully logged in (session created).";
        response.authorized = true;
        callback(response);
      }else{
        response.message = "Invalid user.  Check username";
        response.authorized = false;
        response.error = err;
        callback(response);
      }
    });
  });
}

function extendSession(token, callback) {
  
  let response = new Response(null, "Operation not built yet.", null, null);
  let decoded = null;
  try{
    decoded = jwt.verify(token, secret);
  }catch(err){
    response.message = "Error extending session.  Invalid token.";
    response.error = err;
    response.authorized = false;
    return callback(response);
  }
  
  db.extendSession(decoded.id, ttl, function(err, session) {
    if(err){
      if(err.code == 13){
        response.message = "Unauthorized.  Session expired";
        response.authorized = false;
      }else{
        response.message = "Error trying to verify session.";
      }
      response.error = err;
      return callback(response);
    }

    if(session == "NOP"){
      return callback(response);
    }

    response.data = session;
    response.message = "Successfully extended session.";
    response.authorized = true;
  
    callback(response);
  });
}

function getCustomer(id, callback){
  let response = new Response(null, "Operation not built yet.", null, true);
  let docId = `customer_${id}`;
  db.getCustomer(docId, function(err, customer) {
    if (!err) {
      if (customer == "NOP") {
        return callback(response);
      }
      response.data = customer;
      response.message = "Successfully retrieved customer.";
      callback(response);
    } else {
      response.error = err;
      response.message = "Error retrieving customer.";
      callback(response);
    }
  });
}

function getCustomerOrders(id, callback) {
  let response = new Response(null, "Operation not built yet.", null, true);
  db.getOrders(id, function(err, orders) {
    if (!err) {
      if (orders == "NOP") {
        return callback(response);
      }
      response.data = orders;
      response.message = "Successfully retrieved orders.";
      callback(response);
    } else {
      response.error = err;
      response.message = "Error retrieving orders.";
      callback(response);
    }
  });
}

function getNewOrder(id, callback) {
  let response = new Response(null, "Operation not built yet.", null, true);
  db.getNewOrder(id, function(err, order) {
    if (!err) {
      if (order == "NOP") {
        return callback(response);
      }
      response.data = order;
      response.message = "Successfully retrieved new/pending order.";
      callback(response);
    } else {
      response.error = err;
      response.message = "Error retrieving new/pending order.";
      callback(response);
    }
  });
}

function getOrder(id, callback) {
  let response = new Response(null, "Operation not built yet.", null, true);
  db.getOrder(id, function(err, order) {
    if (!err) {
      if (order == "NOP") {
        return callback(response);
      }
      response.data = order;
      response.message = "Successfully retrieved order.";
      callback(response);
    } else {
      response.error = err;
      response.message = "Error retrieving order.";
      callback(response);
    }
  });
}

function saveOrUpdateOrder(request, callback) {
  if (request.update) {
    updateOrder(request.order, callback);
  } else {
    saveOrder(request.order, callback);
  }
}

function deleteOrder(id, callback) {
  let response = new Response(null, "Operation not built yet.", null, true);
  db.deleteOrder(id, function(err, result) {
    if (!err) {
      if (result == "NOP") {
        return callback(response);
      }
      response.data = result;
      response.message = "Successfully deleted order.";
      callback(response);
    } else {
      response.error = err;
      response.message = "Error deleting order.";
      callback(response);
    }
  });
}

function saveOrUpdateAddress(request, callback) {
  outputMessage(request, "userService.js:saveOrUpdateAddress() - req:");

  //If updating address, path should be:  address.<name of address to update>
  //      EX.  address.home
  //If saving address, path should be:  address.  Since this is the root path to all addresses for the customer doc type
  if (request.update) {
    updateAddress(request, callback);
  } else {
    saveAddress(request, callback);
  }
}


/*
 * Private/Helper methods 
 * 
 */

function verifyUser(username, password, jwt, callback){
  let response = new Response(null, "Operation not built yet.", null, null);
  db.getUserInfo(username, false, function(err, userInfo){
    if(err || !userInfo){
      response.error = err;
      response.message = "Could not find user.";
      //return callback(err, null);
      return callback(response);
    }

    if(userInfo == "NOP"){
      return callback(response);
    }

    if(jwt){
      response.data = userInfo;
      response.message = "JWT - no password verification needed.";
      return callback(response);
    }

    let passwordIsValid = bcrypt.compareSync(password, userInfo.password);
    if(passwordIsValid){
      response.data = userInfo;
      response.message = "Password verified.";
    }else{
      response.message = "Invalid password.";
    }

    callback(response);
  });
}

function createSession(username, callback) {
  let response = new Response(null, "Operation not built yet.", null, null);

  db.createSession(username, ttl, function(err, session) {
    if(session.error){
      response.message = "Error creating session.";
      response.error = err;
      return callback(response);
    }

    outputMessage(session, "userService.js:createSession() - session:");
    //NOP is to take into account potential lab for creating user session
    if (session != "NOP") {
      response.data = session;
      response.message = "Session created";
      return callback(response);
    }

    callback(response);
  });
}

function saveOrder(order, callback) {
  let response = new Response(null, "Operation not built yet.", null, true);
  db.saveOrder(order, function(err, order) {
    if (!err) {
      //NOP is to take into account potential lab for saving/updating order
      if (order == "NOP") {
        return callback(response);
      }
      response.data = order;
      response.message = "Successfully saved order.";
      callback(response);
    } else {
      response.message = "Error saving order.";
      response.error = err;
      callback(response);
    }
  });
}

function updateOrder(order, callback) {
  let response = new Response(null, "Operation not built yet.", null, true);
  db.replaceOrder(order, function(err, result) {
    if (!err) {
      //NOP is to take into account potential lab for saving/updating order
      if (result == "NOP") {
        return callback(response);
      }
      response.data = result;
      response.message = "Successfully updated order.";
      callback(response);
    } else {
      response.message = "Error updating order.";
      response.error = err;
      callback(response);
    }
  });
}

function saveAddress(request, callback) {
  let response = new Response(null, "Operation not built yet.", null, true);
  db.saveAddress(request.custId, request.path, request.address, function(
    err,
    result
  ) {
    if (!err) {
      //NOP is to take into account potential lab for saving/updating address
      if (result == "NOP") {
        return callback(response);
      }
      response.data = result;
      response.message = "Successfully saved address.";
      callback(response);
    } else {
      response.message = "Error saving address.";
      response.error = err;
      callback(response);
    }
  });
}

function updateAddress(request, callback) {
  let response = new Response(null, "Operation not built yet.", null, true);
  
  db.updateAddress(request.custId, request.path, request.address, function(
    err,
    result
  ) {
    if (!err) {
      //NOP is to take into account potential lab for saving/updating address
      if (result == "NOP") {
        return callback(response);
      }
      response.data = result;
      response.message = "Successfully updated address.";
      callback(response);
    } else {
      response.message = "Error updating address.";
      response.error = err;
      callback(response);
    }
  });
}
