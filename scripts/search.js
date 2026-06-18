// search.js
// Safe regex search for filtering records.
// Compiles user input into a RegExp with try/catch so bad patterns don't crash.

export function compileRegex(input, flags) {
  if (!input || input.trim().length === 0) return null;
  try {
    return new RegExp(input, flags || "i");
  } catch (e) {
    return null;
  }
}

// Wrap matches in <mark> tags without breaking neighbouring content.
export function highlight(text, regex) {
  if (!regex || !text) return text;
  // If the regex has the global flag we can just replace all.
  // If not, add it so we highlight every match in the string.
  const flags = regex.flags.includes("g") ? regex.flags : regex.flags + "g";
  const globalRe = new RegExp(regex.source, flags);
  return text.replace(globalRe, function (m) {
    return "<mark>" + m + "</mark>";
  });
}

// Search records by matching the regex against description, category, amount, and date.
export function searchRecords(records, regex) {
  if (!regex) return records;
  return records.filter(function (r) {
    regex.lastIndex = 0;
    return regex.test(r.description) ||
           regex.test(r.category) ||
           regex.test(String(r.amount)) ||
           regex.test(r.date);
  });
}
