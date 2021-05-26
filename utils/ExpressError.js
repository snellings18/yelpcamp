// This file sends an Error Page (such as a 401 or 404 page to the user).
// Class for expressing an Express Error.

class ExpressError extends Error {
    constructor(message, statusCode) {
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError;