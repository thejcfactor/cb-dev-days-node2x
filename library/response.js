
class Response {
    constructor(data, msg, error, auth) {
        this.data = data;
        this.message = msg;
        this.error = error;
        this.authorized = auth;
    }
}

module.exports = {
    Response
};