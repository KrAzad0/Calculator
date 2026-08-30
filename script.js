const resultDisplay = document.getElementById('result');
const historyDisplay = document.getElementById('history');
const keypad = document.getElementById('keypad');
const themeToggle = document.getElementById('themeToggle');

let expression = '';
let justEvaluated = false;
let lastCalculation = '';

const operators = ['+', '-', '*', '/'];

function pretty(text) {
  return text
    .replaceAll('*', '×')
    .replaceAll('/', '÷')
    .replaceAll('-', '−');
}

function formatNumber(value) {
  if (!Number.isFinite(value)) throw new Error('Math error');
  if (Object.is(value, -0)) value = 0;

  const abs = Math.abs(value);
  if ((abs !== 0 && abs < 1e-9) || abs >= 1e12) {
    return value.toExponential(8).replace(/\.0+e/, 'e').replace(/(\.\d*?)0+e/, '$1e');
  }

  return Number(value.toPrecision(12)).toString();
}

function evaluate(input) {
  let i = 0;

  function skipSpaces() {
    while (input[i] === ' ') i++;
  }

  function parseExpression() {
    let value = parseTerm();
    skipSpaces();

    while (input[i] === '+' || input[i] === '-') {
      const op = input[i++];
      const right = parseTerm();
      value = op === '+' ? value + right : value - right;
      skipSpaces();
    }
    return value;
  }

  function parseTerm() {
    let value = parseFactor();
    skipSpaces();

    while (input[i] === '*' || input[i] === '/') {
      const op = input[i++];
      const right = parseFactor();
      if (op === '/' && right === 0) throw new Error('Cannot divide by zero');
      value = op === '*' ? value * right : value / right;
      skipSpaces();
    }
    return value;
  }

  function parseFactor() {
    skipSpaces();
    let sign = 1;

    while (input[i] === '+' || input[i] === '-') {
      if (input[i] === '-') sign *= -1;
      i++;
      skipSpaces();
    }

    let value = parseNumber() * sign;
    skipSpaces();

    while (input[i] === '%') {
      value /= 100;
      i++;
      skipSpaces();
    }

    return value;
  }

  function parseNumber() {
    skipSpaces();
    const start = i;
    let dots = 0;

    while (i < input.length && /[0-9.]/.test(input[i])) {
      if (input[i] === '.') dots++;
      if (dots > 1) throw new Error('Invalid number');
      i++;
    }

    if (start === i || input.slice(start, i) === '.') throw new Error('Incomplete expression');
    return Number(input.slice(start, i));
  }

  const value = parseExpression();
  skipSpaces();
  if (i !== input.length) throw new Error('Invalid expression');
  return value;
}

function currentNumberSegment() {
  let end = expression.length;
  let start = end;

  while (start > 0 && /[0-9.]/.test(expression[start - 1])) start--;
  return { start, end, value: expression.slice(start, end) };
}

function updateDisplay(message = null) {
  resultDisplay.textContent = message ?? (expression ? pretty(expression) : '0');
  historyDisplay.textContent = lastCalculation || '\u00a0';
  resultDisplay.scrollLeft = resultDisplay.scrollWidth;
}

function appendDigit(value) {
  if (justEvaluated) {
    expression = '';
    lastCalculation = '';
    justEvaluated = false;
  }

  if (value === '.') {
    const segment = currentNumberSegment().value;
    if (segment.includes('.')) return;
    if (!segment) expression += '0';
  }

  const segment = currentNumberSegment();
  if (value !== '.' && segment.value === '0' && !segment.value.includes('.')) {
    expression = expression.slice(0, segment.start) + value;
  } else {
    expression += value;
  }

  updateDisplay();
}

function appendOperator(op) {
  if (!expression && op === '-') {
    expression = '-';
    justEvaluated = false;
    updateDisplay();
    return;
  }
  if (!expression) return;

  if (justEvaluated) justEvaluated = false;

  const last = expression.at(-1);
  if (operators.includes(last)) {
    expression = expression.slice(0, -1) + op;
  } else if (last === '.') {
    expression += '0' + op;
  } else if (last !== '%') {
    expression += op;
  } else {
    expression += op;
  }

  updateDisplay();
}

