const display = document.getElementById("display");
const message = document.getElementById("message");
const angleMode = document.getElementById("angleMode");
let expression = "";
let answer = 0;
let degrees = true;

function updateDisplay() {
  display.value = expression;
  message.textContent = "";
}

function addValue(value) {
  const last = expression.slice(-1);
  const operators = ["+", "-", "*", "/"];
  if (operators.includes(value) && (!expression && value !== "-")) return;
  if (operators.includes(value) && operators.includes(last)) {
    expression = expression.slice(0, -1) + value;
  } else if (value === ".") {
    const currentNumber = expression.split(/[+\-*/()]/).pop();
    if (currentNumber.includes(".")) return;
    expression += currentNumber ? "." : "0.";
  } else {
    expression += value;
  }
  updateDisplay();
}

function insertFunction(name) {
  expression += name + "(";
  updateDisplay();
}

function safeEvaluate(source) {
  if (!source.trim()) throw new Error("Enter a calculation first.");
  if (!/^[0-9+\-*/().,\sA-Za-z]+$/.test(source)) throw new Error("Invalid expression.");
  const allowedNames = ["sin", "cos", "tan", "sqrt", "log", "ln", "pow", "pi", "e"];
  const identifiers = source.match(/[A-Za-z]+/g) || [];
  if (identifiers.some(name => !allowedNames.includes(name))) throw new Error("Unknown function.");
  const sin = x => Math.sin(degrees ? x * Math.PI / 180 : x);
  const cos = x => Math.cos(degrees ? x * Math.PI / 180 : x);
  const tan = x => Math.tan(degrees ? x * Math.PI / 180 : x);
  const sqrt = x => Math.sqrt(x);
  const log = x => Math.log10(x);
  const ln = x => Math.log(x);
  const pow = (x, y) => Math.pow(x, y);
  const pi = Math.PI;
  const e = Math.E;
  const result = Function("sin", "cos", "tan", "sqrt", "log", "ln", "pow", "pi", "e",
    '"use strict"; return (' + source + ');')(sin, cos, tan, sqrt, log, ln, pow, pi, e);
  if (!Number.isFinite(result)) throw new Error("Result is not a finite number.");
  return Number(result.toPrecision(12));
}

function calculate() {
  try {
    answer = safeEvaluate(expression);
    expression = String(answer);
    updateDisplay();
  } catch (error) {
    message.textContent = error.message || "Please enter a valid calculation.";
  }
}

document.querySelector(".keys").addEventListener("click", event => {
  const button = event.target.closest("button");
  if (!button) return;
  const action = button.dataset.action;
  if (action === "clear") { expression = ""; updateDisplay(); }
  else if (action === "delete") { expression = expression.slice(0, -1); updateDisplay(); }
  else if (action === "equals") calculate();
  else if (action === "open") { expression += "("; updateDisplay(); }
  else if (action === "close") { expression += ")"; updateDisplay(); }
  else if (action === "sin" || action === "cos" || action === "tan" ||
           action === "sqrt" || action === "log" || action === "ln") {
    insertFunction(action);
  } else if (action === "square") { expression = "pow(" + (expression || "0") + ",2)"; updateDisplay(); }
  else if (action === "power") { expression += "**"; updateDisplay(); }
  else if (action === "pi") { expression += "pi"; updateDisplay(); }
  else if (action === "e") { expression += "e"; updateDisplay(); }
  else if (action === "ans") { expression += String(answer); updateDisplay(); }
  else if (action === "percent") {
    try { expression = String(safeEvaluate(expression) / 100); updateDisplay(); }
    catch { message.textContent = "Enter a valid number or expression before %."; }
  } else if (button.dataset.value) addValue(button.dataset.value);
});

angleMode.addEventListener("click", () => {
  degrees = !degrees;
  angleMode.textContent = degrees ? "DEG" : "RAD";
  angleMode.setAttribute("aria-pressed", String(!degrees));
});

document.addEventListener("keydown", event => {
  if (/^[0-9.+\-*/()]$/.test(event.key)) addValue(event.key);
  else if (event.key === "Enter" || event.key === "=") { event.preventDefault(); calculate(); }
  else if (event.key === "Backspace") { expression = expression.slice(0, -1); updateDisplay(); }
  else if (event.key === "Escape") { expression = ""; updateDisplay(); }
});
