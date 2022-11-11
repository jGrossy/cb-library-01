try {
    require('dotenv').config();

    const { Server } = require('./server');
    const logger = require('./commons/logger');

    process.on('uncaughtException', (err) => {
        logger.error(`Uncaught exception | ${JSON.stringify(err.name)}`);
        logger.error(`Uncaught exception | ${JSON.stringify(err.message)}`);
        logger.error(`Uncaught exception | ${JSON.stringify(err.stack)}`);
    });

    process.on('unhandledRejection', (err) => {
        logger.error(`Uncaught exception | ${JSON.stringify(err)}`);
    });

    new Server().start().then(() => logger.info(`cb-library-01 app started`));
} catch (e) {
    console.log(`start error ${e} ${e.stack}`);
}
