// ui.js
// All DOM rendering lives here. App.js drives when each function is called.

import * as State from "./state.js";
import { highlight } from "./search.js";

// Render the stat cards at the top of the dashboard.
export function renderStats(stats, currency) {
  var grid = document.getElementById("stats-grid");
  if (!grid) return;

  var total;
  if (currency === "NGN") {
    total = stats.sumNGN.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " NGN";
  } else if (currency === "USD") {
    total = "$" + stats.sumUSD.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  } else {
    total = stats.sumRWF.toLocaleString() + " RWF";
  }

  var cards = [
    { label: "Transactions", value: stats.total },
    { label: "Total", value: total },
    { label: "Average", value: stats.total > 0 ? Math.round(stats.sumRWF / stats.total).toLocaleString() + " RWF" : "0 RWF" }
  ];

  grid.innerHTML = "";
  cards.forEach(function(c) {
    var card = document.createElement("div");
    card.className = "stat-card";
    card.innerHTML = '<div class="stat-label">' + c.label + '</div><div class="stat-value">' + c.value + '</div>';
    grid.appendChild(card);
  });
}

// Render the cap / budget indicator with ARIA live.
export function renderCap(stats) {
  var el = document.getElementById("cap-indicator");
  if (!el || !stats.cap) return;

  var remaining = stats.remaining;
  var over = stats.overCap;

  el.classList.add("visible");
  el.classList.remove("under", "over");

  if (over) {
    el.classList.add("over");
    el.setAttribute("aria-live", "assertive");
    var overBy = Math.abs(remaining).toLocaleString();
    el.textContent = "You have exceeded your cap of RWF " + stats.cap.toLocaleString() + " by RWF " + overBy + ". Time to slow down.";
  } else {
    el.classList.add("under");
    el.setAttribute("aria-live", "polite");
    el.textContent = "RWF " + remaining.toLocaleString() + " remaining before you hit your cap of RWF " + stats.cap.toLocaleString() + ".";
  }
}

// Render the 7-day bar chart.
export function renderChart(days) {
  var container = document.getElementById("bar-chart");
  if (!container) return;

  var maxTotal = Math.max.apply(null, days.map(function(d) { return d.total; })) || 1;

  container.innerHTML = "";
  days.forEach(function(day) {
    var col = document.createElement("div");
    col.className = "bar-col";

    var fill = document.createElement("div");
    fill.className = "bar-fill";
    if (day.total === 0) fill.classList.add("zero");
    var pct = Math.round((day.total / maxTotal) * 100);
    fill.style.height = Math.max(pct, 4) + "%";
    fill.setAttribute("aria-label", day.label + ": RWF " + day.total.toLocaleString());

    var label = document.createElement("span");
    label.className = "bar-label";
    label.textContent = day.label;

    col.appendChild(fill);
    col.appendChild(label);
    container.appendChild(col);
  });
}

// Render the top category card.
export function renderTopCategory(stats) {
  var el = document.getElementById("top-category");
  if (!el) return;

  el.innerHTML = '<h2>Top Category</h2>' +
    '<div class="top-cat-name">' + stats.topCat + '</div>' +
    '<div class="top-cat-total">RWF ' + stats.topCatTotal.toLocaleString() + '</div>';
}

// Render the records table and mobile cards.
export function renderRecords(records, searchRegex) {
  var tbody = document.getElementById("records-body");
  var cardsContainer = document.getElementById("cards-container");
  var noRecords = document.getElementById("no-records");

  if (!records.length) {
    if (tbody) tbody.innerHTML = "";
    if (cardsContainer) cardsContainer.innerHTML = "";
    if (noRecords) noRecords.style.display = "block";
    return;
  }
  if (noRecords) noRecords.style.display = "none";

  if (tbody) {
    var rows = records.map(function(r) {
      return '<tr>' +
        '<td>' + highlight(r.description, searchRegex) + '</td>' +
        '<td>RWF ' + highlight(String(r.amount), searchRegex) + '</td>' +
        '<td>' + highlight(r.category, searchRegex) + '</td>' +
        '<td>' + highlight(r.date, searchRegex) + '</td>' +
        '<td><div class="action-btns">' +
          '<button data-edit="' + r.id + '">Edit</button>' +
          '<button class="del-btn" data-delete="' + r.id + '">Delete</button>' +
        '</div></td></tr>';
    });
    tbody.innerHTML = rows.join("");
  }

  if (cardsContainer) {
    var cards = records.map(function(r) {
      return '<div class="record-card">' +
        '<div class="card-row"><div><div class="card-label">Description</div><div class="card-val">' + highlight(r.description, searchRegex) + '</div></div>' +
        '<div class="card-amount">RWF ' + highlight(String(r.amount), searchRegex) + '</div></div>' +
        '<div class="card-row"><div><div class="card-label">Category</div><div class="card-val">' + highlight(r.category, searchRegex) + '</div></div>' +
        '<div><div class="card-label">Date</div><div class="card-val">' + r.date + '</div></div></div>' +
        '<div class="card-actions">' +
          '<button data-edit="' + r.id + '">Edit</button>' +
          '<button class="del-btn" data-delete="' + r.id + '">Delete</button>' +
        '</div></div>';
    });
    cardsContainer.innerHTML = cards.join("");
  }
}

// Render categories in the settings page.
export function renderCategories(categories) {
  var list = document.getElementById("category-list");
  if (!list) return;
  var tags = categories.map(function(c) {
    return '<li class="category-tag">' + c +
      '<button data-remove-cat="' + c + '" aria-label="Remove ' + c + '">&times;</button></li>';
  });
  list.innerHTML = tags.join("");
}

