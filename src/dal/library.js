const logger = require('../commons/logger');
const { Mockdb } = require('../services/mockdb');

class Library {
    /**
     * get all book categories
     *
     * @returns
     */
    async getCategories() {
        const db = new Mockdb();
        return await db.getCategories();
    }

    /**
     * get all books
     *
     * @returns
     */
    async getBookList() {
        const db = new Mockdb();
        return await db.getBooks();
    }

    /**
     * get book by title and/or categories
     *
     * @param {string} Title
     * @param {string} Category
     * @returns
     */
    async filterBookList(Title, Category) {
        const db = new Mockdb();
        return await db.filterBookList(Title, Category);
    }
}

module.exports = {
    Library,
};
