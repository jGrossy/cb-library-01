const { createLogger, format, transports, addColors } = require('winston');
const { combine, timestamp, colorize, splat, printf } = format;
const { omit, compact, upperCase, padEnd } = require('lodash');
const DailyRotateFile = require('winston-daily-rotate-file');
const { v4: uuidv4 } = require('uuid');

const enumerateErrorFormat = format((info) => {
    if (info instanceof Error) {
        Object.assign(info, { message: info.stack });
    }
    return info;
});

const prettyFormatMessage = ({ label, timestamp, level, message, ...meta }) => {
    const { extra } = meta;
    let extraList = [];
    if (extra !== undefined) {
        const { HTTPReqIP, HTTPReqMethod, HTTPReqOriginalURL } = extra;
        extraList = [HTTPReqMethod, HTTPReqOriginalURL, HTTPReqIP];
    }

    return compact([
        timestamp,
        level,
        `${upperCase(process.env.NODE_ENV)}-${process.version}`,
        `${process.env.APP_NAME}`,
        ...extraList,
        message,
    ]).join(' | ');
};

const theBasicFormat = combine(
    enumerateErrorFormat(),
    format((info) => {
        info.level = padEnd(upperCase(info.level), 5);
        return info;
    })(),
    timestamp(),
    splat(),
);

const theLogstashFormat = combine(
    theBasicFormat,
    printf(({ label, timestamp, level, message, ...meta }) => {
        return JSON.stringify({
            '@timestamp': timestamp,
            severity: level.toUpperCase(),
            message: prettyFormatMessage({ label, timestamp, level, message, ...meta }),
            fields: Object.assign({}, omit(meta, ['level', 'message'])),
            source: process.env.APP_NAME,
            transactionId: uuidv4(),
        });
    }),
);

const theFileFormat = combine(
    theBasicFormat,
    printf(({ label, timestamp, level, message, ...meta }) => {
        return compact([
            prettyFormatMessage({ label, timestamp, level, message, ...meta }),
            //prettyFormatHTTPInfo(meta),
        ]).join('\n');
    }),
);

const theJSONFormat = combine(
    theBasicFormat,
    colorize(),
    printf(({ label, timestamp, level, message, ...meta }) => {
        return compact([
            prettyFormatMessage({ label, timestamp, level, message, ...meta }),
            //prettyFormatHTTPInfo(meta, true),
        ]).join('\n');
    }),
);

/* Add colors */
addColors({
    alert: 'magenta',
    error: 'red',
    warn: 'yellow',
    info: 'blue',
    debug: 'cyan',
    silly: 'grey',
});

const logger = createLogger({
    levels: {
        alert: 0,
        error: 1,
        warn: 2,
        info: 3,
        debug: 4,
        silly: 5,
    },
    transports: [
        new transports.Console({
            level: process.env.LOG_LEVEL,
            silent: false,
            handleExceptions: true,
            format:
                process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
                    ? theJSONFormat
                    : theLogstashFormat,
        }),
        new DailyRotateFile({
            level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
            dirname: 'logs',
            filename: `%DATE%-${process.env.APP_NAME}.log`,
            datePattern: 'YYYYMMDD',
            maxSize: '10g',
            maxFiles: '30d',
            zippedArchive: true,
            silent: false,
            handleExceptions: true,
            format: theFileFormat,
        }),
    ],
    exitOnError: false,
});

module.exports = logger;
