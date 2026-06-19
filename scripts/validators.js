// validators.js
// Input validation using regular expressions.
// Four standard rules plus one advanced (back-reference for duplicate words).

// 1. Description: no leading or trailing spaces, no double spaces inside.
// Uses lookahead and lookbehind.
const DESC_RE = /^(?!\s).+(?<!\s)$/;
const DOUBLE_SPACE_RE = /\s{2,}/;

// 2. Amount: digits, optional decimal with up to 2 places (e.g. 2500 or 12.50)
const AMOUNT_RE = /^\d+(\.\d{1,2})?$/;

// 3. Date in YYYY-MM-DD format
const DATE_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

// 4. Category name: letters, spaces, hyphens
const CAT_RE = /^[a-zA-Z\s\-]+$/;

// 5. Advanced: duplicate consecutive words (back-reference)
// Matches things like "food food" or "bus bus" in a string
const DUPE_WORD_RE = /\b(\w+)\s+\1\b/;

export function validateDescription(value) {
  if (!value || value.length === 0) return "Description cannot be empty.";
  if (DOUBLE_SPACE_RE.test(value)) return "No double spaces allowed.";
  if (!DESC_RE.test(value)) return "No leading or trailing spaces.";
  if (DUPE_WORD_RE.test(value)) {
    const match = value.match(DUPE_WORD_RE);
    const word = match ? match[1] : "?";
    return 'Duplicate word detected: "' + word + '". Did you type it twice?';
  }
  return null;
}

export function validateAmount(value) {
  if (!value || value.length === 0) return "Amount is required.";
  if (!AMOUNT_RE.test(value)) return "Enter a valid amount. Examples: 2500 or 12.50";
  const num = parseFloat(value);
  if (num <= 0) return "Amount must be greater than zero.";
  return null;
}

export function validateDate(value) {
  if (!value || value.length === 0) return "Date is required.";
  if (!DATE_RE.test(value)) return "Use the format YYYY-MM-DD.";
  return null;
}

export function validateCategory(value) {
  if (!value || value.length === 0) return "Pick a category.";
  return null;
}

export function validateNewCategory(value) {
  if (!value || value.trim().length === 0) return "Category name cannot be empty.";
  if (!CAT_RE.test(value.trim())) return "Use only letters, spaces, and hyphens.";
  return null;
}

export function validateCurrencyRate(value) {
  if (!value || value.length === 0) return "Rate is required.";
  // allow more decimal places for rates like 0.00077
  if (!/^\d+(\.\d+)?$/.test(value)) return "Enter a valid number.";
  const num = parseFloat(value);
  if (num <= 0) return "Rate must be greater than zero.";
  return null;
}
