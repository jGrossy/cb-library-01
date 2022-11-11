const logger = require('./logger');
const cors = require('./cors');

const defaultOpts = {
    port: 3001,
    cors,
    logger,
    errorHandler: {
        detailed: true,
    },
};

module.exports = {
    development: {
        ...defaultOpts,
    },
    test: {
        ...defaultOpts,
    },
    staging: {
        ...defaultOpts,
    },
    production: {
        ...defaultOpts,
    },
};
