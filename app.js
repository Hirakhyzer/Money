const STORAGE_KEY = "money-map-state-v1";

const defaultState = {
  monthlyBudget: 2000,
  currency: "USD",
  transactions: []
};

let state = loadState();

const elements = {
  form: document.querySelector("#transaction-form"),
  type: document.querySelector("#type"),
  amount: document.querySelector("#amount"),
  description: document.querySelector("#description"),
  category: document.querySelector("#category"),
  date: document.querySelector("#date"),
  incomeTotal: document.querySelector("#income-total"),
  expenseTotal: document.querySelector("#expense-total"),
  balanceTotal: document.querySelector("#balance-total"),
  transactionCount: document.querySelector("#transaction-count"),
  currentMonth: document.querySelector("#current-month"),
  budgetSpent: document.querySelector("#budget-spent"),
  budgetTotal: document.querySelector("#budget-total"),
  budgetProgress: document.querySelector("#budget-progress"),
  budgetMessage: document.querySelector("#budget-message"),
  budgetInput: document.querySelector("#budget-input"),
  currencyInput: document.querySelector("#currency-input"),
  saveSettings: document.querySelector("#save-settings"),
  categoryList: document.querySelector("#category-list"),
  transactionBody: document.querySelector("#transaction-body"),
  emptyState: document.querySelector("#empty-state"),
  searchInput: document.querySelector("#search-input"),
  filterInput: document.querySelector("#filter-input"),
  exportButton: document.querySelector("#export-button"),
  importInput: document.querySelector("#import-input"),
  resetButton: document.querySelector("#reset-button")
};

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || !Array.isArray(saved.transactions)) {
      return structuredClone(defaultState);
    }

    return {
      monthlyBudget: Number(saved.monthlyBudget) || 0,
      currency: typeof saved.currency === "string" ? saved.currency : "USD",
      transactions: saved.transactions.filter(isValidTransaction)
    };
  } catch {
    return structuredClone(defaultState);
  }
}

function isValidTransaction(transaction) {
  return Boolean(
    transaction &&
    typeof transaction.id === "string" &&
    ["income", "expense"].includes(transaction.type) &&
    Number.isFinite(Number(transaction.amount)) &&
    Number(transaction.amount) > 0 &&
    typeof transaction.description === "string" &&
    typeof transaction.category === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(transaction.date)
  );
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function makeId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function monthTransactions() {
  const key = currentMonthKey();
  return state.transactions.filter((transaction) => transaction.date.startsWith(key));
}

function formatMoney(value) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: state.currency,
      maximumFractionDigits: 2
    }).format(value);
  } catch {
    return `${state.currency} ${Number(value).toFixed(2)}`;
  }
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(date);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderSummary() {
  const transactions = monthTransactions();
  const income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const expenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  elements.incomeTotal.textContent = formatMoney(income);
  elements.expenseTotal.textContent = formatMoney(expenses);
  elements.balanceTotal.textContent = formatMoney(income - expenses);
  elements.transactionCount.textContent = String(transactions.length);

  renderBudget(expenses);
  renderCategories(transactions, expenses);
}

function renderBudget(expenses) {
  const budget = Number(state.monthlyBudget) || 0;
  const percentage = budget > 0 ? (expenses / budget) * 100 : 0;
  const clampedPercentage = Math.min(percentage, 100);

  elements.budgetSpent.textContent = formatMoney(expenses);
  elements.budgetTotal.textContent = formatMoney(budget);
  elements.budgetProgress.style.width = `${clampedPercentage}%`;
  elements.budgetProgress.classList.toggle("warning", percentage >= 75 && percentage < 100);
  elements.budgetProgress.classList.toggle("over", percentage >= 100);

  if (budget <= 0) {
    elements.budgetMessage.textContent = "Set a monthly budget to begin.";
  } else if (percentage >= 100) {
    elements.budgetMessage.textContent = `Budget exceeded by ${formatMoney(expenses - budget)}.`;
  } else {
    elements.budgetMessage.textContent = `${formatMoney(budget - expenses)} remaining · ${percentage.toFixed(0)}% used.`;
  }
}

function renderCategories(transactions, totalExpenses) {
  const totals = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((result, transaction) => {
      result[transaction.category] = (result[transaction.category] || 0) + Number(transaction.amount);
      return result;
    }, {});

  const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    elements.categoryList.innerHTML = '<p class="category-empty">No expense categories recorded this month.</p>';
    return;
  }

  elements.categoryList.innerHTML = entries
    .map(([category, amount]) => {
      const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
      return `
        <div class="category-row">
          <div class="category-meta">
            <span>${escapeHtml(category)}</span>
            <span>${percentage.toFixed(0)}%</span>
          </div>
          <strong>${formatMoney(amount)}</strong>
          <div class="category-bar" aria-label="${escapeHtml(category)} ${percentage.toFixed(0)} percent">
            <span style="width: ${percentage}%"></span>
          </div>
        </div>
      `;
    })
    .join("");
}

