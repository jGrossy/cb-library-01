const express = require('express');
const router = express.Router();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../../swagger/swagger-output.json');
const { getCategories, getBookList, filterBookList } = require('../middlewares/library');

router.route('/categories').get(getCategories);
router.route('/bookList').get(getBookList);
router.route('/bookList').post(filterBookList);

router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', swaggerUi.setup(swaggerDocument));

module.exports = router;
