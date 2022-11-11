const defaultOpts = {
    AccessControlAllowOrigin: '*',
    AccessControlAllowMethods: 'GET,PUT,POST,DELETE,OPTIONS',
    AccessControlAllowHeaders: [
        'Accept',
        'X-Access-Token',
        'X-Key',
        'X-Requested-With',
        'Authorization',
        'userToken',
        'content-type',
        'Content-Disposition',
        'culture',
        'uiculture',
        'usertoken',
        'customertoken',
        'appcode',
        'mobilecode',
        'uiculture',
        'x-forwarded-for',
        'anonymoustoken',
        'jwttoken',
    ],
    AccessControlExposeHeaders: ['content-type', 'content-disposition'],
    preflightContinue: false,
    optionsSuccessStatus: 200,
};

module.exports = {
    ...defaultOpts,
};
