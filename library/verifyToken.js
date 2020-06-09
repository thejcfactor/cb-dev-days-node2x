// const config = require('configuration/config.js');
// const jwt = require('jsonwebtoken');
// const secret = global.configuration.secret;
const userService = require("service/userService");
const outputMessage = require("library/outputMessage");
const { Response } = require("library/response");

module.exports = verifyToken;

function verifyToken(req, res, next){
    let bearerHeader = req.headers["authorization"];
    let response = new Response(null, null, null, null);
    //only used for req/response logging in UI
    // let reqId = -1;
    // try{
    //     reqId = req.body.requestId ? parseInt(req.body.requestId) : parseInt(req.query.requestId);
    // }catch(err){
    //     outputMessage(err.stackTrace, "verifyToken.js:verifyToken() - error trying to parse requestId:");
    // }
    

    if(!bearerHeader){
        // res.status(401).send({
        //     data: null,
        //     message: "No authorization token provided.",
        //     error: null,
        //     authorized: false,
        //     requestId: reqId
        //   });
        response.message = "No authorization token provided.";
        response.authorized = false;
        req.jwt = {
          token: null,
          sessionRes: response
        };
        return next();
    }

    let token = null;
    try{
        token = bearerHeader.replace("Bearer ", "");
        userService.extendSession(token, function(extSessionRes){
            // if(response.error){
            //     //Couchbase KeyNotFound
            //     if(response.error.code == 13){
            //         response.message = "Unauthorized.  Session expired.";
            //         response.authorized = false;
            //         response.requestId = reqId;
            //         return res.status(401).send(response);
            //     }
            //     return res.status(500).send(response);
            // }
            req.jwt ={
                token: extSessionRes.error ? null : token,
                sessionRes: extSessionRes
            };
            next();
        });
    }
    catch(err){
        // return res.status(500).send({
        //     data: null,
        //     message: "Failed to extend session.",
        //     error: err,
        //     authorized: null,
        //     requestId: reqId
        //   });
        response.error = err;
        response.message = "Failed to extend session.";
        req.jwt = {
            token: null,
            sessionRes: response
        };
        next();
    }
    // jwt.verify(token, secret, function(err, decoded){
    //     if(err){
    //         return res.status(500).send({
    //             data: null,
    //             message: "Failed to authenticate.",
    //             error: err,
    //             authorized: false,
    //             requestId: reqId
    //           });
    //     }
    // });
}