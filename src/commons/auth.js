const logger = require('../commons/logger');
const { RespondWithFault } = require('./responseHandler');

/**
 * Extract authorization headers
 *
 * @param {*} req
 * @param {*} res
 * @returns
 */
module.exports.authorizeHeaders = (req, res, next) => {
    const { headers } = req;

    try {
        // do something with headers...
        next();
    } catch (err) {
        return RespondWithFault(err.data.error, req, res);
    }
};
