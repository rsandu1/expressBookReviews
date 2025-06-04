const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [ 
    {
        "username": "user1",
        "password": "test1"
    },
    {
        "username": "user2",
        "password": "test2"
    }
];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
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
    const username = req.query.username;
    const password = req.query.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign(
            { data: password },
            'access',
            { expiresIn: 60 * 60 }
        );

        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.query.username;
    const book = Object.values(books).find(book => book.isbn === isbn);
    const bookReviews = book.reviews;

    if (!book) {
        res.send(`Book with isbn ${isbn} not found.`);
    } else if (!username || !review) {
        res.send(`Review or user name is missing`);
    } else {
        const userReview = bookReviews.find(review => review.username === username);
        if (userReview) {
            // If user has already reviewed, update the review
            userReview.review = review;
            res.send(`Review updated for user ${username} on book with isbn ${isbn}`);
        } else {
            // If user hasn't reviewed yet, add a new review
            bookReviews.push({ username, review });
            res.send(`Review added for user ${username} on book with isbn ${isbn}`);
        }
    }
});
// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username; // Retrieve username from session
    const book = Object.values(books).find(book => book.isbn === isbn);
    const bookReviews = book.reviews;

    if (!book) {
        res.send(`Book with isbn ${isbn} not found.`);
    } else if (!username) {
        res.send(`User is not authenticated. Please log in.`);
    } else {
        const userReviewIndex = bookReviews.findIndex(review => review.username === username);

        if (userReviewIndex !== -1) {
            // If user has a review, delete the review
            bookReviews.splice(userReviewIndex, 1);
            res.send(`Review deleted for user ${username} on book with isbn ${isbn}`);
        } else {
            // If user doesn't have a review on the book
            res.send(`The user ${username} has no review on book with isbn ${isbn}`);
        }
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
