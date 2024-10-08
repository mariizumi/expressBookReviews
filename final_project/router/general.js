const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (isValid(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registered. You may now login." });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user!" });
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  res.send(books[req.params.isbn]);
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  res.send(Object.values(books).filter(book => req.params.author === book.author));
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  res.send(Object.values(books).filter(book => req.params.title === book.title));
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  return res.send(books[req.params.isbn].reviews);
});

module.exports.general = public_users;
