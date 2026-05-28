const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Task 7: Đăng ký User mới
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (!isValid(username)) {
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "Customer successfully registered. Now you can login" });
        } else {
            return res.status(409).json({ message: "User already exists!" });
        }
    }
    return res.status(400).json({ message: "Unable to register user. Username or password not provided." });
});

// Task 1: Lấy toàn bộ danh sách sách (Đồng bộ)
public_users.get('/', function (req, res) {
    return res.status(200).send(JSON.stringify({ books: books }, null, 4));
});

// Task 2: Lấy sách theo ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).json(books[isbn]);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

// Task 3: Lấy sách theo Tác giả
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    let booksbyauthor = [];
    
    // Duyệt qua tất cả các key trong object books
    for (const isbn in books) {
        if (books[isbn].author === author) {
            // Định dạng lại kết quả trả về cho giống mẫu chấm điểm
            booksbyauthor.push({
                "isbn": isbn,
                "title": books[isbn].title,
                "reviews": books[isbn].reviews
            });
        }
    }
    
    if (booksbyauthor.length > 0) {
        return res.status(200).json({ booksbyauthor: booksbyauthor });
    } else {
        return res.status(404).json({ message: "No books found by this author" });
    }
});

// Task 4: Lấy sách theo Tiêu đề
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    let booksbytitle = [];
    
    for (const isbn in books) {
        if (books[isbn].title === title) {
            booksbytitle.push({
                "isbn": isbn,
                "author": books[isbn].author,
                "reviews": books[isbn].reviews
            });
        }
    }
    
    if (booksbytitle.length > 0) {
        return res.status(200).json({ booksbytitle: booksbytitle });
    } else {
        return res.status(404).json({ message: "No books found with this title" });
    }
});

// Task 5: Lấy Đánh giá của một cuốn sách
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).json(books[isbn].reviews);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});


/* -----------------------------------------------------------
   PHẦN BỔ SUNG CHO TASK 11-14 (SỬ DỤNG ASYNC/PROMISE LÀM MINH CHỨNG)
   (Bạn giữ nguyên phần này trong code để push lên GitHub)
----------------------------------------------------------- */
/* -----------------------------------------------------------
   PHẦN AXIOS / ASYNC-AWAIT (TASK 11 - 14)
----------------------------------------------------------- */
const axios = require('axios');

// Task 11: Get all books using async/await
public_users.get('/async-get-books', async function (req, res) {
    try {
        let response = await axios.get('http://localhost:5000/');
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({message: "Error fetching books"});
    }
});

// Task 12: Get book details based on ISBN using Promises
public_users.get('/promise-get-isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    axios.get(`http://localhost:5000/isbn/${isbn}`)
        .then(response => {
            return res.status(200).json(response.data);
        })
        .catch(error => {
            return res.status(500).json({message: "Error fetching book details"});
        });
});

// Task 13: Get book details based on Author using async/await
public_users.get('/async-get-author/:author', async function (req, res) {
    try {
        const author = req.params.author;
        let response = await axios.get(`http://localhost:5000/author/${author}`);
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({message: "Error fetching book details by author"});
    }
});

// Task 14: Get book details based on Title using Promises
public_users.get('/promise-get-title/:title', function (req, res) {
    const title = req.params.title;
    axios.get(`http://localhost:5000/title/${title}`)
        .then(response => {
            return res.status(200).json(response.data);
        })
        .catch(error => {
            return res.status(500).json({message: "Error fetching book details by title"});
        });
});
module.exports.general = public_users;