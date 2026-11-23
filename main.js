const OP_ADD = "+";
const OP_SUB = "-";
const OP_MUL = "*";
const OP_DIV = "/";

const MAX_NR_OF_DIGITS = 19;

// TODO: maybe store state in object ?
const STATE_UNSET = "unset"; // no input yet
const STATE_NUMBER_1 = "number 1";
const STATE_NUMBER_2 = "number 2";
const STATE_OPERATOR = "operator";
const STATE_RESULT = "result";
const STATE_DIVISION_BY_ZERO = "div by zero error";

class DivisionByZeroError extends Error {};

class Operand{
  constructor(value) {
    // TODO: what if value.length > MAX_NR_OF_DIGITS ??
    this.value = value ?? "";
  }

  append(x) {
    if ((this.value + x).length < MAX_NR_OF_DIGITS) {
      this.value += x;
    }
  }

  removeLastDigit() {
    this.value = this.value.slice(0, this.value.length - 1);
  }

  getValue() {
    return this.value;
  }

  setValue(x) {
    this.value = x;
  }

  reset() {
    this.value = "";
  }

  toView() {
    return this.value;
  }

  toNumber() {
    return Number(this.value);
  }

  isUnset() {
    return (this.value === "");
  }

  isZero() {
    return (this.value === 0);
  }

  add(other) {
    return new Operand(this.toNumber() + other.toNumber());
  }

  subtract(other) {
    return new Operand(this.toNumber() - other.toNumber());
  }

  multiply(other) {
    return new Operand(this.toNumber() * other.toNumber());
  }

  unsafeDivision(other) {
    if (other.toNumber() === 0) {
      throw DivisionByZeroError;
    } else {
      return new Operand(this.toNumber() / other.toNumber());
    }
  }

  addDecimalPoint() {
    if (!this.value.includes(".")) {
      this.value += ".";
    }
  }
}

// calculator state
let number_1 = new Operand();
let number_2 = new Operand();
let currentResult = new Operand();
let operator = "";
let currentState = STATE_NUMBER_1;

const display = document.querySelector(".display");
const buttons = document.querySelector(".keypad");

function operate(op, a, b) {
  switch (op) {
    case OP_ADD:
      return a.add(b);
    case OP_SUB:
      return a.subtract(b);
    case OP_MUL:
      return a.multiply(b);
    case OP_DIV:
      return a.unsafeDivision(b);
  }
}

function resetState() {
  number_1.reset();
  number_2.reset();
  currentResult.reset();
  operator = "";
  currentState = STATE_UNSET;
}

buttons.addEventListener("click", (event) => {
  const btn = event.target;
  try {
    if (btn.classList.contains("digit")) {
      handleDigits(btn);
    } else if (btn.classList.contains("clear-all")) {
      handleClearAll();
    } else if (btn.classList.contains("clear-entry")) {
      handleClearEntry();
    } else if (btn.classList.contains("operator")) {
      handleOperator(btn);
    } else if (btn.classList.contains("equals")){
      handleEquals();
    } else if (btn.classList.contains("decimal")) {
      handleDecimalPoint();
    }
  } catch (DivisionByZeroError) {
    currentState = STATE_DIVISION_BY_ZERO;
  }
  updateView();
})

function handleDigits(btn) {
  const currentInput = btn.textContent;

  switch (currentState) {
    case STATE_UNSET:
      number_1.setValue(currentInput);
      currentState = STATE_NUMBER_1;
      break;
    case STATE_NUMBER_1:
      number_1.append(currentInput);
      break;
    case STATE_NUMBER_2:
      number_2.append(currentInput);
      break;
    case STATE_OPERATOR:
      number_2.setValue(currentInput);
      currentState = STATE_NUMBER_2;
      break;
    case STATE_RESULT:
      const tmp = currentInput;
      resetState();
      number_1.setValue(tmp);
      currentState = STATE_NUMBER_1;
      break;
  }
}

function handleOperator(btn) {
  const currentInput = btn.textContent;

  switch (currentState) {
    case STATE_UNSET:
      number_1.setValue("0");
      operator = currentInput;
      currentState = STATE_OPERATOR;
      break;
    case STATE_NUMBER_1:
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
      break;
  }
}

function continueWithResult(currentInput) {
  // if (currentState === STATE_DIVISION_BY_ZERO) {
  //   return;
  // }
  number_1.setValue(currentResult.getValue());
  operator = currentInput;
  currentState = STATE_OPERATOR;
}

function handleClearAll() {
  resetState();
}

function handleClearEntry() {
  switch (currentState) {
    case STATE_NUMBER_1:
      number_1.removeLastDigit();
      break;
    case STATE_NUMBER_2:
      number_2.removeLastDigit();
      if (number_2.isUnset()) {
        currentState = STATE_OPERATOR;
      }
      break;
    case STATE_OPERATOR:
      operator = "";
      currentState = STATE_NUMBER_1;
      break;
  }
}

function handleEquals() {
  if (currentState === STATE_NUMBER_1) {
    // user enters a number and hits equals => that just evaluates to the entered number
    currentResult.setValue(number_1.getValue());
  } else {
    evaluateResult();
  }
}

function isDividingByZero() {
  return (operator === OP_DIV && number_2.isZero());
}

function evaluateResult() {
  if (number_1.isUnset() || number_2.isUnset() || operator === null) {
    // cannot evaluate if either operand or the operator are missing
    return;
  }
  currentResult = operate(operator, number_1, number_2);
  currentState = STATE_RESULT;
}

function updateView() {
  let msg = "";

  switch (currentState) {
    case STATE_NUMBER_1:
      msg = number_1.toView();
      break
    case STATE_NUMBER_2:
      msg = `${number_1.toView()} ${operator} ${number_2.toView()}`
      break;
    case STATE_OPERATOR:
      msg = `${number_1.toView()} ${operator}`
      break;
    case STATE_RESULT:
      msg = currentResult.toView();
      break;
    case STATE_DIVISION_BY_ZERO:
      msg = "DIVISION BY ZERO!";
      break;
  }

  display.textContent = msg;
}

function handleDecimalPoint() {
  switch (currentState) {
    case STATE_NUMBER_1:
      number_1.addDecimalPoint();
      break;
    case STATE_NUMBER_2:
      number_2.addDecimalPoint();
      break
  }
}
