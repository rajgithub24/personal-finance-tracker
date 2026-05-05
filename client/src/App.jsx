import { useEffect, useState } from "react";
import { getExpenses, addExpense, deleteExpense, updateExpense, getExpensesByDate, getExpensesByCategory, getFilteredExpenses } from "./services/expenseService";
import ExpenseChart from "./components/ExpenseChart";

const ButtonLabel = ({ loading, children }) => (
  <span className="btn-content">
    {loading && <span className="btn-spinner" aria-hidden="true" />}
    <span>{children}</span>
  </span>
);

function App() {
  const [expenses, setExpenses] = useState([]);
  const [editId, setEditId] = useState(null);
  const [filterDate, setFilterDate] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [allExpenses, setAllExpenses] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [filterAction, setFilterAction] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    date: "",
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setIsFetching(true);
    try {
      const response = await getExpenses();
      const list = response.data || [];
      setAllExpenses(list);
      setExpenses(list);
      return list;
    } catch (error) {
      console.error("Error fetching expenses:", error);
      return [];
    } finally {
      setIsFetching(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editId) {
        await updateExpense(editId, formData);
      } else {
        await addExpense(formData);
      }

      await fetchExpenses();
      setEditId(null);
      setFormData({ title: "", amount: "", category: "", date: "" });
    } catch (error) {
      console.error("Error saving expense:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteExpense(id);
      await fetchExpenses();
    } catch (error) {
      console.error("Error deleting expense:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (exp) => {
    setFormData({
      title: exp.title || "",
      amount: exp.amount || "",
      category: exp.category || "",
      date: exp.date || "",
    });
    setEditId(exp.id);
  };

  const handleFilterByDate = async () => {
    setFilterAction("date");
    try {
      if (filterFrom && filterTo) {
        const from = new Date(filterFrom);
        const to = new Date(filterTo);
        const filtered = allExpenses.filter((e) => {
          const d = new Date(e.date);
          return d >= from && d <= to;
        });
        setExpenses(filtered);
        return;
      }

      if (filterFrom) {
        const res = await getExpensesByDate(filterFrom);
        setExpenses(res.data || []);
        return;
      }

      await fetchExpenses();
    } catch (error) {
      console.error("Error filtering:", error);
    } finally {
      setFilterAction(null);
    }
  };

  const handleReset = async () => {
    setFilterAction("reset");
    setFilterDate("");
    setFilterCategory("");
    setFilterFrom("");
    setFilterTo("");
    await fetchExpenses();
    setFilterAction(null);
  };

  const handleFilterByCategory = async () => {
    setFilterAction("category");
    try {
      if (!filterCategory) {
        await fetchExpenses();
        return;
      }

      const filtered = allExpenses.filter((e) => (e.category || "").toLowerCase() === filterCategory.toLowerCase());
      if (filtered.length) {
        setExpenses(filtered);
        return;
      }

      const res = await getExpensesByCategory(filterCategory);
      setExpenses(res.data || []);
    } catch (error) {
      console.error("Error filtering by category:", error);
    } finally {
      setFilterAction(null);
    }
  };

  const handleApplyFilters = async () => {
    setFilterAction("apply");
    try {
      let filtered = allExpenses;
      if (filterFrom) {
        const from = new Date(filterFrom);
        filtered = filtered.filter((e) => new Date(e.date) >= from);
      }
      if (filterTo) {
        const to = new Date(filterTo);
        filtered = filtered.filter((e) => new Date(e.date) <= to);
      }
      if (filterCategory) {
        filtered = filtered.filter((e) => (e.category || "").toLowerCase().includes(filterCategory.toLowerCase()));
      }

      setExpenses(filtered);
    } catch (error) {
      console.error("Error applying filters:", error);
    } finally {
      setFilterAction(null);
    }
  };

  const totalSpent = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const last30 = (() => {
    const now = new Date();
    const cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    return expenses
      .filter((e) => new Date(e.date) >= cutoff)
      .reduce((s, e) => s + Number(e.amount || 0), 0);
  })();

  return (
    <div className="app-root">
      <header className="topbar">
        <div className="brand">
          <h1 className="brand-title">Personal Finance Tracker</h1>
        </div>
        <div className="profile">
          <div className="avatar">RJ</div>
        </div>
      </header>

      <main className="dashboard">
        <section className="left-panel">
          <div className="card form-card fade-up">
            <h2>{editId ? "Edit Expense" : "Add Expense"}</h2>
            <form className="expense-form" onSubmit={handleSubmit}>
              <div className="row">
                <input name="title" type="text" placeholder="Title" value={formData.title} onChange={handleChange} required />
                <input name="amount" type="number" placeholder="Amount (₹)" value={formData.amount} onChange={handleChange} required />
              </div>

              <div className="row">
                <input name="category" type="text" placeholder="Category (e.g. Food)" value={formData.category} onChange={handleChange} required />
                <input name="date" type="date" value={formData.date} onChange={handleChange} required />
              </div>

              <div className="actions">
                <button type="submit" className="btn primary" disabled={isSaving}>
                  <ButtonLabel loading={isSaving}>{isSaving ? (editId ? "Updating" : "Adding") : (editId ? "Update" : "Add")}</ButtonLabel>
                </button>
                <button type="button" className="btn ghost" disabled={isSaving} onClick={() => { setFormData({ title: "", amount: "", category: "", date: "" }); setEditId(null); }}>Clear</button>
              </div>
            </form>
          </div>

          <div className="card filter-card fade-up">
            <h3>Filters</h3>
            <div className="filters">
              <div className="filter-row">
                <label className="input-icon">
                  <span className="icon">📅</span>
                  <input className="date-input" type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} placeholder="From" />
                </label>

                <label className="input-icon">
                  <span className="icon">📆</span>
                  <input className="date-input" type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} placeholder="To" />
                </label>

                <div className="filter-actions">
                  <button className="btn outline" disabled={filterAction === "date"} onClick={handleFilterByDate}>
                    <ButtonLabel loading={filterAction === "date"}>Apply Date</ButtonLabel>
                  </button>
                  <button className="btn outline" disabled={filterAction === "reset"} onClick={handleReset}>
                    <ButtonLabel loading={filterAction === "reset"}>Clear</ButtonLabel>
                  </button>
                </div>
              </div>

              <div className="filter-row">
                <label className="input-icon" style={{flex:1}}>
                  <span className="icon">🏷️</span>
                  <input list="categories" className="category-input" type="text" placeholder="Category (pick or type)" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} />
                  <datalist id="categories">
                    {Array.from(new Set(allExpenses.map((e) => e.category).filter(Boolean))).map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </label>

                <div className="filter-actions">
                  <button className="btn outline" disabled={filterAction === "category"} onClick={handleFilterByCategory}>
                    <ButtonLabel loading={filterAction === "category"}>By Category</ButtonLabel>
                  </button>
                  <button className="btn primary" disabled={filterAction === "apply"} onClick={handleApplyFilters}>
                    <ButtonLabel loading={filterAction === "apply"}>Apply</ButtonLabel>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="card list-card fade-up">
            <h3>Recent Expenses</h3>
            <div className="expense-list">
              {isFetching && expenses.length === 0 && <div className="empty">Loading expenses...</div>}
              {!isFetching && expenses.length === 0 && <div className="empty">No expenses yet</div>}
              {expenses.map((exp) => (
                <div key={exp.id} className="expense-item">
                  <div className="meta">
                    <div className="title">{exp.title}</div>
                    <div className="category">{exp.category}</div>
                  </div>
                  <div className="right">
                    <div className="amount">₹{exp.amount}</div>
                    <div className="date">{exp.date}</div>
                    <div className="controls">
                      <button className="btn small ghost" disabled={deletingId === exp.id} onClick={() => handleEdit(exp)}>Edit</button>
                      <button className="btn small danger" disabled={deletingId === exp.id} onClick={() => handleDelete(exp.id)}>
                        <ButtonLabel loading={deletingId === exp.id}>Delete</ButtonLabel>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="right-panel">
          <div className="stats-row">
            <div className="stat-card fade-up">
              <div className="label">Total Spent</div>
              <div className="value">₹{totalSpent.toFixed(2)}</div>
            </div>

            <div className="stat-card fade-up">
              <div className="label">Last 30 days</div>
              <div className="value">₹{last30.toFixed(2)}</div>
            </div>
          </div>

          <div className="card chart-card fade-up">
            <h3>Spending by Category</h3>
            <ExpenseChart expenses={expenses} />
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