// Populate the category dropdown in the Add form.
export function renderCategoryOptions(categories) {
  var select = document.getElementById("category-input");
  if (!select) return;
  var current = select.value;
  select.innerHTML = '<option value="">Select a category</option>' +
    categories.map(function(c) {
      return '<option value="' + c + '"' + (c === current ? " selected" : "") + '>' + c + '</option>';
    }).join("");
}

// Populate the Add form for editing an existing record.
export function populateForm(record) {
  document.getElementById("edit-id").value = record.id;
  document.getElementById("desc-input").value = record.description;
  document.getElementById("amount-input").value = record.amount;
  document.getElementById("date-input").value = record.date;
  document.getElementById("category-input").value = record.category;
  document.getElementById("cancel-edit").style.display = "inline-flex";
}

// Reset the Add form to blank.
export function resetForm() {
  document.getElementById("edit-id").value = "";
  document.getElementById("desc-input").value = "";
  document.getElementById("amount-input").value = "";
  document.getElementById("date-input").value = new Date().toISOString().slice(0, 10);
  document.getElementById("category-input").value = "";
  document.getElementById("cancel-edit").style.display = "none";
  clearFormErrors();
}

// Show an inline error under a form field.
export function showFieldError(fieldId, message) {
  var el = document.getElementById(fieldId + "-error");
  var input = document.getElementById(fieldId + "-input");
  if (el) el.textContent = message || "";
  if (input) {
    if (message) input.classList.add("input-error");
    else input.classList.remove("input-error");
  }
}

// Clear all inline form errors.
export function clearFormErrors() {
  ["desc", "amount", "date", "category"].forEach(function(id) { showFieldError(id, ""); });
}

// Show a status message inside the form.
export function setFormStatus(message, type) {
  var el = document.getElementById("form-status");
  if (!el) return;
  el.textContent = message || "";
  el.className = type || "";
}

// Switch visible page section and update nav active state.
export function showSection(name) {
  document.querySelectorAll(".page-section").forEach(function(s) { s.classList.add("hidden"); });
  var target = document.getElementById(name);
  if (target) target.classList.remove("hidden");

  document.querySelectorAll(".nav-link").forEach(function(link) {
    link.classList.remove("active");
    if (link.getAttribute("data-section") === name) link.classList.add("active");
  });
}

// Open an inline edit modal for updating a record from the records page.
export function openEditModal(record, onSave) {
  var existing = document.querySelector(".edit-modal");
  if (existing) existing.remove();

  var modal = document.createElement("div");
  modal.className = "edit-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-label", "Edit transaction");

  modal.innerHTML =
    '<div class="edit-modal-content">' +
      '<h3>Edit Transaction</h3>' +
      '<div class="form-field"><label for="modal-desc">Description</label>' +
        '<input type="text" id="modal-desc" value="' + escapeAttr(record.description) + '"></div>' +
      '<div class="form-field"><label for="modal-amount">Amount (RWF)</label>' +
        '<input type="text" id="modal-amount" value="' + record.amount + '"></div>' +
      '<div class="form-field"><label for="modal-cat">Category</label>' +
        '<select id="modal-cat">' +
          State.getCategories().map(function(c) {
            return '<option value="' + c + '"' + (c === record.category ? " selected" : "") + '>' + c + '</option>';
          }).join("") +
        '</select></div>' +
      '<div class="form-field"><label for="modal-date">Date</label>' +
        '<input type="date" id="modal-date" value="' + record.date + '">' +
        '<span class="field-error" id="modal-error"></span></div>' +
      '<div class="modal-actions">' +
        '<button class="btn btn-ghost" id="modal-cancel">Cancel</button>' +
        '<button class="btn btn-primary" id="modal-save">Save</button>' +
      '</div></div>';

  document.body.appendChild(modal);

  document.getElementById("modal-cancel").addEventListener("click", function() { modal.remove(); });
  modal.addEventListener("click", function(e) { if (e.target === modal) modal.remove(); });
  document.getElementById("modal-save").addEventListener("click", function() {
    var desc = document.getElementById("modal-desc").value;
    var amount = document.getElementById("modal-amount").value;
    var cat = document.getElementById("modal-cat").value;
    var date = document.getElementById("modal-date").value;
    if (!desc.trim()) { document.getElementById("modal-error").textContent = "Description is required."; return; }
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) { document.getElementById("modal-error").textContent = "Enter a valid amount."; return; }
    if (!date) { document.getElementById("modal-error").textContent = "Date is required."; return; }
    onSave({ description: desc, amount: amount, category: cat, date: date });
    modal.remove();
  });
  document.addEventListener("keydown", function handler(e) {
    if (e.key === "Escape") { modal.remove(); document.removeEventListener("keydown", handler); }
  });
}

// Show a confirm dialog.
export function confirmAction(message, onConfirm) {
  var overlay = document.createElement("div");
  overlay.className = "edit-modal";
  overlay.setAttribute("role", "alertdialog");
  overlay.innerHTML =
    '<div class="edit-modal-content">' +
      '<h3>Are you sure?</h3>' +
      '<p style="margin-bottom:16px;color:var(--clr-text-secondary)">' + message + '</p>' +
      '<div class="modal-actions">' +
        '<button class="btn btn-ghost" id="confirm-no">Cancel</button>' +
        '<button class="btn btn-danger" id="confirm-yes">Yes, delete</button>' +
      '</div></div>';
  document.body.appendChild(overlay);
  document.getElementById("confirm-no").addEventListener("click", function() { overlay.remove(); });
  overlay.addEventListener("click", function(e) { if (e.target === overlay) overlay.remove(); });
  document.getElementById("confirm-yes").addEventListener("click", function() { overlay.remove(); onConfirm(); });
}

function escapeAttr(str) {
  return String(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
