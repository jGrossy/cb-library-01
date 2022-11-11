const swaggerAutogen = require('swagger-autogen')({ openapi: '3.0.0' });

const doc = {
    info: {
        version: '',
        title: 'cb-library-01',
        description: '',
    },
    host: 'localhost:3001',
    basePath: '/',
    schemes: ['http'],
    consumes: [],
    produces: [],
    tags: [
        // by default: empty Array
        {
            name: '', // Tag name
            description: '', // Tag description
        },
    ],
    securityDefinitions: {},
    definitions: {},
    components: {},
};

const outputFile = 'swagger/swagger-output.json';
const endpointsFiles = ['src/routes/route.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);
