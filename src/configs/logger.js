const defaultFileOptions = {
    dirname: 'logs',
    datePattern: 'YYYYMMDD_',
    prepend: true,
    maxsize: 102400,
    maxFiles: '20d',
    zippedArchive: true,
    silent: false,
    handleExceptions: true,
};

const defaultConsoleOptions = {
    silent: false,
    handleExceptions: true,
    json: false,
    colorize: true,
    timestamp: true,
};

const defaultOpts = {
    mode: 'rotate', // rotate || size
    sql: {
        enable: false,
        level: 'debug',
    },
    console: {
        level: 'debug',
        ...defaultConsoleOptions,
    },
    file: {
        ...defaultFileOptions,
        level: 'info',
        filename: '%DATE%-cb-library-01.log',
    },
    errorFile: {
        ...defaultFileOptions,
        level: 'error',
        filename: '%DATE%-cb-library-01-error.log',
    },
    debugFile: {
        ...defaultFileOptions,
        level: 'debug',
        filename: '%DATE%-cb-library-01-debug.log',
    },
};

module.exports = {
    ...defaultOpts,
};
