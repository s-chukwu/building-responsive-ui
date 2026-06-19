# ISUSU - Student Finance Tracker

A simple expense tracker built for students. Track where your money goes, convert between currencies, and stay under budget.

**Live site:** [https://s-chukwu.github.io/building-responsive-ui/](https://s-chukwu.github.io/building-responsive-ui/)

**Theme:** Student Finance Tracker (Theme 1)

---

## What it does

- Add, edit, and delete transactions with description, amount, category, and date
- View all your records in a table (desktop) or cards (mobile)
- Sort by date, description (A-Z), or amount (low to high / high to low)
- Search through your transactions with regex, toggle case sensitivity, see matches highlighted
- Dashboard shows total records, total spend, average per transaction, and your top category
- 7-day spending trend as a simple bar chart
- Set a monthly cap (default is RWF 300,000), get warned when you are close or over
- Switch between RWF, NGN, and USD using manual exchange rates (editable in Settings)
- Add or remove spending categories anytime
- Export all your data as a JSON file, import it back later with validation
- All data saved to localStorage so it stays between visits
- Dark mode toggle that remembers your preference
- Works on mobile, tablet, and desktop

---

## Regex catalog

| Pattern | Type | What it does | Examples that match | Examples that do not |
|---|---|---|---|---|
| `^(?!\s).+(?<!\s)$` | Lookahead/Lookbehind | Rejects leading or trailing spaces, requires at least one character | `Lunch`, `Bus fare` | ` Lunch`, `Dinner `, `  ` |
| `^\d+(\.\d{1,2})?$` | Standard | Validates amounts: whole numbers or up to 2 decimal places | `12`, `12.50`, `0.99` | `12.`, `12.555`, `abc` |
| `^\d{4}-(0[1-9]\|1[0-2])-(0[1-9]\|[12]\d\|3[01])$` | Standard | Validates dates in YYYY-MM-DD format | `2026-06-15`, `2025-01-01` | `2026-13-01`, `26-06-15`, `2026/06/15` |
| `^[a-zA-Z\s\-]+(,[a-zA-Z\s\-]+)*$` | Standard | Validates categories: letters, spaces, and hyphens, comma separated | `Food`, `Books`, `Bus fare,Transport` | `Food123`, `--books`, `Food,` |
| `\b(\w+)\s+\1\b` | Back-reference (advanced) | Catches duplicate words (e.g. typo in description) | `lunch lunch`, `bus bus fare` | `lunch today`, `bus fare` |
| `\.\d{2}$` | Example search | Find transactions with exact cent amounts | `12.50`, `99.99` | `12.5`, `100` |
| `/coffee\|tea/i` | Example search | Find transactions mentioning coffee or tea | `Coffee at cafe`, `Green tea` | `Lunch`, `Bus fare` |

---

## Keyboard map

| Key | What happens |
|---|---|
| Tab / Shift+Tab | Move between all interactive elements (nav links, form fields, buttons, table rows) |
| Enter / Space | Activate buttons, links, and form submissions |
| Escape | Close any open modal (edit modal, delete confirmation) |
| Arrow keys | Navigate sort dropdown and currency toggle options |
| Tab (on load) | First focusable element is the "Skip to content" link, then the nav |

All interactive elements have visible focus rings (3px solid blue outline). The skip-to-content link is hidden visually until focused, then slides down.

---

## Accessibility notes

- Semantic HTML5 landmarks: header, nav, main, section, footer
- Heading hierarchy: one H1 per page section, no skipped levels
- Every form input has an associated label element
- Error messages appear inline next to their field and have `aria-describedby` linking
- Dashboard cap indicator uses `aria-live="polite"` when under cap, switches to `aria-live="assertive"` when over
- Modals have `aria-modal="true"` and `role="dialog"` or `role="alertdialog"`
- Records table wrapper has `aria-labelledby` pointing to the section heading
- Color contrast meets WCAG AA minimums in both light and dark themes
- prefers-reduced-motion respected: no animations when the user has it enabled
- All content accessible and operable with keyboard only

---

## File structure

```
student-finance-tracker/
├── index.html              Main HTML with all 5 sections
├── styles/
│   └── main.css            All styles, mobile-first, 3 breakpoints
├── scripts/
│   ├── app.js              Entry point, event wiring, navigation
│   ├── state.js            Central state, seed data, exchange rates
│   ├── storage.js          localStorage read/write, JSON import/export
│   ├── ui.js               All DOM rendering (dashboard, records, forms, settings)
│   ├── validators.js       Regex patterns and validation functions
│   └── search.js           Safe regex compiler, match highlighting
├── assets/
│   └── logo.png            App logo 
├── tests.html              30 unit tests for validators and storage
├── seed.json               Sample transactions in RWF
└── README.md               This file
```

---

## How to run locally

```bash
cd building-responsive-ui
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

No build step, no dependencies. Just plain HTML, CSS, and JavaScript.

---

## How to run tests

Open [http://localhost:8000/tests.html](http://localhost:8000/tests.html) (or the deployed version at [https://s-chukwu.github.io/building-responsive-ui/tests.html](https://s-chukwu.github.io/building-responsive-ui/tests.html)).

You should see 30 passing assertions. Tests cover:

- All 5 regex validators (valid inputs, invalid edge cases, boundary values)
- localStorage save and load round-trip
- JSON import validation (correct structure, missing fields, bad types)

---

## Built by

Sochukwuma Isaac Chukwu ([s-chukwu](https://github.com/s-chukwu))

Demo video ([link](https://drive.google.com/file/d/1ELcdw9w4jULZ5EEY2oBPf0PcopRdY9K8/view?usp=sharing))

For the Building Responsive UI summative assignment at African Leadership University.

---