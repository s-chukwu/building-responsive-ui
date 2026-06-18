// app.js
// Entry point for ISUSU. Wires navigation, form handling, search, sort,
// dark mode, cap, import/export, and delete operations.

import * as State from "./state.js";
import * as Storage from "./storage.js";
import * as Validators from "./validators.js";
import * as Search from "./search.js";
import * as UI from "./ui.js";

var currentSort = "date-desc";
var currentRegex = null;
var currentCurrency = "RWF";

function main() {
  State.init();
  applyDarkMode();
  renderAll();
  attachNavEvents();
  attachFormEvents();
  attachRecordsEvents();
  attachSettingsEvents();
  var dateEl = document.getElementById("date-input");
  if (dateEl) dateEl.value = new Date().toISOString().slice(0, 10);
}

function applyDarkMode() {
  var html = document.documentElement;
  var toggle = document.getElementById("theme-toggle");
  var icon = toggle ? toggle.querySelector(".theme-icon") : null;
  if (State.getSettings().darkMode) {
    html.classList.remove("light");
    html.classList.add("dark");
    if (icon) icon.innerHTML = "&#9788;";
    if (toggle) toggle.setAttribute("aria-label", "Switch to light mode");
  } else {
    html.classList.add("light");
    html.classList.remove("dark");
    if (icon) icon.innerHTML = "&#9789;";
    if (toggle) toggle.setAttribute("aria-label", "Switch to dark mode");
  }
}

function renderAll() {
  var stats = State.getStats();
  UI.renderStats(stats, currentCurrency);
  UI.renderCap(stats);
  UI.renderChart(stats.days);
  UI.renderTopCategory(stats);
  renderRecordsView();
  UI.renderCategoryOptions(State.getCategories());
  UI.renderCategories(State.getCategories());
}

function renderRecordsView() {
  var records = State.getTransactions().slice();
  switch (currentSort) {
    case "date-asc": records.sort(function(a, b) { return a.date.localeCompare(b.date); }); break;
    case "amount-desc": records.sort(function(a, b) { return b.amount - a.amount; }); break;
    case "amount-asc": records.sort(function(a, b) { return a.amount - b.amount; }); break;
    case "description-asc": records.sort(function(a, b) { return a.description.localeCompare(b.description); }); break;
    case "description-desc": records.sort(function(a, b) { return b.description.localeCompare(a.description); }); break;
    default: records.sort(function(a, b) { return b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt); }); break;
  }
  if (currentRegex) records = Search.searchRecords(records, currentRegex);
  UI.renderRecords(records, currentRegex);
}

// === NAVIGATION ===
function attachNavEvents() {
  document.querySelectorAll(".nav-link").forEach(function(link) {
    link.addEventListener("click", function(e) {
      e.preventDefault();
      var section = link.getAttribute("data-section");
      UI.showSection(section);
      document.getElementById("main-nav").classList.remove("open");
      var h = document.querySelector(".hamburger");
      if (h) h.setAttribute("aria-expanded", "false");
    });
  });

  var hamburger = document.querySelector(".hamburger");
  var nav = document.getElementById("main-nav");
  if (hamburger && nav) {
    hamburger.addEventListener("click", function() {
      var open = nav.classList.toggle("open");
      hamburger.setAttribute("aria-expanded", String(open));
    });
  }

  document.querySelectorAll(".curr-btn").forEach(function(btn) {
    btn.addEventListener("click", function() {
      document.querySelectorAll(".curr-btn").forEach(function(b) { b.classList.remove("active"); });
      btn.classList.add("active");
      currentCurrency = btn.getAttribute("data-curr");
      var stats = State.getStats();
      UI.renderStats(stats, currentCurrency);
    });
  });

  var themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", function() {
      var isDark = document.documentElement.classList.contains("dark");
      State.setDarkMode(!isDark);
      applyDarkMode();
    });
  }
}

// === ADD / EDIT FORM ===
function attachFormEvents() {
  var form = document.getElementById("transaction-form");
  if (!form) return;

  form.addEventListener("submit", function(e) {
    e.preventDefault();
    UI.clearFormErrors();
    UI.setFormStatus("");

    var desc = document.getElementById("desc-input").value;
    var amount = document.getElementById("amount-input").value;
    var date = document.getElementById("date-input").value;
    var category = document.getElementById("category-input").value;
    var editId = document.getElementById("edit-id").value;

    var valid = true;
    var err = Validators.validateDescription(desc);
    if (err) { UI.showFieldError("desc", err); valid = false; }
    err = Validators.validateAmount(amount);
    if (err) { UI.showFieldError("amount", err); valid = false; }
    err = Validators.validateDate(date);
    if (err) { UI.showFieldError("date", err); valid = false; }
    err = Validators.validateCategory(category);
    if (err) { UI.showFieldError("category", err); valid = false; }
    if (!valid) return;

    if (editId) {
      State.updateTransaction(editId, { description: desc, amount: amount, category: category, date: date });
      UI.setFormStatus("Transaction updated.", "success");
    } else {
      State.addTransaction({ description: desc, amount: amount, category: category, date: date });
      UI.setFormStatus("Transaction saved.", "success");
    }
    UI.resetForm();
    renderAll();
  });

  document.getElementById("cancel-edit").addEventListener("click", function() {
    UI.resetForm();
    UI.setFormStatus("");
  });
}

