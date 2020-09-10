const express = require("express");
const router = express.Router();
const verifyToken = require("library/verifyToken");
const { Response } = require("library/response");
const userService = require("service/userService");
const db = require("repository/repository");

/**
 * @swagger
 *
 * /test/ping:
 *   get:
 *     tags:
 *       - Test
 *     name: ping
 *     description: Uses the SDK's health check API to return status of ping() result to db.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: status of specified services
 */
router.get("/ping", ping);

/**
 * @swagger
 *
 * /test/authorizedPing:
 *   get:
 *     tags:
 *       - Test
 *     name: authorizedPing
 *     description: Verify JWT is working successfully.  Uses the SDK's health check API to return status of ping() result to db.
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: success
 *       401:
 *         description: unauthorized user
 */
router.get("/authorizedPing", verifyToken, authorizedPing);

/**
 * @swagger
 *
 * /test/testLogin:
 *   get:
 *     tags:
 *       - Test
 *     name: testLogin
 *     description: Endpoint to test login and obtain JWT auth token.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: username
 *         description:  Username for login
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: password
 *         description:  Password for login
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: success
 */
router.get("/testLogin", testLogin);

module.exports = router;

function ping(req, res) {
  try {
    db.ping(function(err, result) {
      let response = new Response(null, "", null, null);
      if (!err) {
        response.data = result;
        response.message = "Successfully pinged database.";
        res.status(200).send(response);
      } else {
        response.message = "Error trying to ping database.";
        response.error = err;
        res.status(500).send(response);
      }
    });
  } catch (err) {
    res.status(500).send({
      data: null,
      message: "Error attempting to ping database.",
      error: { message: err.message, stackTrace: err.stack },
      authorized: null
    });
  }
}

function authorizedPing(req, res) {
  try {
    if (!req.jwt) {
      return res.status(401).send({
        data: null,
        message: "Unauthorized.",
        error: null,
        authorized: false
      });
    }

    db.ping(function(err, result) {
      let response = new Response(null, "", null, true);
      if (!err) {
        response.data = result;
        response.message = "Successfully pinged database.";
        res.status(200).send(response);
      } else {
        response.message = "Error trying to ping database.";
        response.error = err;
        res.status(500).send(response);
      }
    });
  } catch (err) {
    res.status(500).send({
      data: null,
      message: "Error attempting to ping database.",
      error: { message: err.message, stackTrace: err.stack },
      authorized: null
    });
  }
}

function testLogin(req, res) {
  try {
    if (!(req.query.username && req.query.password)) {
      return res.status(500).send({
        data: null,
        message: "No username and/or password provided.",
        error: err,
        authorized: null
      });
    }

    let request = {
      username: req.query.username,
      pw: req.query.password
    };

    userService.login(request, function(response) {
      if (response.error) {
        return res.status(500).send(response);
      }

      if (response.data && response.authorized) {
        return res.status(200).send(response);
      }

      res.status(401).send(response);
    });
  } catch (err) {
    res.status(500).send({
      data: null,
      message: "Error attempting to login user.",
      error: { message: err.message, stackTrace: err.stack },
      authorized: null
    });
  }
}
