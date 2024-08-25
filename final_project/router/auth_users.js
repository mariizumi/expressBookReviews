const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  let duplicates = users.filter((user => {
    return user.username === username;
  }));

  return duplicates.length == 0;
}

const authenticatedUser = (username,password) => {
  let validUsers = users.filter((user) => {
    return (user.username === username && user.password === password);
  });

  return validUsers.length > 0;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in!" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authenticated = {
      accessToken, username
    }

    return res.status(200).send("User successfully logged in.");
  } else {
    return res.status(208).json({ message: "Invalid login. Check username and password." });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  // get review text
  const reviewText = req.body.review;

  // get username
  const username = req.session.authenticated.username;

  // get book from ISBN
  const book = books[req.params.isbn];

  if (!book) {
    return res.status(404).send("Book with that ISBN does not exist.");
  }

  // check if user has posted review on book before
  if (username in book.reviews) {
    // modify review instead of posting new one
    book.reviews[username] = reviewText;
    return res.status(200).send("Review successfully updated.");
  } else {
    // post new review
    book.reviews[username] = reviewText;
    return res.status(200).send("Review successfully posted.");
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const username = req.session.authenticated.username;
  const book = books[req.params.isbn];

  if (book) {
    delete book.reviews[username];
    return res.status(200).send("Review successfully deleted.");
  } else {
    return res.status(404).send("Could not delete as review does not exist.");
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
