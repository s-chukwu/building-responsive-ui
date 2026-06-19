// state.js
// Central state for ISUSU. Ties storage and business logic together.

import * as Storage from "./storage.js";

let transactions = [];
let categories = [];
let settings = {};
let capAmount = 300000; // default cap in RWF

let idCounter = Date.now() % 100000;
function makeId() {
  idCounter++;
  return "rec_" + idCounter;
}

export function init() {
  transactions = Storage.loadTransactions();
  categories = Storage.loadCategories();
  const saved = Storage.loadSettings();
  settings = {
    rates: { NGN: 0.93, USD: 0.00068 },
    cap: 300000,
    darkMode: false,
    ...saved
  };
  capAmount = settings.cap || 300000;
}

export function getTransactions() { return transactions; }
export function getCategories() { return categories; }
export function getSettings() { return settings; }

export function getCap() { return capAmount; }

export function setCap(value) {
  capAmount = value;
  settings.cap = value;
  Storage.saveSettings(settings);
}

export function getRate(currency) {
  return settings.rates ? (settings.rates[currency] || 1) : 1;
}

export function setRate(currency, value) {
  if (!settings.rates) settings.rates = {};
  settings.rates[currency] = value;
  Storage.saveSettings(settings);
}

export function setDarkMode(on) {
  settings.darkMode = on;
  Storage.saveSettings(settings);
}

export function addTransaction(record) {
  const now = new Date().toISOString();
  const tx = {
    id: makeId(),
    description: record.description.trim(),
    amount: parseFloat(record.amount),
    category: record.category,
    date: record.date,
    createdAt: now,
    updatedAt: now
  };
  transactions.unshift(tx);
  Storage.saveTransactions(transactions);
  return tx;
}

export function updateTransaction(id, updates) {
  const tx = transactions.find(function(t) { return t.id === id; });
  if (!tx) return null;
  tx.description = updates.description.trim();
  tx.amount = parseFloat(updates.amount);
  tx.category = updates.category;
  tx.date = updates.date;
  tx.updatedAt = new Date().toISOString();
  Storage.saveTransactions(transactions);
  return tx;
}

export function deleteTransaction(id) {
  const idx = transactions.findIndex(function(t) { return t.id === id; });
  if (idx === -1) return false;
  transactions.splice(idx, 1);
  Storage.saveTransactions(transactions);
  return true;
}

export function addCategory(name) {
  const trimmed = name.trim();
  if (!trimmed) return false;
  if (categories.includes(trimmed)) return false;
  categories.push(trimmed);
  Storage.saveCategories(categories);
  return true;
}

export function removeCategory(name) {
  const idx = categories.indexOf(name);
  if (idx === -1) return false;
  categories.splice(idx, 1);
  Storage.saveCategories(categories);
  return true;
}

export function getStats() {
  const total = transactions.length;
  const sumRWF = transactions.reduce(function(acc, t) { return acc + t.amount; }, 0);
  const sumNGN = sumRWF * getRate("NGN");
  const sumUSD = sumRWF * getRate("USD");

  const catMap = {};
  transactions.forEach(function(t) {
    catMap[t.category] = (catMap[t.category] || 0) + t.amount;
  });
  var topCat = "N/A";
  var topCatTotal = 0;
  for (var cat in catMap) {
    if (catMap[cat] > topCatTotal) {
      topCat = cat;
      topCatTotal = catMap[cat];
    }
  }

  const today = new Date();
  var days = [];
  for (var i = 6; i >= 0; i--) {
    var d = new Date(today);
    d.setDate(d.getDate() - i);
    var key = d.toISOString().slice(0, 10);
    var dayTotal = transactions
      .filter(function(t) { return t.date === key; })
      .reduce(function(acc, t) { return acc + t.amount; }, 0);
    days.push({ date: key, label: d.toLocaleDateString("en-US", { weekday: "short" }), total: dayTotal });
  }

  var remaining = capAmount - sumRWF;
  var overCap = sumRWF > capAmount;

  return {
    total: total,
    sumRWF: sumRWF,
    sumNGN: sumNGN,
    sumUSD: sumUSD,
    topCat: topCat,
    topCatTotal: topCatTotal,
    days: days,
    cap: capAmount,
    remaining: remaining,
    overCap: overCap
  };
}

export function importAll(data) {
  transactions = data.transactions;
  Storage.saveTransactions(transactions);
  if (data.categories && Array.isArray(data.categories)) {
    categories = data.categories;
    Storage.saveCategories(categories);
  }
  if (data.settings && typeof data.settings === "object") {
    settings = data.settings;
    capAmount = settings.cap || 300000;
    Storage.saveSettings(settings);
  }
}

export function resetAll() {
  transactions = getDefaultSeed();
  categories = ["Food", "Books", "Transport", "Entertainment", "Fees", "Other"];
  settings = { rates: { NGN: 0.93, USD: 0.00068 }, cap: 300000, darkMode: settings.darkMode || false };
  capAmount = 300000;
  Storage.saveTransactions(transactions);
  Storage.saveCategories(categories);
  Storage.saveSettings(settings);
}

function getDefaultSeed() {
  var ref = new Date();
  var d = function(offset) {
    var dt = new Date(ref);
    dt.setDate(dt.getDate() - offset);
    return dt.toISOString().slice(0, 10);
  };
  idCounter = 1000;
  return [
    { id: "rec_1001", description: "Lunch at cafeteria", amount: 2500, category: "Food", date: d(0), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "rec_1002", description: "Data bundles for the week", amount: 3000, category: "Other", date: d(0), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "rec_1003", description: "Kigali bus fare round trip", amount: 1500, category: "Transport", date: d(1), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "rec_1004", description: "Printing lecture slides", amount: 800, category: "Fees", date: d(2), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "rec_1005", description: "Movie night with roommates", amount: 5000, category: "Entertainment", date: d(3), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "rec_1006", description: "Course textbook Statistics", amount: 18000, category: "Books", date: d(5), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "rec_1007", description: "Coffee at campus cafe", amount: 1200, category: "Food", date: d(6), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ];
}
