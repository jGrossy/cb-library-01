const jsonfile = require('jsonfile');
const dbFilePath = 'data/data.json';
const { isEmpty, lowerCase } = require('lodash');

class Mockdb {
    /**
     *
     * @returns
     */
    async getBooks() {
        const data = jsonfile.readFileSync(dbFilePath);
        return data.Books;
    }

    /**
     *
     * get a book list by filter,
     * if filters are empty get all books
     *
     * @param {string} Title
     * @param {string} Category
     * @returns
     */
    async filterBookList(Title, Category) {
        const data = jsonfile.readFileSync(dbFilePath);
        const bookList = [];

        data.Books.forEach((book) => {
            if (!isEmpty(Title) && isEmpty(Category) && lowerCase(book.Title).includes(lowerCase(Title))) {
                bookList.push(book);
            }

            if (isEmpty(Title) && !isEmpty(Category) && lowerCase(book.Genre).includes(lowerCase(Category))) {
                bookList.push(book);
            }

            if (
                !isEmpty(Title) &&
                !isEmpty(Category) &&
                lowerCase(book.Title).includes(lowerCase(Title)) &&
                lowerCase(book.Genre).includes(lowerCase(Category))
            ) {
                bookList.push(book);
            }
        });
        return bookList;
    }

    /**
     *
     * get all book categories
     *
     * @returns
     */
    async getCategories() {
        const data = jsonfile.readFileSync(dbFilePath);
        const categories = [];
        data.Books.forEach((book) => {
            const bookCategories = book.Genre.split(',');
            bookCategories.map((category) => {
                if (!categories.includes(category)) categories.push(category);
            });
        });
        return categories;
    }
}

module.exports = {
    Mockdb,
};