function appendPercent() {
  if (!expression || operators.includes(expression.at(-1)) || expression.at(-1) === '.') return;
  if (justEvaluated) justEvaluated = false;
  expression += '%';
  updateDisplay();
}

function clearAll() {
  expression = '';
  lastCalculation = '';
  justEvaluated = false;
  updateDisplay();
}

function deleteLast() {
  if (justEvaluated) {
    clearAll();
    return;
  }
  expression = expression.slice(0, -1);
  updateDisplay();
}

function toggleSign() {
  if (!expression) {
    expression = '-';
    updateDisplay();
    return;
  }

  if (justEvaluated) justEvaluated = false;

  let end = expression.length;
  const hadPercent = expression.at(-1) === '%';
  if (hadPercent) end--;

  let start = end;
  while (start > 0 && /[0-9.]/.test(expression[start - 1])) start--;
  if (start === end) return;

  const signIndex = start - 1;
  const canBeUnaryMinus = signIndex >= 0 && expression[signIndex] === '-' &&
    (signIndex === 0 || operators.includes(expression[signIndex - 1]));

  if (canBeUnaryMinus) {
    expression = expression.slice(0, signIndex) + expression.slice(start);
  } else {
    expression = expression.slice(0, start) + '-' + expression.slice(start);
  }

  updateDisplay();
}

function calculate() {
  if (!expression) return;
  while (operators.includes(expression.at(-1)) || expression.at(-1) === '.') {
    expression = expression.slice(0, -1);
  }
  if (!expression || expression === '-') return;

  try {
    const original = expression;
    const value = evaluate(expression);
    const formatted = formatNumber(value);
    lastCalculation = `${pretty(original)} =`;
    expression = formatted;
    justEvaluated = true;
    updateDisplay();
  } catch (error) {
    lastCalculation = pretty(expression);
    expression = '';
    justEvaluated = true;
    updateDisplay(error.message === 'Cannot divide by zero' ? 'Cannot divide by zero' : 'Error');
  }
}

function handleValue(value) {
  if (/^[0-9.]$/.test(value)) appendDigit(value);
  else if (operators.includes(value)) appendOperator(value);
  else if (value === '%') appendPercent();
}

keypad.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  const { value, action } = button.dataset;
  if (value) handleValue(value);
  if (action === 'clear') clearAll();
  if (action === 'delete') deleteLast();
  if (action === 'sign') toggleSign();
  if (action === 'equals') calculate();
});

function flashKey(selector) {
  const key = document.querySelector(selector);
  if (!key) return;
  key.classList.add('is-pressed');
  setTimeout(() => key.classList.remove('is-pressed'), 90);
}

document.addEventListener('keydown', (event) => {
  const key = event.key;

  if (/^[0-9.]$/.test(key)) {
    handleValue(key);
    flashKey(`[data-value="${key}"]`);
    event.preventDefault();
  } else if (['+', '-', '*', '/', '%'].includes(key)) {
    handleValue(key);
    flashKey(`[data-value="${key}"]`);
    event.preventDefault();
  } else if (key === 'Enter' || key === '=') {
    calculate();
    flashKey('[data-action="equals"]');
    event.preventDefault();
  } else if (key === 'Backspace') {
    deleteLast();
    flashKey('[data-action="delete"]');
    event.preventDefault();
  } else if (key === 'Escape') {
    clearAll();
    flashKey('[data-action="clear"]');
    event.preventDefault();
  }
});

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeToggle.textContent = theme === 'dark' ? '☀' : '☾';
  themeToggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
}

const savedTheme = localStorage.getItem('calculator-theme');
const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
applyTheme(savedTheme || preferredTheme);

themeToggle.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('calculator-theme', next);
  applyTheme(next);
});

updateDisplay();
