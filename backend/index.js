const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(express.json());

let expenses = [];
let idempotencyStore = {};

// ✅ POST (idempotent)
app.post("/expenses", (req, res) => {
  const key = req.headers["idempotency-key"];

  if (key && idempotencyStore[key]) {
    return res.json(idempotencyStore[key]);
  }

  const { amount, category, description, date } = req.body;

  const expense = {
    id: uuidv4(),
    amount,
    category,
    description,
    date,
    created_at: new Date().toISOString()
  };

  expenses.push(expense);

  if (key) {
    idempotencyStore[key] = expense;
  }

  res.json(expense);
});

// ✅ GET with filter + sort
app.get("/expenses", (req, res) => {
  let result = [...expenses];

  if (req.query.category) {
    result = result.filter(e => e.category === req.query.category);
  }

  if (req.query.sort === "date_desc") {
    result.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  res.json(result);
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});