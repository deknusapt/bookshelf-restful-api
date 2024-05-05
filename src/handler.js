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

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal ditambahkan',
  });
  return response.code(500);
};

const getAllBooksHandler = (request, h) => {
  const { name, reading, finished } = request.query;

  let keywordBooks = books;

  if (name !== undefined) {
    keywordBooks = keywordBooks.filter((book) => book
      .name.toLowerCase().includes(name.toLowerCase()));
  }
  if (reading !== undefined) {
    keywordBooks = keywordBooks.filter((book) => book.reading === !Number(reading));
  }

  if (finished !== undefined) {
    keywordBooks = keywordBooks.filter((book) => book.finished === !Number(finished));
  }

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

const getAllBooksByIdHandler = (request, h) => {
  const { id } = request.params;

  const book = books.filter((n) => n.id === id)[0];

  if (book !== undefined) {
    return {
      status: 'success',
      data: {
        book,
      },
    };
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });
  return response.code(404);
};

const editBooksByIdHandler = (request, h) => {
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
  } = request.payload;

  const updatedAt = new Date().toISOString;

  const index = books.findIndex((book) => book.id === id);

  if (index !== -1) {
    if (name === undefined) {
      const response = h.response({
        status: 'fail',
        message: 'Gagal memperbarui buku. Mohon isi nama buku',
      });
      return response.code(400);
    }
    if (readPage > pageCount) {
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

    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });
    return response.code(200);
  }

  const response = h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
  });
  return response.code(404);
};

const deleteBooksByIdHandler = (request, h) => {
  const { id } = request.params;

  const index = books.findIndex((book) => book.id === id);

  if (index !== -1) {
    books.splice(index, 1);
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    return response.code(200);
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  return response.code(404);
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getAllBooksByIdHandler,
  editBooksByIdHandler,
  deleteBooksByIdHandler,
};
