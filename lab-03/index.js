
require("dotenv").config();

const express = require("express");
const db = require("./database");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;


// 1. GET all books with search, sorting and filtering
app.get("/books", (req, res) => {

    const {
        search_q = "",
        order_by = "id",
        order = "ASC",
        limit = "10",
        offset = "0",
        min_price,
        max_price
    } = req.query;

    const allowedColumns = ["id", "title", "author", "price"];

    if (!allowedColumns.includes(order_by)) {
        return res.status(400).json({
            message: "Invalid order_by column"
        });
    }

    if (!["ASC", "DESC"].includes(order.toUpperCase())) {
        return res.status(400).json({
            message: "Order must be ASC or DESC"
        });
    }

    const pageLimit = Number(limit);
    const pageOffset = Number(offset);

    if (!Number.isInteger(pageLimit) || pageLimit < 1 ||
        pageLimit > 100 || !Number.isInteger(pageOffset) ||
        pageOffset < 0) {

        return res.status(400).json({
            message: "Invalid limit or offset"
        });
    }

    let sql = "SELECT * FROM books WHERE 1=1";
    const params = [];

    // Search by book title
    if (search_q.trim() !== "") {
        sql += " AND title LIKE ?";
        params.push(`%${search_q}%`);
    }

    // Minimum price filter
    if (min_price !== undefined) {
        const min = Number(min_price);

        if (!Number.isFinite(min) || min < 0) {
            return res.status(400).json({
                message: "Invalid minimum price"
            });
        }

        sql += " AND price >= ?";
        params.push(min);
    }

    // Maximum price filter
    if (max_price !== undefined) {
        const max = Number(max_price);

        if (!Number.isFinite(max) || max < 0) {
            return res.status(400).json({
                message: "Invalid maximum price"
            });
        }

        sql += " AND price <= ?";
        params.push(max);
    }

    if (min_price !== undefined && max_price !== undefined &&
        Number(min_price) > Number(max_price)) {

        return res.status(400).json({
            message: "Minimum price cannot exceed maximum price"
        });
    }

    sql += ` ORDER BY ${order_by} ${order.toUpperCase()} LIMIT ? OFFSET ?`;

    params.push(pageLimit, pageOffset);

    db.all(sql, params, (err, rows) => {

        if (err) {
            return res.status(500).json({
                message: "Error retrieving books"
            });
        }

        res.status(200).json(rows);
    });

});


// 2. GET a single book using ID
app.get("/books/:id", (req, res) => {

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({
            message: "Invalid book ID"
        });
    }

    db.get(
        "SELECT * FROM books WHERE id = ?",
        [id],
        (err, book) => {

            if (err) {
                return res.status(500).json({
                    message: "Error retrieving book"
                });
            }

            if (!book) {
                return res.status(404).json({
                    message: "Book not found"
                });
            }

            res.status(200).json(book);
        }
    );

});


// 3. POST - Add a new book
app.post("/books", (req, res) => {

    const { title, author, price } = req.body;

    if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
            message: "Title is required"
        });
    }

    if (typeof author !== "string" || !author.trim()) {
        return res.status(400).json({
            message: "Author is required"
        });
    }

    if (price === undefined || price === null ||
        price === "" || typeof price !== "number" ||
        !Number.isFinite(price) || price < 0) {

        return res.status(400).json({
            message: "Price must be a valid non-negative number"
        });
    }

    db.run(
        "INSERT INTO books (title, author, price) VALUES (?, ?, ?)",
        [title.trim(), author.trim(), price],
        function (err) {

            if (err) {
                return res.status(500).json({
                    message: "Error adding book"
                });
            }

            res.status(201).json({
                message: "Book added successfully",
                id: this.lastID
            });
        }
    );

});


// 4. PUT - Update a book
app.put("/books/:id", (req, res) => {

    const id = Number(req.params.id);

    const { title, author, price } = req.body;

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({
            message: "Invalid book ID"
        });
    }

    if (typeof title !== "string" || !title.trim() ||
        typeof author !== "string" || !author.trim() ||
        typeof price !== "number" || !Number.isFinite(price) ||
        price < 0) {

        return res.status(400).json({
            message: "Valid title, author and price are required"
        });
    }

    db.run(
        "UPDATE books SET title = ?, author = ?, price = ? WHERE id = ?",
        [title.trim(), author.trim(), price, id],
        function (err) {

            if (err) {
                return res.status(500).json({
                    message: "Error updating book"
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    message: "Book not found"
                });
            }

            res.status(200).json({
                message: "Book updated successfully"
            });
        }
    );

});


// 5. DELETE - Delete a book
app.delete("/books/:id", (req, res) => {

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({
            message: "Invalid book ID"
        });
    }

    db.run(
        "DELETE FROM books WHERE id = ?",
        [id],
        function (err) {

            if (err) {
                return res.status(500).json({
                    message: "Error deleting book"
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    message: "Book not found"
                });
            }

            res.status(200).json({
                message: "Book deleted successfully"
            });
        }
    );

});


// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
