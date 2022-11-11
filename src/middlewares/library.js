const { Library } = require('../dal/library');
const { isEmpty } = require('lodash');
const { MissingParametersError } = require('../commons/errors');

/**
 * get all book categories
 *
 * @param {*} req
 * @param {*} res
 *
 * {
 *   "data": [
 *       "tech",
 *       "science",
 *       "economics"
 *   ]
 * }
 *
 * @param {*} next
 * @returns
 */
module.exports.getCategories = async (req, res, next) => {
    try {
        const dal = new Library();
        req.data = await dal.getCategories();
        return next();
    } catch (err) {
        next(err);
    }
};

/**
 *
 * get all books
 *
 * @param {*} req
 * @param {*} res
 *
 * {
 *   "data": {
 *       "Books": [
 *           {
 *               "Title": "Fundamentals of Wavelets",
 *               "Author": "Goswami Jaideva",
 *               "Genre": "tech"
 *           },
 *           {
 *               "Title": "Data Smart",
 *               "Author": "Foreman, John",
 *               "Genre": "tech"
 *           }
 *       ]
 * }
 *
 * @param {*} next
 * @returns
 */
module.exports.getBookList = async (req, res, next) => {
    try {
        const dal = new Library();
        req.data = await dal.getBookList();
        return next();
    } catch (err) {
        next(err);
    }
};

/**
 *
 * get book by title and/or categories
 *
 * @param {*} req
 * {
 *      "Title": "Orientalism",
 *      "Category": ""
 * }
 * @param {*} res
 *
 * {
 *   "data": [
 *       {
 *           "Title": "Orientalism",
 *           "Author": "Said, Edward",
 *           "Genre": "nonfiction,history"
 *       }
 *   ]
 * }
 *
 * @param {*} next
 * @returns
 */
module.exports.filterBookList = async (req, res, next) => {
    const { Title, Category } = req.body;

    try {
        if (isEmpty(Title) && isEmpty(Category)) throw new MissingParametersError();

        const dal = new Library();
        req.data = await dal.filterBookList(Title, Category);
        return next();
    } catch (err) {
        next(err);
    }
};
