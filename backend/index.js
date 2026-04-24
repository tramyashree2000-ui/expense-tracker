const express = require("express");
const Database = require("better-sqlite3");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = new Database("expenses.db");

// Create table
db.prepare(`
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  amount INTEGER,
  category TEXT,
  description TEXT,
  date TEXT,
  created_at TEXT,
  idempotency_key TEXT UNIQUE
)
`).run();

app.post("/expenses", (req, res) => {
  const key = req.headers["idempotency-key"];

  const existing = db
    .prepare("SELECT * FROM expenses WHERE idempotency_key = ?")
    .get(key);

  if (existing) return res.json(existing);

  const { amount, category, description, date } = req.body;

  const id = uuidv4();
  const created_at = new Date().toISOString();

  db.prepare(`
    INSERT INTO expenses 
    (id, amount, category, description, date, created_at, idempotency_key)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, amount, category, description, date, created_at, key);

  const expense = db
    .prepare("SELECT * FROM expenses WHERE id = ?")
    .get(id);

  res.json(expense);
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

  const expenses = db.prepare(query).all(...params);

  res.json(expenses);
});



app.listen(3000, () => console.log("Server running on port 3000"));