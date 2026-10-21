const display = document.getElementById("display");
const message = document.getElementById("message");
let expression = "";

function updateDisplay() {
  display.value = expression || "";
  message.textContent = "";
}

function addValue(value) {
  const last = expression.slice(-1);
  const operators = ["+", "-", "*", "/"];
  if (operators.includes(value) && (!expression && value !== "-")) return;
  if (operators.includes(value) && operators.includes(last)) {
    expression = expression.slice(0, -1) + value;
  } else if (value === ".") {
    const currentNumber = expression.split(/[+\-*/]/).pop();
    if (currentNumber.includes(".")) return;
    expression += currentNumber ? "." : "0.";
  } else {
    expression += value;
  }
  updateDisplay();
}

function calculate() {
  if (!expression) return;
  if (!/^[0-9+\-*/.() ]+$/.test(expression)) {
    message.textContent = "Invalid expression.";
    return;
  }
  try {
    const result = Function('"use strict"; return (' + expression + ')')();
    if (!Number.isFinite(result)) throw new Error("Cannot divide by zero.");
    expression = String(Number(result.toPrecision(12)));
    updateDisplay();
  } catch {
    message.textContent = "Please enter a valid calculation.";
  }
}

document.querySelector(".keys").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const action = button.dataset.action;
  if (action === "clear") { expression = ""; updateDisplay(); }
  else if (action === "delete") { expression = expression.slice(0, -1); updateDisplay(); }
  else if (action === "percent") {
    if (expression) {
      const value = Number(expression);
      if (Number.isFinite(value)) { expression = String(value / 100); updateDisplay(); }
      else message.textContent = "Use % with a single number.";
    }
  } else if (action === "equals") calculate();
  else if (button.dataset.value) addValue(button.dataset.value);
});

document.addEventListener("keydown", (event) => {
  if (/^[0-9.+\-*/]$/.test(event.key)) addValue(event.key);
  else if (event.key === "Enter" || event.key === "=") { event.preventDefault(); calculate(); }
  else if (event.key === "Backspace") { expression = expression.slice(0, -1); updateDisplay(); }
  else if (event.key === "Escape") { expression = ""; updateDisplay(); }
});
