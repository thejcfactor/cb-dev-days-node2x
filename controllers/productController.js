const express = require("express");
const router = express.Router();
const productService = require("service/productService");
const outputMessage = require("library/outputMessage");

/**
 * @swagger
 *
 * /product/searchProducts:
 *   get:
 *     tags:
 *       - Product
 *     name: searchProducts
 *     description: Searches products based on search term
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: product
 *         description: The product to search for
 *         schema:
 *           type: string
 *       - in: query
 *         name: fuzziness
 *         description: Fuzziness in FTS search (keep < 2)
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: list of products
 *       401:
 *         description: unauthorized user
 */
router.get("/searchProducts", searchProducts);

module.exports = router;

function searchProducts(req, res) {
  //only used for req/response logging in UI
  let reqId = -1;
  try {
    reqId = req.query.requestId ? parseInt(req.query.requestId) : -1;
    if (!req.query.product || req.query.product == "") {
      return res.status(200).send({
        data: null,
        message: "No search term provided.",
        error: null,
        authorized: null,
        requestId: reqId
      });
    }

    let fuzziness = null;
    
    if(req.query.fuzziness){
      fuzziness = parseInt(req.query.fuzziness);

      if (isNaN(fuzziness)) {
        return res.status(500).send({
          data: null,
          message: "Invalid fuzziness provided.",
          error: null,
          authorized: true,
          requestId: reqId
        });
      }
    }

    productService.searchProducts(req.query.product, fuzziness, function(response) {
      response.requestId = reqId;
      outputMessage(response, "productController.js:searchProducts() - response:");
      if (response.error) {
        return res.status(500).send(response);
      }

      return res.status(200).send(response);
    });
  } catch (err) {
    res.status(500).send({
      data: null,
      message: "Error attempting to search for products.",
      error: { message: err.message, stackTrace: err.stack },
      authorized: null,
      requestId: reqId
    });
  }
}
