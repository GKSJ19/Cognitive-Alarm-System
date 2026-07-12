-- =====================================================
-- CHALLENGES
-- =====================================================

INSERT INTO challenges
(
    type,
    goal_type,
    difficulty,
    question,
    correct_answer,
    source,
    embedding_ref
)
VALUES

(
    'math',
    'study',
    'easy',
    '12 + 18 = ?',
    '30',
    'question_bank',
    NULL
),

(
    'memory',
    'study',
    'medium',
    'Remember 2849',
    '2849',
    'question_bank',
    NULL
),

(
    'logic',
    'study',
    'hard',
    'Which number comes next? 2 4 8 16 ?',
    '32',
    'question_bank',
    NULL
),

(
    'pattern',
    'study',
    'medium',
    'A B C ?',
    'D',
    'question_bank',
    NULL
),

(
    'word_game',
    'study',
    'easy',
    'Unscramble: TCA',
    'CAT',
    'question_bank',
    NULL
);
