const OP_ADD = "+";
const OP_SUB = "-";
const OP_MUL = "*";
const OP_DIV = "/";

// TODO: maybe store state in object ?
const STATE_NUMBER_1 = "number 1";
const STATE_NUMBER_2 = "number 2";
const STATE_OPERATOR = "operator";
const STATE_RESULT = "result";

// calculator state
let number_1 = null;
let number_2 = null;
let operator = null;
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
  number_1 = null;
  number_2 = null;
  operator = null;
  currentState = STATE_NUMBER_1;
  currentResult = "";
}

const display = document.querySelector(".display");

const buttons = document.querySelector(".buttons");

buttons.addEventListener("click", (event) => {
  let btn = event.target;

  if (btn.classList.contains("digit")) {
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

function handleDigits(btn) {
  const currentInput = btn.textContent;

  switch (currentState) {
    case STATE_NUMBER_1:
      number_1 = (number_1 ?? "") + currentInput;
      break;
    case STATE_NUMBER_2:
      number_2 = (number_2 ?? "") + currentInput;
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
      handleEquals();
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
  updateView();
}

function handleEquals() {
  if (number_1 !== null && number_2 !== null && operator !== null) {
    let result = operate(operator, number_1, number_2);
    currentResult = result;
    currentState = STATE_RESULT;
  }
}

function updateView() {
  let msg = "ERROR";

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
  }

  display.textContent = msg;
}

