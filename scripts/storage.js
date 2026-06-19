// storage.js
// Reads and writes to localStorage.
// Keys: isusu_transactions, isusu_categories, isusu_settings.

var KEYS = {
  transactions: "isusu_transactions",
  categories: "isusu_categories",
  settings: "isusu_settings"
};

export function loadTransactions() {
  try {
    var raw = localStorage.getItem(KEYS.transactions);
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
}

export function saveTransactions(list) {
  localStorage.setItem(KEYS.transactions, JSON.stringify(list));
}

export function loadCategories() {
  try {
    var raw = localStorage.getItem(KEYS.categories);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return ["Food", "Books", "Transport", "Entertainment", "Fees", "Other"];
}

export function saveCategories(list) {
  localStorage.setItem(KEYS.categories, JSON.stringify(list));
}

export function loadSettings() {
  try {
    var raw = localStorage.getItem(KEYS.settings);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

export function saveSettings(obj) {
  localStorage.setItem(KEYS.settings, JSON.stringify(obj));
}

export function exportAll(transactions, categories, settings) {
  return {
    exportedAt: new Date().toISOString(),
    transactions: transactions,
    categories: categories,
    settings: settings
  };
}

export function validateImport(data) {
  if (!data || typeof data !== "object") return "File is not valid JSON.";
  if (!Array.isArray(data.transactions)) return "Missing or invalid transactions array.";

  for (var i = 0; i < data.transactions.length; i++) {
    var t = data.transactions[i];
    if (!t.id || typeof t.id !== "string") return "Transaction " + (i + 1) + " is missing a valid id.";
    if (!t.description || typeof t.description !== "string") return "Transaction " + (i + 1) + " is missing a description.";
    if (typeof t.amount !== "number" || isNaN(t.amount)) return "Transaction " + (i + 1) + " has an invalid amount.";
    if (!t.category || typeof t.category !== "string") return "Transaction " + (i + 1) + " is missing a category.";
    if (!t.date || typeof t.date !== "string") return "Transaction " + (i + 1) + " is missing a date.";
  }

  if (data.categories && !Array.isArray(data.categories)) return "Categories is not an array.";
  if (data.settings && typeof data.settings !== "object") return "Settings is not an object.";

  return null;
}
