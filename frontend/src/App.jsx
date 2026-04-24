import { useState, useEffect } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const API = "http://localhost:3000";

export default function App() {
  const [form, setForm] = useState({
    amount: "",
    category: "",
    description: "",
    date: ""
  });

  const [expenses, setExpenses] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchExpenses = async () => {
    try {
      setLoading(true);

      let url = `${API}/expenses?sort=date_desc`;
      if (categoryFilter) {
        url += `&category=${categoryFilter}`;
      }

      const res = await axios.get(url);
      setExpenses(Array.isArray(res.data) ? res.data : [res.data]);
    } catch (err) {
      console.error("Error fetching expenses", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [categoryFilter]);

  const handleSubmit = async () => {
    // ✅ validation
    if (!form.amount || form.amount <= 0) {
      alert("Enter valid amount");
      return;
    }
    if (!form.category || !form.date) {
      alert("Category and date required");
      return;
    }

    try {
      setLoading(true);

      const key = uuidv4();

      await axios.post(
        `${API}/expenses`,
        {
          ...form,
          amount: Number(form.amount) * 100 // ✅ convert to paise
        },
        {
          headers: { "Idempotency-Key": key }
        }
      );

      // ✅ reset form
      setForm({
        amount: "",
        category: "",
        description: "",
        date: ""
      });

      fetchExpenses();
    } catch (err) {
      console.error("Error adding expense", err);
      alert("Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div style={{ padding: 20 }}>
      <h2>Expense Tracker</h2>

      <h3>Add Expense</h3>

      <input
        placeholder="Amount"
        value={form.amount}
        onChange={e =>
          setForm({ ...form, amount: e.target.value })
        }
      />

      <input
        placeholder="Category"
        value={form.category}
        onChange={e =>
          setForm({ ...form, category: e.target.value })
        }
      />

      <input
        placeholder="Description"
        value={form.description}
        onChange={e =>
          setForm({ ...form, description: e.target.value })
        }
      />

      <input
        type="date"
        value={form.date}
        onChange={e =>
          setForm({ ...form, date: e.target.value })
        }
      />

      <br /><br />

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Adding..." : "Add Expense"}
      </button>

      <hr />

      <h3>Filter by Category</h3>
      <input
        placeholder="Category filter"
        value={categoryFilter}
        onChange={e => setCategoryFilter(e.target.value)}
      />

      <h3>Total: ₹{(total / 100).toFixed(2)}</h3>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {expenses.map(e => (
            <li key={e.id}>
              ₹{(e.amount / 100).toFixed(2)} - {e.category} - {e.description} - {e.date}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}