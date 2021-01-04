class ExpressError extends Error {
    constructor(message, statusCode){
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}


module.exports = ExpressError;

// We can now throw this in different classes.
