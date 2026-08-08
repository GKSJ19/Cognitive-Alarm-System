/**
 * Maps 1:1 to the backend's actual challenge categories (see
 * app/models/challenge.py ChallengeType enum / challenge.api.ts). The
 * backend only ever returns a free-text question + free-text answer for
 * every category — there are no multiple-choice options, no images, and no
 * separate "sequence recall" mechanic on the server. `icon` here is purely
 * cosmetic (picked client-side per category for the ringing/challenge UI).
 */
export type ChallengeType = "math" | "logic" | "memory" | "word_game" | "pattern" | "riddle" | "quiz";

export interface ChallengeMeta {
  type: ChallengeType;
  title: string;
  description: string;
  icon: string;
}

export const CHALLENGE_CATALOG: ChallengeMeta[] = [
  { type: "math", title: "Math Challenge", description: "Solve the problem to silence the alarm.", icon: "calculator-variant-outline" },
  { type: "logic", title: "Logic Challenge", description: "Work out the answer to dismiss the alarm.", icon: "puzzle-outline" },
  { type: "memory", title: "Memory Challenge", description: "Recall correctly to dismiss the alarm.", icon: "dots-grid" },
  { type: "word_game", title: "Word Challenge", description: "Answer the word puzzle correctly.", icon: "alphabetical-variant" },
  { type: "pattern", title: "Pattern Challenge", description: "Figure out the pattern to continue.", icon: "shape-outline" },
  { type: "riddle", title: "Riddle Challenge", description: "Answer the riddle correctly.", icon: "head-question-outline" },
  { type: "quiz", title: "Quiz Challenge", description: "Answer the question correctly.", icon: "help-circle-outline" },
];

export function getChallengeMeta(type: string): ChallengeMeta {
  return (
    CHALLENGE_CATALOG.find((c) => c.type === type) ?? {
      type: type as ChallengeType,
      title: "Wake-Up Challenge",
      description: "Answer correctly to dismiss the alarm.",
      icon: "help-circle-outline",
    }
  );
}
