const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username)=>{
    let userswithsamename = users.filter((user)=>{
      return user.username === username
    });
    if(userswithsamename.length > 0){
      return true;
    } else {
      return false;
    }
}

public_users.post("/register", (req, res) => {
    const username = req.query.username;
    const password = req.query.password;
  
    if (username && password) {
      if (!doesExist(username)) { 
        users.push({"username":username,"password":password});
        return res.status(200).json({message: "User successfully registred. Now you can login"});
      } else {
        return res.status(404).json({message: "User already exists!"});    
      }
    } 
    return res.status(404).json({message: "Unable to register user. Username and/or password not provided"});
});

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
    try {
        // Simulate async call to get books
        const getBooks = () => Promise.resolve(books);
        const allBooks = await getBooks();
        res.status(200).send(JSON.stringify({ books: allBooks }, null, 4));
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve books", error: error.message });
    }
});

// Get the user list available in the shop
public_users.get('/users', function (req, res) {
    res.send(JSON.stringify({ users }, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
        const getBookByISBN = (isbn) => {
            return new Promise((resolve, reject) => {
                const book = Object.values(books).find(book => book.isbn === isbn);
                if (book) {
                    resolve(book);
                } else {
                    reject(`Book with ISBN ${isbn} not found.`);
                }
            });
        };
        const book = await getBookByISBN(isbn);
        res.status(200).send(JSON.stringify(book, null, 4));
    } catch (error) {
        res.status(404).send(error);
    }
}); 

// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author;
    try {
        const getBookByAuthor = (author) => {
            return new Promise((resolve, reject) => {
                const book = Object.values(books).find(book => book.author === author);
                if (book) {
                    resolve(book);
                } else {
                    reject(`Book with author name ${author} not found.`);
                }
            });
        };
        const book = await getBookByAuthor(author);
        res.status(200).send(JSON.stringify(book, null, 4));
    } catch (error) {
        res.status(404).send(error);
    }
});

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title;
    try {
        const getBookByTitle = (title) => {
            return new Promise((resolve, reject) => {
                const book = Object.values(books).find(book => book.title === title);
                if (book) {
                    resolve(book);
                } else {
                    reject(`Book with title ${title} not found.`);
                }
            });
        };
        const book = await getBookByTitle(title);
        res.status(200).send(JSON.stringify(book, null, 4));
    } catch (error) {
        res.status(404).send(error);
    }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = Object.values(books).find(book => book.isbn === isbn);
    const review = book.reviews;
    if (book) {
        res.send(JSON.stringify(review, null, 4));
    } else {
        res.send(`Book with ISBN ${isbn} not found.`);
    }
});

module.exports.general = public_users;
