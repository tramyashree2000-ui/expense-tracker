const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./expenses.db");

// Create table
db.run(`
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  amount INTEGER,
  category TEXT,
  description TEXT,
  date TEXT,
  created_at TEXT,
  idempotency_key TEXT UNIQUE
)
`);
app.post("/expenses", (req, res) => {
  const key = req.headers["idempotency-key"];

  db.get(
    "SELECT * FROM expenses WHERE idempotency_key = ?",
    [key],
    (err, row) => {
      if (row) return res.json(row);

      const { amount, category, description, date } = req.body;

      const id = uuidv4();
      const created_at = new Date().toISOString();

      db.run(
        `INSERT INTO expenses 
        (id, amount, category, description, date, created_at, idempotency_key)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, amount, category, description, date, created_at, key],
        function () {
          db.get("SELECT * FROM expenses WHERE id = ?", [id], (err, newRow) => {
            res.json(newRow);
          });
        }
      );
    }
  );
});
app.get("/expenses", (req, res) => {
  let query = "SELECT * FROM expenses WHERE 1=1";
  const params = [];

  if (req.query.category) {
    query += " AND category = ?";
    params.push(req.query.category);
  }

  if (req.query.sort === "date_desc") {
    query += " ORDER BY date DESC";
  }

  db.all(query, params, (err, rows) => {
    res.json(rows);
  });
});



app.listen(3000, () => console.log("Server running on port 3000"));