const OP_ADD = "+";
const OP_SUB = "-";
const OP_MUL = "*";
const OP_DIV = "/";

const MAX_NR_OF_DIGITS = 19;

// TODO: maybe store state in object ?
const STATE_NUMBER_1 = "number 1";
const STATE_NUMBER_2 = "number 2";
const STATE_OPERATOR = "operator";
const STATE_RESULT = "result";
const STATE_DIVISION_BY_ZERO = "div by zero error";

// calculator state
let number_1 = "";
let number_2 = "";
let operator = "";
let currentResult = null;
let currentState = STATE_NUMBER_1;

// TODO: use map/object to map operations -> function ?
function add(a, b) { return a + b; }
function subtract(a, b) { return a - b; }
function multiply(a, b) { return a * b; }
function divide(a, b) { return a / b; }

function operate(op, a, b) {
  let x = Number(a);
  let y = Number(b);

  switch (op) {
    case OP_ADD:
      return add(x, y);
    case OP_SUB:
      return subtract(x, y);
    case OP_MUL:
      return multiply(x, y);
    case OP_DIV:
      return divide(x, y);
  }
}

function resetState() {
  number_1 = "";
  number_2 = "";
  operator = "";
  currentState = STATE_NUMBER_1;
  currentResult = "";
}

const display = document.querySelector(".display");

const buttons = document.querySelector(".keypad");

buttons.addEventListener("click", (event) => {
  let btn = event.target;

  if (failedToClearZeroDivisionError(btn)) {
    currentState = STATE_DIVISION_BY_ZERO;
  } else if (btn.classList.contains("digit")) {
    handleDigits(btn);
  } else if (btn.classList.contains("operator")) {
    handleOperator(btn);
  } else if (btn.classList.contains("clear")) {
    handleClear();
  } else if (btn.classList.contains("equals")){
    handleEquals();
  }
  updateView();
})

function failedToClearZeroDivisionError(btn) {
  let zero = isDividingByZero() || currentState === STATE_DIVISION_BY_ZERO;
  return (zero && !btn.classList.contains("clear")) 

}

function handleDigits(btn) {
  const currentInput = btn.textContent;
  let tmp;

  switch (currentState) {
    case STATE_NUMBER_1:
      tmp = number_1 + currentInput;
      if (tmp.length < MAX_NR_OF_DIGITS) {
        number_1 = tmp;
      } 
      break;
    case STATE_NUMBER_2:
      tmp = number_2 + currentInput;
      if (tmp.length < MAX_NR_OF_DIGITS) {
        number_2 = tmp;
      } 
      break;
    case STATE_OPERATOR:
      number_2 = currentInput;
      currentState = STATE_NUMBER_2;
      break;
    case STATE_RESULT:
      number_1 = currentInput;
      currentState = STATE_NUMBER_1;
  }
}

function handleOperator(btn) {
  const currentInput = btn.textContent;

  switch (currentState) {
    case STATE_NUMBER_1:
      if (number_1 === null) {
        return;
      }
      operator = currentInput;
      currentState = STATE_OPERATOR;
      break;
    case STATE_NUMBER_2:
      evaluateResult();
      continueWithResult(currentInput);
      break;
    case STATE_OPERATOR:
      operator = currentInput;
      break;
    case STATE_RESULT:
      continueWithResult(currentInput);
  }
}

function continueWithResult(currentInput) {
  number_1 = currentResult;
  operator = currentInput;
  currentState = STATE_OPERATOR;
}

function handleClear() {
  resetState();
}

function handleEquals() {
  if (currentState === STATE_NUMBER_1) {
    currentResult = number_1;
  } else {
    evaluateResult();
  }
}

function isDividingByZero() {
  return (operator === OP_DIV && number_2 === '0');
}

function evaluateResult() {
  if (isDividingByZero()) {
    currentState = STATE_DIVISION_BY_ZERO;
    return
  } else if (number_1 !== null && number_2 !== null && operator !== null) {
    let result = String(operate(operator, number_1, number_2));
    result = ensureWithinBounds(result);
    currentResult = result;
    currentState = STATE_RESULT;
  }
}

function ensureWithinBounds(result) {
  if (result.length <= MAX_NR_OF_DIGITS) {
    return result
  }
  if (result.includes("e")) {
    const idx = result.indexOf("e");
    return result.slice(0, 5) + result.slice(idx - 1);
  }
  alert("Could not properly trim result");
  return result
}

function updateView() {
  let msg = "";

  switch (currentState) {
    case STATE_NUMBER_1:
      msg = number_1;
      break
    case STATE_NUMBER_2:
      msg = `${number_1} ${operator} ${number_2}`
      break;
    case STATE_OPERATOR:
      msg = `${number_1} ${operator}`
      break;
    case STATE_RESULT:
      msg = currentResult;
      break;
    case STATE_DIVISION_BY_ZERO:
      msg = "DIVISION BY ZERO!";
      break;
  }

  display.textContent = msg;
}

