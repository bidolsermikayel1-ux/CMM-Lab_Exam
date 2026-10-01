const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Canteen Menu Manager API is working!"
    });
});

// Get all menu items
app.get("/api/menu", async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM menu_items ORDER BY id DESC"
        );

        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to retrieve menu items."
        });
    }
});

// Get one menu item
app.get("/api/menu/:id", async (req, res) => {
    try {
        const [rows] = await pool.execute(
            "SELECT * FROM menu_items WHERE id = ?",
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Menu item not found."
            });
        }

        res.status(200).json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to retrieve menu item."
        });
    }
});

// Add menu item
app.post("/api/menu", async (req, res) => {
    try {
        const {
            name,
            category,
            price,
            availability,
            description
        } = req.body;

        if (
            !name ||
            !category ||
            price === undefined ||
            availability === undefined
        ) {
            return res.status(400).json({
                message: "Name, category, price, and availability are required."
            });
        }

        if (Number(price) < 0) {
            return res.status(400).json({
                message: "Price cannot be negative."
            });
        }

        const [result] = await pool.execute(
            `INSERT INTO menu_items
            (name, category, price, availability, description)
            VALUES (?, ?, ?, ?, ?)`,
            [
                name.trim(),
                category.trim(),
                Number(price),
                Boolean(availability),
                description ? description.trim() : ""
            ]
        );

        const [rows] = await pool.execute(
            "SELECT * FROM menu_items WHERE id = ?",
            [result.insertId]
        );

        res.status(201).json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to create menu item."
        });
    }
});

// Update menu item
app.put("/api/menu/:id", async (req, res) => {
    try {
        const {
            name,
            category,
            price,
            availability,
            description
        } = req.body;

        if (
            !name ||
            !category ||
            price === undefined ||
            availability === undefined
        ) {
            return res.status(400).json({
                message: "Name, category, price, and availability are required."
            });
        }

        if (Number(price) < 0) {
            return res.status(400).json({
                message: "Price cannot be negative."
            });
        }

        const [result] = await pool.execute(
            `UPDATE menu_items
            SET name = ?,
                category = ?,
                price = ?,
                availability = ?,
                description = ?
            WHERE id = ?`,
            [
                name.trim(),
                category.trim(),
                Number(price),
                Boolean(availability),
                description ? description.trim() : "",
                req.params.id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Menu item not found."
            });
        }

        const [rows] = await pool.execute(
            "SELECT * FROM menu_items WHERE id = ?",
            [req.params.id]
        );

        res.status(200).json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to update menu item."
        });
    }
});

// Delete menu item
app.delete("/api/menu/:id", async (req, res) => {
    try {
        const [result] = await pool.execute(
            "DELETE FROM menu_items WHERE id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Menu item not found."
            });
        }

        res.status(200).json({
            message: "Menu item deleted successfully."
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to delete menu item."
        });
    }
});

app.listen(PORT, async () => {
    try {
        const connection = await pool.getConnection();
        console.log("Database connected successfully.");
        connection.release();
        console.log(`Server running at http://localhost:${PORT}`);
    } catch (error) {
        console.error("Database connection failed:", error.message);
    }
});