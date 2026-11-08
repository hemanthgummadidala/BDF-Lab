
require("dotenv").config();

const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Connect to SQLite database
const dbPath = path.resolve(
    process.cwd(),
    process.env.DB_PATH || "books.db"
);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Database connection failed:", err.message);
    } else {
        console.log("Connected to SQLite database successfully");
    }
});

// Create books table and insert sample records
db.serialize(() => {

    db.run(`
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            price REAL NOT NULL
        )
    `);

    const insertBook = db.prepare(`
        INSERT OR IGNORE INTO books (id, title, author, price)
        VALUES (?, ?, ?, ?)
    `);

    const books = [
        [1, "Python Basics", "John", 350],
        [2, "Java Programming", "David", 500],
        [3, "C++ Fundamentals", "Smith", 450],
        [4, "React Guide", "Alex", 600],
        [5, "JavaScript Essentials", "Robert", 400]
    ];

    books.forEach((book) => {
        insertBook.run(book);
    });

    insertBook.finalize();

});

module.exports = db;
