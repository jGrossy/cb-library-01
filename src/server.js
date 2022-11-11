const { _getKeyValue_ } = require('./commons/utils');
const { cors: corsConfig, port: serverPort } = _getKeyValue_(process.env.NODE_ENV)(require('./configs'));
const express = require('express');
const correlator = require('express-correlation-id');
const { urlencoded, json } = require('body-parser');
const cors = require('cors');
const { filter } = require('compression');
const compression = require('compression');
const {
    handleErrorResponse,
    debugRequest,
    debugTiming,
    handleResponse,
    handleUnexpectedError,
    handleApplicationError,
} = require('./commons/responseHandler');
const { authorizeHeaders } = require('./commons/auth');
const router = require('./routes/route');
const { InternalError } = require('./commons/errors');

class Server {
    constructor() {
        this.app = express();
        this.app.use(
            compression({
                filter: (req, res) => {
                    if (req.headers['x-no-compression']) {
                        return false;
                    }
                    return filter(req, res);
                },
            }),
        );
        this.app.use(urlencoded({ extended: true, limit: '100mb' }));
        this.app.use(json());
        this.app.use(
            cors({
                origin: corsConfig.AccessControlAllowOrigin,
                methods: corsConfig.AccessControlAllowMethods,
                allowedHeaders: corsConfig.AccessControlAllowHeaders,
                exposedHeaders: corsConfig.AccessControlExposeHeaders,
                preflightContinue: corsConfig.preflightContinue,
                optionsSuccessStatus: corsConfig.optionsSuccessStatus,
            }),
        );
        this.app.use(correlator());
        this.app.use(debugRequest);
        // this.app.use(debugTiming);
        this.app.use(authorizeHeaders);
        this.app.use('', router);

        this.app.use(handleResponse);
        this.app.use(function (_, res, next) {
            if (res.headersSent) return;
            const err = new InternalError({ Code: 404, Message: 'Endpoint not found', Status: 404 });
            next({
                ...err,
                status: 404,
            });
        });
        this.app.use(handleErrorResponse);
        this.app.use(handleApplicationError);
        this.app.use(handleUnexpectedError);
    }

    async start() {
        this.server = this.app.listen(serverPort, '0.0.0.0');
    }

    stop() {
        this.server && this.server.close();
    }
}

module.exports = {
    Server,
};
