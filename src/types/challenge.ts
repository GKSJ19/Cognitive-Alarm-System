export type ChallengeType =
  | "math"
  | "logic"
  | "word"
  | "riddle"
  | "quiz"
  | "memory-sequence"
  | "image-sequence"
  | "pattern";

export interface ChallengeMeta {
  type: ChallengeType;
  title: string;
  description: string;
  icon: string;
}

export const CHALLENGE_CATALOG: ChallengeMeta[] = [
  { type: "math", title: "Math Challenge", description: "Solve the equation to silence the alarm.", icon: "calculator-variant-outline" },
  { type: "logic", title: "Logic Challenge", description: "Complete the logical sequence.", icon: "puzzle-outline" },
  { type: "word", title: "Word Challenge", description: "Unscramble the hidden word.", icon: "alphabetical-variant" },
  { type: "riddle", title: "Riddle Challenge", description: "Answer the riddle correctly.", icon: "head-question-outline" },
  { type: "quiz", title: "Quiz Challenge", description: "Pick the correct answer.", icon: "help-circle-outline" },
  { type: "memory-sequence", title: "Memory Sequence", description: "Repeat the sequence you saw.", icon: "dots-grid" },
  { type: "image-sequence", title: "Image Sequence Recall", description: "Recall the order of images.", icon: "image-multiple-outline" },
  { type: "pattern", title: "Pattern Recognition", description: "Pick the shape that completes the pattern.", icon: "shape-outline" },
];

export interface MultipleChoiceQuestion {
  prompt: string;
  options: string[];
  correctIndex: number;
}
