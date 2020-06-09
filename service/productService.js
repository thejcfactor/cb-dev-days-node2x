//connection made in server.js -> should cache the repository so only 1 instance instantiated (i.e. singleton pattern)
const db = require("repository/repository");
const { Response } = require("library/response");

module.exports = {
  searchProducts
};

function searchProducts(product, fuzziness, callback) {
  //TODO:  fuzziness?  other FTS options?
  let response = new Response(null, "Operation not built yet.", null, null);
  db.searchProducts(product, fuzziness, function(err, products) {
    if (!err) {
      //NOP is to take into account potential lab for registering user
      if (products == "NOP") {
        return callback(response);
      }
      response.data = products;
      response.message = "Successfully searched for products.";
      callback(response);
    } else {
      response.message = "Error searching for products.";
      response.error = err;
      callback(response);
    }
  });
}
