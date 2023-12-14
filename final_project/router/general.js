const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registred." });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  let isbn = req.params.isbn
  if (isbn) {
    if (books[isbn])
      return res.status(200).json(books[isbn]);
    else
      return res.status(404).json({ message: "Book with ISBN " + isbn + " not found." });
  }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  let author = req.params.author
  if (author) {
    let booksList = Object.values(books).filter((book) => {
      return book.author === author
    })
    if (booksList.length > 0)
      return res.status(200).json(booksList);
  }
  return res.status(404).json({ message: "Book with author " + author + " not found." });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  let title = req.params.title
  if (title) {
    let booksList = Object.values(books).filter((book) => {
      return book.title === title
    })
    if (booksList.length > 0)
      return res.status(200).json(booksList);
  }
  return res.status(404).json({ message: "Book with title " + title + " not found." });
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  let isbn = req.params.isbn
  if (isbn) {
    if (books[isbn])
      return res.status(200).json(books[isbn].reviews);
    else
      return res.status(404).json({ message: "Book with ISBN " + isbn + " not found." });
  }
});

module.exports.general = public_users;
