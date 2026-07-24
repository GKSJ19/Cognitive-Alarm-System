# Feature Specification — Milestone 2

## 🧠 Cognitive Challenge Categories (7 Total)

### 1. Mathematical Problems (`math`)
- **Sub-types**: Arithmetic, Percentages, Algebra.
- **Easy**: Single-operator addition/subtraction ($A \pm B$).
- **Medium**: Multi-operator arithmetic ($A \times B + C$) and clean percentages ($20\%$ of $150$).
- **Hard**: Linear algebra ($Ax + B = C$) and complex percentages.

### 2. Logic Puzzles (`logic`)
- **Sub-types**: Number Patterns, Logical Reasoning, Missing Elements.
- **Easy**: Simple progressions ($2, 4, 6, 8, ?$) and odd-one-out.
- **Medium**: Multiplicative patterns, Fibonacci sequences, deductive syllogisms.
- **Hard**: Quadratic progressions, prime sequences, truth-teller logic puzzles.

### 3. Memory Challenges (`memory`)
- **Sub-types**: Number Recall, Word Lists, Grid Position Memory, Image Sequences.
- **Easy**: 4 digits or 3 words displayed for 4–5 seconds.
- **Medium**: 6 digits or 4 words or 4×4 grid position memory.
- **Hard**: 8 digits or 5 words or 5×5 grid position memory.

### 4. Word Games (`word_games`)
- **Sub-types**: Unscramble Words, Synonyms, Antonyms, Vocabulary Completion.
- **Unscramble**: Scrambled letters (e.g., `E-P-P-L-A` $\rightarrow$ `APPLE`).
- **Synonyms / Antonyms**: Select or type exact matching terms.
- **Vocabulary**: Fill-in-the-blank sentence completion.

### 5. Pattern Recognition (`pattern_recognition`)
- **Sub-types**: Shape Sequences, Color Patterns, Number Progressions.
- **Visuals**: Sequences rendered as geometric shapes ($\bigcirc \rightarrow \square \rightarrow \Delta$) or HSL color swatches.

### 6. Riddles (`riddles`)
- **Sub-types**: Short Reasoning, Everyday Logic.
- **Database**: Curated riddles categorized by difficulty level (e.g., *"I have hands but can't clap. What am I?"* $\rightarrow$ `clock`).

### 7. Quick Quizzes (`quick_quiz`)
- **Sub-types**: General Knowledge, Science & Tech.
- **Format**: Multiple-Choice Questions (MCQ) with 4 options.

---

## 📈 Adaptive Difficulty Algorithm
- Evaluates the user's last 5 attempts in the requested category.
- **$\ge 80\%$ success rate**: Promotes to **Hard**.
- **$\ge 50\%$ success rate**: Maintains or promotes to **Medium**.
- **$< 50\%$ success rate**: Adjusts to **Easy**.

---

## 🏅 Gamification System
- **Base Score**: Easy = 10, Medium = 20, Hard = 30.
- **Time Bonus**: $\max(0, 15 - \text{seconds\_taken})$ for correct answers.
- **XP Multiplier**: Easy = $1\times$, Medium = $2\times$, Hard = $3\times$.
- **15 Unlockable Badges**: Streak milestones (3, 7, 14, 30 days), category mastery (20 solves per category), total XP milestones (1000, 5000 XP).
