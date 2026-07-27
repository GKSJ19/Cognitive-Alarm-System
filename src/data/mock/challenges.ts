/**
 * Mock challenge generators.
 * -----------------------------------------------------------------------
 * No backend exists for challenge generation yet, so every function here
 * produces a randomized-but-deterministic-enough question client-side.
 * Swap the bodies for real API calls later without touching the screens
 * that call them (see src/app/challenge/[type].tsx).
 * -----------------------------------------------------------------------
 */
import { ChallengeType, MultipleChoiceQuestion } from "@/types/challenge";

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildChoices(correct: number, spread = 10): { options: string[]; correctIndex: number } {
  const wrong = new Set<number>();
  while (wrong.size < 3) {
    const candidate = correct + randomInt(-spread, spread);
    if (candidate !== correct) wrong.add(candidate);
  }
  const options = shuffle([correct, ...wrong]).map(String);
  return { options, correctIndex: options.indexOf(String(correct)) };
}

function mathQuestion(): MultipleChoiceQuestion {
  const a = randomInt(4, 24);
  const b = randomInt(2, 18);
  const op = shuffle(["+", "-", "x"])[0];
  const answer = op === "+" ? a + b : op === "-" ? a - b : a * b;
  const { options, correctIndex } = buildChoices(answer, Math.max(6, Math.round(Math.abs(answer) * 0.2)));
  return { prompt: `${a} ${op} ${b} = ?`, options, correctIndex };
}

const LOGIC_SEQUENCES: { seq: number[]; next: number }[] = [
  { seq: [2, 4, 6, 8], next: 10 },
  { seq: [1, 2, 4, 8], next: 16 },
  { seq: [3, 6, 9, 12], next: 15 },
  { seq: [1, 4, 9, 16], next: 25 },
  { seq: [5, 10, 20, 40], next: 80 },
];

function logicQuestion(): MultipleChoiceQuestion {
  const item = shuffle(LOGIC_SEQUENCES)[0];
  const { options, correctIndex } = buildChoices(item.next, Math.max(5, Math.round(item.next * 0.3)));
  return { prompt: `${item.seq.join(", ")}, ?`, options, correctIndex };
}

const WORDS = ["MORNING", "FOCUS", "SUNRISE", "ENERGY", "AWAKE", "ROUTINE", "MINDSET"];

function scramble(word: string): string {
  let s = word;
  while (s === word) {
    s = shuffle(word.split("")).join("");
  }
  return s;
}

function wordQuestion(): { scrambled: string; answer: string } {
  const word = shuffle(WORDS)[0];
  return { scrambled: scramble(word), answer: word };
}

const RIDDLES: MultipleChoiceQuestion[] = [
  { prompt: "The more you take, the more you leave behind. What am I?", options: ["Footsteps", "Time", "Money", "Shadows"], correctIndex: 0 },
  { prompt: "I have hands but no arms, a face but no eyes. What am I?", options: ["A doll", "A clock", "A statue", "A glove"], correctIndex: 1 },
  { prompt: "What has a neck but no head?", options: ["A bottle", "A shirt", "A guitar", "A road"], correctIndex: 0 },
  { prompt: "What gets wetter as it dries?", options: ["A sponge", "A towel", "Rain", "Soap"], correctIndex: 1 },
];

const QUIZ_QUESTIONS: MultipleChoiceQuestion[] = [
  { prompt: "How many hours of sleep do most adults need per night?", options: ["4-5", "7-9", "10-12", "2-3"], correctIndex: 1 },
  { prompt: "Which habit most improves wake-up consistency?", options: ["Random bedtime", "Fixed wake time", "Skipping breakfast", "Late caffeine"], correctIndex: 1 },
  { prompt: "What is REM sleep primarily associated with?", options: ["Dreaming", "Deep muscle repair", "Digestion", "Blood pressure drop"], correctIndex: 0 },
];

export function getMultipleChoiceQuestion(type: ChallengeType): MultipleChoiceQuestion {
  if (type === "logic") return logicQuestion();
  if (type === "riddle") return shuffle(RIDDLES)[0];
  if (type === "quiz") return shuffle(QUIZ_QUESTIONS)[0];
  return mathQuestion();
}

export function getWordQuestion() {
  return wordQuestion();
}

export function getMemorySequence(length = 5): number[] {
  return Array.from({ length }, () => randomInt(1, 9));
}

export const SEQUENCE_ICONS = ["weather-sunny", "moon-waning-crescent", "star-outline", "water", "leaf", "coffee-outline"] as const;

export function getImageSequence(length = 4): number[] {
  const indices: number[] = [];
  for (let i = 0; i < length; i++) indices.push(randomInt(0, SEQUENCE_ICONS.length - 1));
  return indices;
}

export const PATTERN_SHAPES = ["circle", "square", "triangle", "hexagon"] as const;

export function getPatternQuestion(): { sequence: number[]; options: number[]; correctIndex: number } {
  // A simple repeating pattern with one slot to fill in.
  const cycle = shuffle([0, 1, 2, 3]).slice(0, 2);
  const sequence = [cycle[0], cycle[1], cycle[0], cycle[1], cycle[0]];
  const correctValue = cycle[1];
  const options = shuffle([0, 1, 2, 3]);
  return { sequence, options, correctIndex: options.indexOf(correctValue) };
}
