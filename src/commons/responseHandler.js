const { isEmpty, round, isNil, has } = require('lodash');
const { info: _info, error: _error, debug } = require('../commons/logger');
const { compact } = require('lodash');
const { DateTime } = require('luxon');
const {
    ServiceFaults: { InternalServerError },
} = require('./constants');

/**
 *
 * @param {*} req
 * @param {*} extra
 * @returns
 */
function debugExpressRequest(req, extra = {}) {
    // timestamp the request/response in UTC
    const now = DateTime.local().toUTC();

    const { method, url, originalUrl, headers, ip } = req;

    return {
        date: now.toISODate(),
        time: now.toISOTime(),
        class: originalUrl.split('/')[1],
        method: url.split('/')[1],
        correlationId: req.correlationId(),
        extra: {
            HTTPReqIP: ip,
            HTTPReqHost: headers.host,
            HTTPReqMethod: method,
            HTTPReqURL: url,
            HTTPReqOriginalURL: originalUrl,
            HTTPReqUserAgent: req.get('user-agent'),
            ...extra,
        },
    };
}

/**
 *
 * @param {*} req
 * @param {*} _
 * @param {*} next
 * @returns
 */
function debugRequest(req, _, next) {
    // don't bother if it's pre-flight requests
    if (req.method === 'OPTIONS') return next();

    const info = debugExpressRequest(req);

    const {
        extra: { HTTPReqIP, HTTPReqMethod, HTTPReqOriginalURL, HTTPReqUserAgent },
    } = info;

    _info(compact([req.correlationId(), HTTPReqUserAgent]).join(' | '), info);

    req.FBLogInfo = [HTTPReqMethod, HTTPReqOriginalURL, HTTPReqIP, req.correlationId(), HTTPReqUserAgent].join(' | ');

    next();
}

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
function debugTiming(req, res, next) {
    // don't bother if it's pre-flight requests
    if (req.method === 'OPTIONS') return next();

    const startHrTime = process.hrtime();

    res.on('finish', () => {
        const elapsedHrTime = process.hrtime(startHrTime);
        const HTTPResTimeInMs = elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6;

        const info = debugExpressRequest(req, {
            HTTPResTimeInMs,
        });

        const {
            extra: { HTTPReqUserAgent },
        } = info;

        _info(compact([req.correlationId(), HTTPReqUserAgent, `${round(HTTPResTimeInMs)}ms`]).join(' | '), info);

        //next();
    });

    next();
}

/**
 *
 * @param {*} fault
 * @param {*} req
 * @param {*} res
 * @param {*} extra
 */
function RespondWithFault(fault, req, res, extra = {}) {
    const err = {};
    Error.captureStackTrace(err);
    const stack = err.stack.split('\n')[2].trim();

    const { Code: FaultCode, Message: FaultMessage, Status } = fault;

    _error([req.FBLogInfo, `ERROR`, FaultCode, FaultMessage, Status, stack].join(' | '));

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');

    res.status(Status).send(
        JSON.stringify({
            FaultCode,
            FaultMessage,
            FaultInfo: {
                stack,
                ...extra,
            },
        }),
    );
}

/**
 *
 * @param {*} err
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
function handleUnexpectedError(err, req, res, next) {
    const { name, title, message, stack, data } = err;

    return RespondWithFault(InternalServerError, req, res, {
        type: name,
        title,
        message,
        data,
        stack: stack.split('\n')[1].trim(),
    });
}

/**
 *
 * @param {*} err
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
function handleApplicationError(err, req, res, next) {
    if (has(err, 'data.error.Code')) {
        return RespondWithFault(err.data.error, req, res);
    }

    next(err);
}

/**
 * Format the response into a defined error template
 * @param {Object} err
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 * @return void
 */
function handleErrorResponse(err, req, res, next) {
    if (res._headerSent) {
        debug(compact([req.get('user-agent'), 'Skipping Error Middleware']).join(' | '));
        return next();
    }

    let errorMsg = err;
    let errorStack;
    if (err instanceof Error) {
        errorMsg = err.message;
        errorStack = err.stack?.split('\n')[1].trim();
    } else if (typeof err === 'object') {
        errorMsg = isEmpty(err) ? '' : JSON.stringify(err);
    }

    _error(compact([req.get('user-agent'), 'ERROR', errorMsg, errorStack || '']).join(' | '), {
        ...debugExpressRequest(req),
    });

    next(err);
}

/**
 * Format the response into a defined success template
 * @param {Object} req
 * @param {Object} res
 * @return void
 */
function handleResponse(req, res, next) {
    if (res._headerSent) {
        debug(compact([req.get('user-agent'), 'Skipping Success Middleware']).join(' | '));
        return next();
    }

    const payload = {
        data: null,
    };

    if (!isNil(req.data)) {
        const { data } = req;

        Object.assign(payload, {
            data,
        });
    }

    if (!isNil(req.route)) {
        const HTTPResStatusCode = res.statusCode;

        const info = debugExpressRequest(req, {
            HTTPResBodyJSON: payload,
            HTTPResStatusCode,
        });

        const {
            extra: { HTTPReqUserAgent },
        } = info;

        _info(compact([req.correlationId(), HTTPReqUserAgent, HTTPResStatusCode]).join(' | '), {
            ...debugExpressRequest(req, {
                HTTPResBodyJSON: payload,
                HTTPResStatusCode,
            }),
        });
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');

    res.status(200).json(payload);
}

module.exports = {
    handleResponse,
    handleErrorResponse,
    debugRequest,
    debugTiming,
    debugExpressRequest,
    handleUnexpectedError,
    handleApplicationError,
    RespondWithFault,
};
