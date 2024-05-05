const { nanoid } = require('nanoid');
const books = require('./books');

// handler for adding books
const addBookHandler = (request, h) => {
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload; // body requested

  // check if name is empty, return fail
  if (name === undefined) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    });
    return response.code(400);
  }

  // checking the readPage, if above the pageCount return fail
  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    });
    return response.code(400);
  }

  // property is processed by the server
  const id = nanoid(16);
  const finished = (readPage === pageCount);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };

  // pushing array into books.js
  books.push(newBook);
  const isSuccess = books.filter((book) => book.id === id).length > 0;

  // if push success, return 200 with books ID
  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    });
    return response.code(201);
  }

  // else, return fail
  const response = h.response({
    status: 'fail',
    message: 'Buku gagal ditambahkan',
  });
  return response.code(500);
};

// handler to get all books
const getAllBooksHandler = (request, h) => {
  const { name, reading, finished } = request.query;

  let keywordBooks = books; // initiate keyword filter variable

  // check if name is not empty and lowercase it
  if (name !== undefined) {
    keywordBooks = keywordBooks.filter((book) => book
      .name.toLowerCase().includes(name.toLowerCase()));
  }
  // check if reading is not defined
  if (reading !== undefined) {
    const isReading = reading === '1'; // Value '1' indicates finished, and '0' unfinished
    keywordBooks = keywordBooks.filter((book) => book.reading === isReading);
  }
  // check if book is not defined, and finished
  if (finished !== undefined) {
    const isFinished = finished === '1'; // Value '1' indicates finished, and '0' unfinished
    keywordBooks = keywordBooks.filter((book) => book.finished === isFinished);
  }

  // return sucess with book details
  const response = h.response({
    status: 'success',
    data: {
      books: keywordBooks.map((book) => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      })),
    },
  });
  return response.code(200);
};

// handler for displayed books by id
const getBookByIdHandler = (request, h) => {
  const { id } = request.params;

  const book = books.filter((n) => n.id === id)[0];

  // return success, with details
  if (book !== undefined) {
    return {
      status: 'success',
      data: {
        book,
      },
    };
  }

  // if ID not found, return fail
  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });
  return response.code(404);
};

// handler for changes the book by ID
const editBookByIdHandler = (request, h) => {
  const { id } = request.params;
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload; // body requested

  const updatedAt = new Date().toISOString();

  const index = books.findIndex((book) => book.id === id);

  if (index !== -1) {
    if (name === undefined) { // check if name empty, then return fail
      const response = h.response({
        status: 'fail',
        message: 'Gagal memperbarui buku. Mohon isi nama buku',
      });
      return response.code(400);
    }
    if (readPage > pageCount) { // check the readPage if above pageCount, return fail
      const response = h.response({
        status: 'fail',
        message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
      });
      return response.code(400);
    }

    const finished = (readPage === pageCount); // books is finished, if readPage equals to pageCount

    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      finished,
      reading,
      updatedAt,
    };

    // return success, if the books edited successfully
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });
    return response.code(200);
  }

  // else, return fail if ID not found
  const response = h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
  });
  return response.code(404);
};

// handler for deleting books
const deleteBookByIdHandler = (request, h) => {
  const { id } = request.params;

  const index = books.findIndex((book) => book.id === id);

  // checking if there's a book, then replace the index
  if (index !== -1) {
    books.splice(index, 1);
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    return response.code(200);
  }

  // return fail if ID not found
  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  return response.code(404);
};

// module exports for handler
module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
