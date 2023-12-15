const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
  let userswithsamename = users.filter((user) => {
    return user.username === username
  });
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username, password) => { //returns boolean
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password)
  });
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken, username
    }
    return res.status(200).json({ message: "User successfully logged in" });
  } else {
    return res.status(404).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  let review = req.query.review;
  let isbn = req.params.isbn;

  if (!books[isbn]) return res.status(404).json({ message: "Book with ISBN " + isbn + " not found." });

  let newReview = { user: req.session.authorization.username, review: review };

  if (review) {
    if (!Array.isArray(books[isbn].reviews)) books[isbn].reviews = [];

    const existingReviewIndex = books[isbn].reviews.findIndex(existingReview => existingReview.user === newReview.user);

    if (existingReviewIndex !== -1)
      books[isbn].reviews[existingReviewIndex] = newReview;
    else
      books[isbn].reviews.push(newReview);

    return res.status(200).json({ message: "Review successfully added." });
  } else {
    return res.status(400).json({ message: "Review is required." });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  let isbn = req.params.isbn;

  if (!books[isbn]) return res.status(404).json({ message: "Book with ISBN " + isbn + " not found." });

  if (!Array.isArray(books[isbn].reviews)) {
    return res.status(404).json({ message: "There are no reviews for this book to delete." });
  }

  const existingReviewIndex = books[isbn].reviews.findIndex(existingReview => existingReview.user === req.session.authorization.username);

  if (existingReviewIndex !== -1) {
    books[isbn].reviews.splice(existingReviewIndex, 1)
    return res.status(200).json({ message: "Your review for this book was successfully deleted." });
  }
  else return res.status(404).json({ message: "Your review for this book was not found." });

});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
