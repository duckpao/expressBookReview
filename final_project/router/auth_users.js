const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Hàm kiểm tra xem username đã tồn tại trong hệ thống chưa
const isValid = (username) => {
    let usersWithSameName = users.filter((user) => user.username === username);
    return usersWithSameName.length > 0;
}

// Hàm kiểm tra username và password có khớp với dữ liệu đăng ký không
const authenticatedUser = (username, password) => {
    let validUsers = users.filter((user) => (user.username === username && user.password === password));
    return validUsers.length > 0;
}

// Task 8: Login - Chỉ những user đã đăng ký mới được phép đăng nhập
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in. Missing username or password" });
    }

    if (authenticatedUser(username, password)) {
        // Tạo JWT Token có thời hạn 1 giờ
        let accessToken = jwt.sign({ data: username }, 'access', { expiresIn: 60 * 60 });
        
        // Lưu token vào session (cần cấu hình express-session ở file index.js)
        req.session.authorization = { accessToken, username };
        
        return res.status(200).json({ message: "Customer successfully logged in" });
    } else {
        return res.status(401).json({ message: "Invalid Login. Check username and password" });
    }
});

// Task 9: Thêm hoặc Cập nhật đánh giá sách
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.body.review;
    
    // Lấy username từ session (đã được lưu khi login)
    const username = req.session.authorization.username;

    if (books[isbn]) {
        // Gán hoặc cập nhật đánh giá bằng tên của user
        books[isbn].reviews[username] = review;
        return res.status(200).send(`The review for the book with ISBN ${isbn} has been added/updated.`);
    } else {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }
});

// Task 10: Xóa đánh giá sách
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;

    if (books[isbn]) {
        if (books[isbn].reviews[username]) {
            delete books[isbn].reviews[username];
            return res.status(200).send(`Reviews for the ISBN ${isbn} posted by the user ${username} deleted.`);
        } else {
            return res.status(404).json({ message: "Review not found for this user." });
        }
    } else {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;