
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 3000;

// Middleware to read JSON data
app.use(express.json());

// JWT secret key
const JWT_SECRET = "my_lab4_secret_key";

// Connect to SQLite database
const db = new sqlite3.Database("./users.db", (err) => {
    if (err) {
        console.log("Database connection failed:", err.message);
    } else {
        console.log("Connected to SQLite database");
    }
});

// Create users table
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password TEXT NOT NULL
    )
`, (err) => {
    if (err) {
        console.log("Table creation failed:", err.message);
    } else {
        console.log("Users table created successfully");
    }
});

 // User Registration API
app.post("/register", (req, res) => {
    const { username, name, password } = req.body;

    // Check for empty fields
    if (!username || !name || !password) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    // Check whether username already exists
    db.get(
        "SELECT * FROM users WHERE username = ?",
        [username],
        async (err, user) => {
            if (err) {
                return res.status(500).json({
                    message: "Database error"
                });
            }

            if (user) {
                return res.status(400).json({
                    message: "Username already exists"
                });
            }

            try {
                // Hash the password
                const hashedPassword = await bcrypt.hash(password, 10);

                // Insert user into database
                db.run(
                    "INSERT INTO users (username, name, password) VALUES (?, ?, ?)",
                    [username, name, hashedPassword],
                    function (err) {
                        if (err) {
                            return res.status(500).json({
                                message: "Registration failed"
                            });
                        }

                        res.status(201).json({
                            message: "User registered successfully"
                        });
                    }
                );
            } catch (error) {
                res.status(500).json({
                    message: "Password hashing failed"
                });
            }
        }
    );
});

 // User Login API
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Check for empty fields
    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }

    // Find user in database
    db.get(
        "SELECT * FROM users WHERE username = ?",
        [username],
        async (err, user) => {
            if (err) {
                return res.status(500).json({
                    message: "Database error"
                });
            }

            // Check whether user exists
            if (!user) {
                return res.status(400).json({
                    message: "Invalid username"
                });
            }

            try {
                // Compare entered password with hashed password
                const isPasswordCorrect = await bcrypt.compare(
                    password,
                    user.password
                );

                if (!isPasswordCorrect) {
                    return res.status(400).json({
                        message: "Invalid password"
                    });
                }

                // Generate JWT token
                const token = jwt.sign(
                    { username: user.username },
                    JWT_SECRET,
                    { expiresIn: "1h" }
                );

                // Return JWT token
                res.status(200).json({
                    jwt_token: token
                });

            } catch (error) {
                res.status(500).json({
                    message: "Login failed"
                });
            }
        }
    );
});



// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