function visibleTransactions() {
  const query = elements.searchInput.value.trim().toLowerCase();
  const filter = elements.filterInput.value;

  return [...state.transactions]
    .filter((transaction) => filter === "all" || transaction.type === filter)
    .filter((transaction) => {
      if (!query) return true;
      return [transaction.description, transaction.category, transaction.date]
        .some((value) => value.toLowerCase().includes(query));
    })
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
}

function renderTransactions() {
  const transactions = visibleTransactions();
  elements.emptyState.hidden = transactions.length > 0;
  elements.transactionBody.hidden = transactions.length === 0;

  elements.transactionBody.innerHTML = transactions
    .map((transaction) => {
      const sign = transaction.type === "income" ? "+" : "−";
      return `
        <tr>
          <td>${formatDate(transaction.date)}</td>
          <td><strong>${escapeHtml(transaction.description)}</strong></td>
          <td>${escapeHtml(transaction.category)}</td>
          <td><span class="type-badge ${transaction.type}">${transaction.type}</span></td>
          <td class="amount-cell amount-${transaction.type}">${sign}${formatMoney(Number(transaction.amount))}</td>
          <td>
            <button class="delete-button" type="button" data-delete-id="${escapeHtml(transaction.id)}" aria-label="Delete ${escapeHtml(transaction.description)}">×</button>
          </td>
        </tr>
      `;
    })
    .join("");
}

function render() {
  const now = new Date();
  elements.currentMonth.textContent = new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric"
  }).format(now);
  elements.budgetInput.value = state.monthlyBudget;
  elements.currencyInput.value = state.currency;
  renderSummary();
  renderTransactions();
}

function addTransaction(event) {
  event.preventDefault();
  const amount = Number(elements.amount.value);
  const description = elements.description.value.trim();

  if (!Number.isFinite(amount) || amount <= 0 || !description) {
    return;
  }

  state.transactions.push({
    id: makeId(),
    type: elements.type.value,
    amount,
    description,
    category: elements.category.value,
    date: elements.date.value,
    createdAt: Date.now()
  });

  saveState();
  elements.form.reset();
  elements.type.value = "expense";
  elements.date.value = new Date().toISOString().slice(0, 10);
  render();
  elements.description.focus();
}

function deleteTransaction(id) {
  state.transactions = state.transactions.filter((transaction) => transaction.id !== id);
  saveState();
  render();
}

function saveSettings() {
  const budget = Number(elements.budgetInput.value);
  state.monthlyBudget = Number.isFinite(budget) && budget >= 0 ? budget : 0;
  state.currency = elements.currencyInput.value;
  saveState();
  render();
}

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `money-map-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function importData(event) {
  const [file] = event.target.files;
  if (!file) return;

  try {
    const imported = JSON.parse(await file.text());
    if (!imported || !Array.isArray(imported.transactions)) {
      throw new Error("Invalid Money Map backup");
    }

    const transactions = imported.transactions.filter(isValidTransaction).map((transaction) => ({
      ...transaction,
      amount: Number(transaction.amount),
      createdAt: Number(transaction.createdAt) || Date.now()
    }));

    state = {
      monthlyBudget: Number(imported.monthlyBudget) || 0,
      currency: typeof imported.currency === "string" ? imported.currency : "USD",
      transactions
    };
    saveState();
    render();
  } catch (error) {
    alert(error instanceof Error ? error.message : "Could not import this file.");
  } finally {
    event.target.value = "";
  }
}

function resetData() {
  const confirmed = confirm("Delete all Money Map data stored in this browser?");
  if (!confirmed) return;
  state = structuredClone(defaultState);
  saveState();
  render();
}

elements.form.addEventListener("submit", addTransaction);
elements.saveSettings.addEventListener("click", saveSettings);
elements.searchInput.addEventListener("input", renderTransactions);
elements.filterInput.addEventListener("change", renderTransactions);
elements.exportButton.addEventListener("click", exportData);
elements.importInput.addEventListener("change", importData);
elements.resetButton.addEventListener("click", resetData);
elements.transactionBody.addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete-id]");
  if (button) deleteTransaction(button.dataset.deleteId);
});

elements.date.value = new Date().toISOString().slice(0, 10);
render();
