const OP_ADD = "+";
const OP_SUB = "-";
const OP_MUL = "*";
const OP_DIV = "/";

const MAX_INPUT_LENGTH = 18;

// TODO: maybe store state in object ?
const STATE_UNSET = "unset"; // no input yet
const STATE_OPERAND_1 = "number 1";
const STATE_OPERAND_2 = "number 2";
const STATE_OPERATOR = "operator";
const STATE_RESULT = "result";
const STATE_DIVISION_BY_ZERO = "div by zero error";

class DivisionByZeroError extends Error {
  constructor(message) {
    super(message);
    this.name = "DivisionByZeroError";
  }
};

class Operand{
  constructor(value) {
    // TODO: what if value.length > MAX_INPUT_LENGTH ??
    this.value = String(value ?? "");
  }

  append(x) {
    if ((this.value + x).length <= MAX_INPUT_LENGTH) {
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
    this.value = String(x);
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
      throw new DivisionByZeroError();
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
let operand_1 = new Operand();
let operand_2 = new Operand();
let currentResult = new Operand();
let operator = "";
let currentState = STATE_OPERAND_1;

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
  operand_1.reset();
  operand_2.reset();
  currentResult.reset();
  operator = "";
  currentState = STATE_UNSET;
}

const keys = {
  "digit": (digit) => handleDigits(digit),
  "operator": (op) => handleOperator(op),
  "clear-all": handleClearAll,
  "clear-entry": handleClearEntry,
  "equals": handleEquals,
  "decimal": handleDecimalPoint,
  "reset": resetState,
}

function handleKey(action, key) {
  try {
    keys[action]?.(key);
  } catch (err) {
    if (err instanceof DivisionByZeroError) {
      resetState();
      currentState = STATE_DIVISION_BY_ZERO;
    } else {
      throw err;
    }
  } finally {
    updateView();
  }
}

buttons.addEventListener("click", (event) => {
  const btn = event.target;

  
  if (btn.classList.contains("operator")) {
    handleKey("operator", btn.textContent);
  } else if (btn.classList.contains("equals")){
    handleKey("equals");
  } else {
    if (btn.classList.length > 1) {
      console.error(`Expected only 1 CSS class, got: ${btn.classList.length}:\n${btn.classList}`);
    }
    handleKey(btn.className, btn.textContent);
  }
})

document.body.addEventListener("keydown", (event) => {
  const key = event.key;

  if ("0123456789".includes(key)) {
    handleKey("digit", key);
  } else if ("+-*/".includes(key)) {
    handleKey("operator", key);
  } else if (key === "=") {
    handleKey("equals");
  } else if (key === "Delete" || key === "Backspace") {
    handleKey("clear-entry");
  } else if (".,".includes(key)) {
    handleKey("decimal");
  } else if (key === "Enter") {
    handleKey("equals");
  } else if (key === "Escape") {
    handleKey("reset");
  }
})

function handleDigits(digit) {
  switch (currentState) {
    case STATE_UNSET:
      operand_1.setValue(digit);
      currentState = STATE_OPERAND_1;
      break;
    case STATE_OPERAND_1:
      operand_1.append(digit);
      break;
    case STATE_OPERAND_2:
      operand_2.append(digit);
      break;
    case STATE_OPERATOR:
      operand_2.setValue(digit);
      currentState = STATE_OPERAND_2;
      break;
    case STATE_RESULT:
      resetState();
      operand_1.setValue(digit);
      currentState = STATE_OPERAND_1;
      break;
  }
}

function handleOperator(op) {
  switch (currentState) {
    case STATE_UNSET:
      operand_1.setValue("0");
      operator = op;
      currentState = STATE_OPERATOR;
      break;
    case STATE_OPERAND_1:
      operator = op;
      currentState = STATE_OPERATOR;
      break;
    case STATE_OPERAND_2:
      evaluateResult();
      continueWithResult(op);
      break;
    case STATE_OPERATOR:
      operator = op;
      break;
    case STATE_RESULT:
      continueWithResult(op);
      break;
  }
}

function continueWithResult(nextOperator) {
  operand_1.setValue(currentResult.getValue());
  operator = nextOperator;
  currentState = STATE_OPERATOR;
}

function handleClearAll() {
  resetState();
}

function handleClearEntry() {
  switch (currentState) {
    case STATE_OPERAND_1:
      operand_1.removeLastDigit();
      break;
    case STATE_OPERAND_2:
      operand_2.removeLastDigit();
      if (operand_2.isUnset()) {
        currentState = STATE_OPERATOR;
      }
      break;
    case STATE_OPERATOR:
      operator = "";
      currentState = STATE_OPERAND_1;
      break;
    case STATE_RESULT:
      currentResult.removeLastDigit();
      break;
  }
}

function handleEquals() {
  if (currentState === STATE_OPERAND_1) {
    // user enters a number and hits equals => that just evaluates to the entered number
    currentResult.setValue(operand_1.getValue());
  } else {
    evaluateResult();
  }
}

function isDividingByZero() {
  return (operator === OP_DIV && operand_2.isZero());
}

function evaluateResult() {
  if (
    operand_1.isUnset()
    || operand_2.isUnset()
    || !operator
  ) {
    // cannot evaluate if either operand or the operator are missing
    return;
  }
  currentResult = operate(operator, operand_1, operand_2);
  currentState = STATE_RESULT;
}

function updateView() {
  let msg = "";

  switch (currentState) {
    case STATE_OPERAND_1:
      msg = operand_1.toView();
      break
    case STATE_OPERAND_2:
      msg = `${operand_1.toView()} ${operator} ${operand_2.toView()}`
      break;
    case STATE_OPERATOR:
      msg = `${operand_1.toView()} ${operator}`
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
    case STATE_OPERAND_1:
      operand_1.addDecimalPoint();
      break;
    case STATE_OPERAND_2:
      operand_2.addDecimalPoint();
      break
  }
}
