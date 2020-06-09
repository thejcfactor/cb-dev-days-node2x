const config = require("./config.json");
const env = process.env.NODE_ENV || "dev";

const environmentConfig = config[env];

global.configuration = environmentConfig;
