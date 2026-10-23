const display = document.querySelector("#display");
const expression = document.querySelector("#expression");
const keypad = document.querySelector("#calculator-keys");
const operatorButtons = document.querySelectorAll("[data-operator]");

let currentValue = "0";
let storedValue = null;
let pendingOperator = null;
let shouldStartNewNumber = false;
let hasError = false;

const formatNumber = (value) => {
  if (!Number.isFinite(value)) return "Error";
  const rounded = Number.parseFloat(value.toPrecision(12));
  return String(rounded);
};

const render = () => {
  display.textContent = currentValue;
  operatorButtons.forEach((button) => {
    button.classList.toggle("is-selected", button.dataset.operator === pendingOperator);
  });
};

const clearCalculator = () => {
  currentValue = "0";
  storedValue = null;
  pendingOperator = null;
  shouldStartNewNumber = false;
  hasError = false;
  expression.textContent = "";
  render();
};

const enterDigit = (digit) => {
  if (hasError) clearCalculator();

  if (shouldStartNewNumber) {
    currentValue = digit;
    shouldStartNewNumber = false;
  } else if (currentValue === "0") {
    currentValue = digit;
  } else if (currentValue === "-0") {
    currentValue = `-${digit}`;
  } else if (currentValue.replace("-", "").length < 12) {
    currentValue += digit;
  }

  render();
};

const enterDecimal = () => {
  if (hasError) clearCalculator();
  if (shouldStartNewNumber) {
    currentValue = "0.";
    shouldStartNewNumber = false;
  } else if (!currentValue.includes(".")) {
    currentValue += ".";
  }
  render();
};

const calculate = (left, right, operator) => {
  switch (operator) {
    case "+":
      return left + right;
    case "−":
      return left - right;
    case "×":
      return left * right;
    case "÷":
      return right === 0 ? Number.NaN : left / right;
    default:
      return right;
  }
};

const showError = () => {
  currentValue = "Error";
  storedValue = null;
  pendingOperator = null;
  shouldStartNewNumber = true;
  hasError = true;
  expression.textContent = "Tidak bisa membagi dengan nol";
  render();
};

const chooseOperator = (operator) => {
  if (hasError) clearCalculator();
  const inputValue = Number(currentValue);

  if (pendingOperator && !shouldStartNewNumber) {
    const result = calculate(storedValue, inputValue, pendingOperator);
    if (!Number.isFinite(result)) {
      showError();
      return;
    }
    currentValue = formatNumber(result);
    storedValue = result;
  } else {
    storedValue = inputValue;
  }

  pendingOperator = operator;
  shouldStartNewNumber = true;
  expression.textContent = `${currentValue} ${operator}`;
  render();
};

const calculateResult = () => {
  if (!pendingOperator || storedValue === null || shouldStartNewNumber) return;

  const left = storedValue;
  const right = Number(currentValue);
  const operator = pendingOperator;
  const result = calculate(left, right, operator);

  if (!Number.isFinite(result)) {
    showError();
    return;
  }

  expression.textContent = `${formatNumber(left)} ${operator} ${formatNumber(right)} =`;
  currentValue = formatNumber(result);
  storedValue = null;
  pendingOperator = null;
  shouldStartNewNumber = true;
  render();
};

const applyAction = (action) => {
  if (action === "clear") {
    clearCalculator();
    return;
  }

  if (action === "equals") {
    calculateResult();
    return;
  }

  if (action === "decimal") {
    enterDecimal();
    return;
  }

  if (action === "sign") {
    if (hasError) clearCalculator();
    if (currentValue !== "0") {
      currentValue = currentValue.startsWith("-")
        ? currentValue.slice(1)
        : `-${currentValue}`;
    }
    render();
    return;
  }

  if (action === "percent") {
    if (hasError) clearCalculator();
    currentValue = formatNumber(Number(currentValue) / 100);
    shouldStartNewNumber = true;
    render();
    return;
  }

  if (action === "backspace") {
    if (hasError) {
      clearCalculator();
      return;
    }
    if (shouldStartNewNumber) {
      currentValue = "0";
      shouldStartNewNumber = false;
    } else {
      currentValue = currentValue.length > 1 ? currentValue.slice(0, -1) : "0";
      if (currentValue === "-") currentValue = "0";
    }
    render();
  }
};

keypad.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.number !== undefined) {
    enterDigit(button.dataset.number);
  } else if (button.dataset.operator) {
    chooseOperator(button.dataset.operator);
  } else if (button.dataset.action) {
    applyAction(button.dataset.action);
  }
});

document.addEventListener("keydown", (event) => {
  if (/^\d$/.test(event.key)) {
    enterDigit(event.key);
  } else if (event.key === "." || event.key === ",") {
    enterDecimal();
  } else if (event.key === "+") {
    chooseOperator("+");
  } else if (event.key === "-") {
    chooseOperator("−");
  } else if (event.key === "*") {
    chooseOperator("×");
  } else if (event.key === "/") {
    event.preventDefault();
    chooseOperator("÷");
  } else if (event.key === "Enter" || event.key === "=") {
    event.preventDefault();
    calculateResult();
  } else if (event.key === "Backspace") {
    applyAction("backspace");
  } else if (event.key === "Escape" || event.key === "Delete") {
    clearCalculator();
  } else if (event.key === "%") {
    applyAction("percent");
  }
});

render();