// === RECORDS PAGE ===
function attachRecordsEvents() {
  var searchInput = document.getElementById("search-input");
  var caseToggle = document.getElementById("case-sensitive");
  var sortSelect = document.getElementById("sort-select");

  searchInput.addEventListener("input", function() {
    var flags = caseToggle.checked ? "g" : "gi";
    currentRegex = Search.compileRegex(searchInput.value, flags);
    renderRecordsView();
  });

  caseToggle.addEventListener("change", function() {
    var flags = caseToggle.checked ? "g" : "gi";
    currentRegex = Search.compileRegex(searchInput.value, flags);
    renderRecordsView();
  });

  sortSelect.addEventListener("change", function() {
    currentSort = sortSelect.value;
    renderRecordsView();
  });

  document.addEventListener("click", function(e) {
    var editBtn = e.target.closest("[data-edit]");
    var delBtn = e.target.closest("[data-delete]");
    if (editBtn) {
      var id = editBtn.getAttribute("data-edit");
      var record = State.getTransactions().find(function(t) { return t.id === id; });
      if (!record) return;
      UI.openEditModal(record, function(updates) {
        State.updateTransaction(id, updates);
        renderAll();
      });
    }
    if (delBtn) {
      var did = delBtn.getAttribute("data-delete");
      var rec = State.getTransactions().find(function(t) { return t.id === did; });
      if (!rec) return;
      UI.confirmAction('Delete "' + rec.description + '" for RWF ' + rec.amount.toLocaleString() + '?', function() {
        State.deleteTransaction(did);
        renderAll();
      });
    }
  });
}

// === SETTINGS PAGE ===
function attachSettingsEvents() {
  document.getElementById("category-form").addEventListener("submit", function(e) {
    e.preventDefault();
    var input = document.getElementById("new-category");
    var errEl = document.getElementById("category-form-error");
    var value = input.value;
    var err = Validators.validateNewCategory(value);
    if (err) { errEl.textContent = err; return; }
    var ok = State.addCategory(value);
    if (!ok) { errEl.textContent = "Category already exists or is invalid."; return; }
    input.value = "";
    errEl.textContent = "";
    UI.renderCategories(State.getCategories());
    UI.renderCategoryOptions(State.getCategories());
  });

  document.addEventListener("click", function(e) {
    var btn = e.target.closest("[data-remove-cat]");
    if (btn) {
      var name = btn.getAttribute("data-remove-cat");
      State.removeCategory(name);
      UI.renderCategories(State.getCategories());
      UI.renderCategoryOptions(State.getCategories());
    }
  });

  document.getElementById("save-rates").addEventListener("click", function() {
    var ngnInput = document.getElementById("rate-ngn");
    var usdInput = document.getElementById("rate-usd");
    var ngnErr = Validators.validateCurrencyRate(ngnInput.value);
    var usdErr = Validators.validateCurrencyRate(usdInput.value);
    if (ngnErr) { ngnInput.style.borderColor = "#CF222E"; alert("NGN rate: " + ngnErr); return; }
    if (usdErr) { usdInput.style.borderColor = "#CF222E"; alert("USD rate: " + usdErr); return; }
    ngnInput.style.borderColor = "";
    usdInput.style.borderColor = "";
    State.setRate("NGN", parseFloat(ngnInput.value));
    State.setRate("USD", parseFloat(usdInput.value));
    renderAll();
    var ist = document.getElementById("import-status");
    if (ist) { ist.textContent = "Rates saved."; ist.className = "success"; }
  });

  document.getElementById("save-cap").addEventListener("click", function() {
    var input = document.getElementById("cap-input");
    var val = parseInt(input.value, 10);
    var status = document.getElementById("cap-status");
    if (isNaN(val) || val <= 0) {
      if (status) status.textContent = "Enter a positive number.";
      return;
    }
    State.setCap(val);
    if (status) status.textContent = "Cap set to RWF " + val.toLocaleString() + ".";
    renderAll();
  });

  document.getElementById("export-btn").addEventListener("click", function() {
    var data = Storage.exportAll(State.getTransactions(), State.getCategories(), State.getSettings());
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "isusu_backup_" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  document.getElementById("import-file").addEventListener("change", function(e) {
    var file = e.target.files[0];
    if (!file) return;
    var status = document.getElementById("import-status");
    var reader = new FileReader();
    reader.onload = function() {
      try {
        var data = JSON.parse(reader.result);
        var error = Storage.validateImport(data);
        if (error) { status.textContent = "Import failed: " + error; status.className = "error"; return; }
        State.importAll(data);
        renderAll();
        status.textContent = "Imported " + data.transactions.length + " transactions.";
        status.className = "success";
      } catch (err) {
        status.textContent = "Could not parse the file. Make sure it is valid JSON.";
        status.className = "error";
      }
    };
    reader.onerror = function() { status.textContent = "Could not read the file."; status.className = "error"; };
    reader.readAsText(file);
  });

  document.getElementById("reset-btn").addEventListener("click", function() {
    UI.confirmAction("This will delete every transaction and restore defaults. This cannot be undone.", function() {
      State.resetAll();
      renderAll();
      UI.resetForm();
    });
  });
}

document.addEventListener("DOMContentLoaded", main);
