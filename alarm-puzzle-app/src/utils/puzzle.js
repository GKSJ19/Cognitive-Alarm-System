// Generates a math puzzle whose difficulty scales with `level` (1-5)

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generatePuzzle(level = 2) {
  const opSet =
    level <= 1
      ? ['+', '-']
      : level <= 3
      ? ['+', '-', '*']
      : ['+', '-', '*', '/'];

  const op = opSet[randInt(0, opSet.length - 1)];
  let a, b, answer, question;

  switch (op) {
    case '+':
      a = randInt(10 * level, 50 * level);
      b = randInt(10 * level, 50 * level);
      answer = a + b;
      question = `${a} + ${b}`;
      break;
    case '-':
      a = randInt(10 * level, 50 * level);
      b = randInt(1, a);
      answer = a - b;
      question = `${a} - ${b}`;
      break;
    case '*':
      a = randInt(2, 9 + level);
      b = randInt(2, 9 + level);
      answer = a * b;
      question = `${a} \u00d7 ${b}`;
      break;
    case '/':
      b = randInt(2, 9 + level);
      answer = randInt(2, 12);
      a = b * answer;
      question = `${a} \u00f7 ${b}`;
      break;
  }

  return { question, answer };
}
