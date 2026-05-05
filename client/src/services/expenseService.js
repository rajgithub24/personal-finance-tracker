import API from "./api";

export const getExpenses = () => API.get("/expenses");

export const addExpense = (data) => API.post("/expenses", data);

export const deleteExpense = (id) => API.delete(`/expenses/${id}`);

export const updateExpense = (id, data) => API.put(`/expenses/${id}`, data);

export const getExpensesByDate = (date) => API.get(`/expenses/date/${date}`);

export const getExpensesByCategory = (category) => API.get(`/expenses/category/${category}`);

export const getFilteredExpenses = (date, category) => API.get(`/expenses`, {params: { date, category }});