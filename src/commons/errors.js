const { ServiceFaults } = require('./constants');

class ServiceError extends Error {
    constructor(message) {
        super(message);
        // Ensure the name of this error is the same as the class name
        this.name = this.constructor.name;
        // This clips the constructor invocation from the stack trace.
        Error.captureStackTrace(this, this.constructor);
        this.data = { error: ServiceFaults.ServiceError };
    }
}

class InternalError extends ServiceError {
    constructor({ Code, Message, Status }) {
        super(Message);
        this.data = { error: { Code, Message, Status } };
    }
}

class InternalServerError extends InternalError {
    constructor() {
        super(ServiceFaults.InternalServerError);
    }
}

class MissingParametersError extends InternalError {
    constructor() {
        super(ServiceFaults.MissingParametersError);
    }
}

module.exports = {
    ServiceError,
    InternalError,
    InternalServerError,
    MissingParametersError,
};
