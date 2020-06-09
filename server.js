require("rootpath")();
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");
const errorHandler = require("library/errorHandler");
const outputMessage = require("library/outputMessage");

process.env.NODE_ENV = "dev";

const db = require("repository/repository");

let port = process.env.API_PORT;
if(typeof port == "undefined"){
  port = global.configuration.port;;
}

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Couchbase Node.js Retail Sample API",
    version: "1.0.0",
    description: "Node.js 2.x API to demonstrate Couchbase via the retail sample dataset."
  },
  host: `localhost:${port}`,
  basepath: "/",
  components: {
    schemas: {},
    securitySchemes: {
      bearerAuth: {
        description: "JWT authorization",
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  }
};

const options = {
  swaggerDefinition,
  apis: ["./controllers/*.js"]
};

const swaggerSpec = swaggerJSDoc(options);

app.get("/swagger.json", function(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.use("/user", require("controllers/userController"));
app.use("/product", require("controllers/productController"));
app.use("/test", require("controllers/testController"));

// global error handler
app.use(errorHandler);

const server = app.listen(port, function() {
  outputMessage(port, "server.js - listening on port");
});
