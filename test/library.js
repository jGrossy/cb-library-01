process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = require('chai').should();

// const { DateTime } = require('luxon');
chai.use(require('chai-http'));
chai.use(require('chai-integer'));

// const expect = chai.expect;
const assert = chai.assert;

const { Server } = require('../src/server');

describe('Library', function () {
    this.timeout(0);

    let server;
    let app;

    before(async () => {
        server = new Server();
        await server.start();
        app = server.app;
    });

    after(async () => {
        server.stop();
    });

    describe('Library: Basic', () => {
        it('it should get the categories list', async () => {
            const {
                status: status,
                body: { data },
            } = await chai.request(app).get('/categories').set('x-no-compression', true);

            console.dir(data, { depth: null });
            assert.equal(status, 200);
        });

        it('it should get the complete book list', async () => {
            const {
                status: status,
                body: { data },
            } = await chai.request(app).get('/bookList').set('x-no-compression', true);

            console.dir(data, { depth: null });
            assert.equal(status, 200);
            assert.equal(data.Books.length, 16);
        });

        it('it should get a book with Title = Slaughterhouse Five', async () => {
            const {
                status: status,
                body: { data },
            } = await chai.request(app).post('/bookList').set('x-no-compression', true).send({
                Title: 'Slaughterhouse Five',
            });

            console.dir(data, { depth: null });
            assert.equal(status, 200);
        });

        it('it should get all books with category = tech', async () => {
            const {
                status: status,
                body: { data },
            } = await chai.request(app).post('/bookList').set('x-no-compression', true).send({
                Category: 'tech',
            });

            console.dir(data, { depth: null });
            assert.equal(status, 200);
        });
    });
});
