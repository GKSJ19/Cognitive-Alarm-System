import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Brain, CheckCircle2, XCircle, RotateCcw, Flame, Trophy, Play } from 'lucide-react';

export interface ChallengeNode {
  id: string;
  label: string;
  category: string;
  position: 'top-left' | 'top-mid-left' | 'top-mid-right' | 'top-right' | 'bottom-left' | 'bottom-mid' | 'bottom-right';
}

const NODES: ChallengeNode[] = [
  { id: 'math', label: 'Mathematical Problems', category: 'Math', position: 'top-left' },
  { id: 'logic', label: 'Logic Puzzles', category: 'Logic', position: 'top-mid-left' },
  { id: 'memory', label: 'Memory Challenges', category: 'Memory', position: 'top-mid-right' },
  { id: 'word', label: 'Word Games', category: 'Word', position: 'top-right' },
  { id: 'pattern', label: 'Pattern Recognition', category: 'Pattern', position: 'bottom-left' },
  { id: 'riddle', label: 'Riddles', category: 'Riddle', position: 'bottom-mid' },
  { id: 'quiz', label: 'Quick Quizzes', category: 'Quiz', position: 'bottom-right' },
];

export const ChallengeEngineView: React.FC = () => {
  const { addCognitiveAttempt } = useApp();
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [selectedNode, setSelectedNode] = useState<ChallengeNode | null>(null);

  // Active Challenge State
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPuzzle, setCurrentPuzzle] = useState<{
    question: string;
    options?: string[];
    correctAnswer: string;
    explanation?: string;
    category: string;
  } | null>(null);

  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [solveTime, setSolveTime] = useState(0);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);

  const generatePuzzle = async (node: ChallengeNode) => {
    setSelectedNode(node);
    setIsGenerating(true);
    setCurrentPuzzle(null);
    setIsSubmitted(false);
    setUserAnswer('');
    setSolveTime(0);

    if (timerId) clearInterval(timerId);

    // Start timer
    const startTime = Date.now();
    const interval = setInterval(() => {
      setSolveTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    setTimerId(interval);

    try {
      const response = await fetch('/api/gemini/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeType: node.label,
          difficulty: difficulty,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const parsed = typeof data.text === 'string' ? JSON.parse(data.text) : data.text;
        setCurrentPuzzle(parsed);
      } else {
        throw new Error('API request failed');
      }
    } catch (e) {
      // Fallback puzzle generator
      setCurrentPuzzle(getFallbackPuzzle(node.id, difficulty));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSurpriseMe = () => {
    const randomIndex = Math.floor(Math.random() * NODES.length);
    generatePuzzle(NODES[randomIndex]);
  };

  const handleSubmitAnswer = (answer: string) => {
    if (isSubmitted || !currentPuzzle) return;

    if (timerId) clearInterval(timerId);

    const cleanUser = answer.trim().toLowerCase();
    const cleanCorrect = currentPuzzle.correctAnswer.trim().toLowerCase();
    const correct = cleanUser === cleanCorrect || cleanCorrect.includes(cleanUser);

    setIsCorrect(correct);
    setIsSubmitted(true);

    if (selectedNode) {
      addCognitiveAttempt({
        id: 'att-' + Date.now(),
        nodeType: selectedNode.id as any,
        nodeLabel: selectedNode.label,
        difficulty: difficulty,
        isCorrect: correct,
        solveTimeSeconds: solveTime || 8,
        timestamp: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="w-full bg-[#0B0E1B] text-slate-100 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 border border-slate-800/80 min-h-[680px] relative overflow-hidden font-sans">
      
      {/* Background Ambient Glows */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center space-y-2 relative z-10">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Cognitive Challenge Engine
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 font-mono tracking-wide">
          Pick a node. Solve the challenge. Powered by Gemini.
        </p>
      </div>

      {/* Mind Map Canvas Container */}
      <div className="relative w-full max-w-4xl mx-auto min-h-[360px] sm:min-h-[400px] my-6 flex items-center justify-center">
        
        {/* Connector SVG Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
          {/* Top Left Line */}
          <line x1="50%" y1="50%" x2="16%" y2="20%" stroke="#1E293B" strokeWidth="2" strokeDasharray="4 4" />
          {/* Top Mid Left Line */}
          <line x1="50%" y1="50%" x2="38%" y2="20%" stroke="#1E293B" strokeWidth="2" strokeDasharray="4 4" />
          {/* Top Mid Right Line */}
          <line x1="50%" y1="50%" x2="62%" y2="20%" stroke="#1E293B" strokeWidth="2" strokeDasharray="4 4" />
          {/* Top Right Line */}
          <line x1="50%" y1="50%" x2="84%" y2="20%" stroke="#1E293B" strokeWidth="2" strokeDasharray="4 4" />
          {/* Bottom Left Line */}
          <line x1="50%" y1="50%" x2="22%" y2="80%" stroke="#1E293B" strokeWidth="2" strokeDasharray="4 4" />
          {/* Bottom Mid Line */}
          <line x1="50%" y1="50%" x2="50%" y2="80%" stroke="#1E293B" strokeWidth="2" strokeDasharray="4 4" />
          {/* Bottom Right Line */}
          <line x1="50%" y1="50%" x2="78%" y2="80%" stroke="#1E293B" strokeWidth="2" strokeDasharray="4 4" />
        </svg>

        {/* Center Glowing Node */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center">
          <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 shadow-[0_0_60px_rgba(245,158,11,0.5)] flex flex-col items-center justify-center p-3 text-center border-4 border-amber-200/50 animate-pulse">
            <span className="text-xs sm:text-sm font-black text-slate-950 uppercase tracking-wider leading-tight">
              COGNITIVE<br />CHALLENGE<br />ENGINE
            </span>
          </div>
        </div>

        {/* Node Buttons Layout */}
        <div className="w-full h-full relative z-10 grid grid-cols-1 sm:grid-cols-12 gap-4 text-xs font-mono">
          
          {/* Top Row Nodes */}
          <div className="sm:col-span-12 flex flex-wrap justify-between items-center gap-3 sm:gap-2 px-2">
            
            {/* Mathematical Problems */}
            <button
              onClick={() => generatePuzzle(NODES[0])}
              className={`px-4 py-3 rounded-xl border transition-all text-left bg-[#12172D]/90 backdrop-blur-md hover:border-amber-400 hover:scale-105 ${
                selectedNode?.id === 'math' ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-slate-800 text-slate-200'
              }`}
            >
              <div className="font-bold text-white leading-snug">Mathematical<br />Problems</div>
              <div className="text-[10px] text-indigo-400 mt-1 flex items-center space-x-1">
                <span>generate</span>
                <span className="text-[8px]">►</span>
              </div>
            </button>

            {/* Logic Puzzles */}
            <button
              onClick={() => generatePuzzle(NODES[1])}
              className={`px-4 py-3 rounded-xl border transition-all text-left bg-[#12172D]/90 backdrop-blur-md hover:border-amber-400 hover:scale-105 ${
                selectedNode?.id === 'logic' ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-slate-800 text-slate-200'
              }`}
            >
              <div className="font-bold text-white leading-snug">Logic Puzzles</div>
              <div className="text-[10px] text-indigo-400 mt-1 flex items-center space-x-1">
                <span>generate</span>
                <span className="text-[8px]">►</span>
              </div>
            </button>

            {/* Memory Challenges */}
            <button
              onClick={() => generatePuzzle(NODES[2])}
              className={`px-4 py-3 rounded-xl border transition-all text-left bg-[#12172D]/90 backdrop-blur-md hover:border-amber-400 hover:scale-105 ${
                selectedNode?.id === 'memory' ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-slate-800 text-slate-200'
              }`}
            >
              <div className="font-bold text-white leading-snug">Memory<br />Challenges</div>
              <div className="text-[10px] text-indigo-400 mt-1 flex items-center space-x-1">
                <span>generate</span>
                <span className="text-[8px]">►</span>
              </div>
            </button>

            {/* Word Games */}
            <button
              onClick={() => generatePuzzle(NODES[3])}
              className={`px-4 py-3 rounded-xl border transition-all text-left bg-[#12172D]/90 backdrop-blur-md hover:border-amber-400 hover:scale-105 ${
                selectedNode?.id === 'word' ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-slate-800 text-slate-200'
              }`}
            >
              <div className="font-bold text-white leading-snug">Word Games</div>
              <div className="text-[10px] text-indigo-400 mt-1 flex items-center space-x-1">
                <span>generate</span>
                <span className="text-[8px]">►</span>
              </div>
            </button>

          </div>

          {/* Spacer for center circle */}
          <div className="sm:col-span-12 h-20 pointer-events-none" />

          {/* Bottom Row Nodes */}
          <div className="sm:col-span-12 flex flex-wrap justify-around items-center gap-3 sm:gap-4 px-2">
            
            {/* Pattern Recognition */}
            <button
              onClick={() => generatePuzzle(NODES[4])}
              className={`px-4 py-3 rounded-xl border transition-all text-left bg-[#12172D]/90 backdrop-blur-md hover:border-amber-400 hover:scale-105 ${
                selectedNode?.id === 'pattern' ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-slate-800 text-slate-200'
              }`}
            >
              <div className="font-bold text-white leading-snug">Pattern<br />Recognition</div>
              <div className="text-[10px] text-indigo-400 mt-1 flex items-center space-x-1">
                <span>generate</span>
                <span className="text-[8px]">►</span>
              </div>
            </button>

            {/* Riddles */}
            <button
              onClick={() => generatePuzzle(NODES[5])}
              className={`px-4 py-3 rounded-xl border transition-all text-left bg-[#12172D]/90 backdrop-blur-md hover:border-amber-400 hover:scale-105 ${
                selectedNode?.id === 'riddle' ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-slate-800 text-slate-200'
              }`}
            >
              <div className="font-bold text-white leading-snug">Riddles</div>
              <div className="text-[10px] text-indigo-400 mt-1 flex items-center space-x-1">
                <span>generate</span>
                <span className="text-[8px]">►</span>
              </div>
            </button>

            {/* Quick Quizzes */}
            <button
              onClick={() => generatePuzzle(NODES[6])}
              className={`px-4 py-3 rounded-xl border transition-all text-left bg-[#12172D]/90 backdrop-blur-md hover:border-amber-400 hover:scale-105 ${
                selectedNode?.id === 'quiz' ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-slate-800 text-slate-200'
              }`}
            >
              <div className="font-bold text-white leading-snug">Quick Quizzes</div>
              <div className="text-[10px] text-indigo-400 mt-1 flex items-center space-x-1">
                <span>generate</span>
                <span className="text-[8px]">►</span>
              </div>
            </button>

          </div>

        </div>

      </div>

      {/* Difficulty & Surprise Me Controls Bar */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-2 font-mono text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Difficulty</span>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as any)}
            className="bg-[#13182E] border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500 font-mono text-xs"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <button
          onClick={handleSurpriseMe}
          className="px-4 py-1.5 rounded-lg border border-teal-500/60 text-teal-300 hover:bg-teal-950/40 font-mono text-xs transition-all flex items-center space-x-1.5 active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>Surprise me</span>
        </button>
      </div>

      {/* Challenge Display & Solver Output Box */}
      <div className="max-w-3xl mx-auto bg-[#13182E] border border-[#1E2648] rounded-2xl p-6 shadow-xl min-h-[140px] flex items-center justify-center text-center font-mono">
        
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center space-y-3 text-slate-400 py-4">
            <Brain className="w-8 h-8 text-amber-400 animate-bounce" />
            <p className="text-xs">Generating your {difficulty} {selectedNode?.label} with Gemini...</p>
          </div>
        ) : !currentPuzzle ? (
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md">
            Click a node above (or "Surprise me") to generate your first challenge.
          </p>
        ) : (
          <div className="w-full text-left space-y-4">
            
            {/* Header info bar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-[11px] uppercase tracking-wider text-amber-400 font-bold px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                {selectedNode?.label || currentPuzzle.category} • {difficulty}
              </span>

              <div className="flex items-center space-x-3 text-xs text-slate-400">
                <span>Timer: <strong className="text-white font-mono">{solveTime}s</strong></span>
              </div>
            </div>

            {/* Question Text */}
            <div className="text-sm sm:text-base font-sans font-semibold text-white leading-snug">
              {currentPuzzle.question}
            </div>

            {/* Multiple Choice Options if available */}
            {currentPuzzle.options && currentPuzzle.options.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {currentPuzzle.options.map((option, idx) => (
                  <button
                    key={idx}
                    disabled={isSubmitted}
                    onClick={() => handleSubmitAnswer(option)}
                    className={`p-3 rounded-xl border text-xs font-sans font-medium text-left transition-all ${
                      isSubmitted
                        ? option.toLowerCase() === currentPuzzle.correctAnswer.toLowerCase()
                          ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                          : option === userAnswer
                          ? 'bg-rose-950/80 border-rose-500 text-rose-200'
                          : 'bg-[#1a2038] border-slate-800 opacity-50'
                        : 'bg-[#1a2038] border-slate-700 hover:border-amber-400 text-slate-200 hover:text-white'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              /* Text Input if open answer */
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="text"
                  disabled={isSubmitted}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your answer..."
                  className="flex-1 bg-[#1a2038] border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-400"
                />
                <button
                  disabled={isSubmitted || !userAnswer.trim()}
                  onClick={() => handleSubmitAnswer(userAnswer)}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  Submit
                </button>
              </div>
            )}

            {/* Submission Feedback */}
            {isSubmitted && (
              <div className={`p-4 rounded-xl border text-xs font-sans space-y-2 mt-4 ${
                isCorrect ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200' : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
              }`}>
                <div className="flex items-center space-x-2 font-bold text-sm">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>Correct! Solve time: {solveTime}s</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-rose-400" />
                      <span>Incorrect! Correct answer: {currentPuzzle.correctAnswer}</span>
                    </>
                  )}
                </div>
                {currentPuzzle.explanation && (
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {currentPuzzle.explanation}
                  </p>
                )}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => selectedNode && generatePuzzle(selectedNode)}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Try Another Node</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
};

// Local fallback puzzle generator
function getFallbackPuzzle(nodeId: string, difficulty: 'Easy' | 'Medium' | 'Hard') {
  switch (nodeId) {
    case 'math':
      return {
        question: 'What is (12 × 8) + (45 ÷ 5)?',
        options: ['105', '101', '98', '112'],
        correctAnswer: '105',
        explanation: '12 × 8 = 96. 45 ÷ 5 = 9. 96 + 9 = 105.',
        category: 'Math',
      };
    case 'logic':
      return {
        question: 'If all Bloops are Razzies and all Razzies are Lazzies, are all Bloops definitely Lazzies?',
        options: ['Yes', 'No', 'Cannot be determined', 'Only on Tuesdays'],
        correctAnswer: 'Yes',
        explanation: 'Transitive property of categorical logic: If A ⊆ B and B ⊆ C, then A ⊆ C.',
        category: 'Logic',
      };
    case 'memory':
      return {
        question: 'Memorize these numbers: [7, 3, 9, 2, 5]. What was the third number?',
        options: ['7', '3', '9', '2'],
        correctAnswer: '9',
        explanation: 'The sequence was [7, 3, 9, 2, 5]. The 3rd position holds 9.',
        category: 'Memory',
      };
    case 'word':
      return {
        question: 'Unscramble this word: "G R I T A L O M H"',
        options: ['ALGORITHM', 'LOGARITHM', 'MORTALITY', 'LITHOGRAM'],
        correctAnswer: 'ALGORITHM',
        explanation: 'A L G O R I T H M contains all those letters.',
        category: 'Word',
      };
    case 'pattern':
      return {
        question: 'What comes next in the sequence: 2, 4, 8, 16, 32, __?',
        options: ['48', '64', '52', '128'],
        correctAnswer: '64',
        explanation: 'Each number doubles the previous term (×2). 32 × 2 = 64.',
        category: 'Pattern',
      };
    case 'riddle':
      return {
        question: 'I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?',
        options: ['An Echo', 'A Shadow', 'A Cloud', 'A Whistle'],
        correctAnswer: 'An Echo',
        explanation: 'An echo responds soundly with no physical mouth or body.',
        category: 'Riddle',
      };
    default:
      return {
        question: 'Which brain region is primarily responsible for forming new long-term memories?',
        options: ['Hippocampus', 'Cerebellum', 'Amygdala', 'Occipital Lobe'],
        correctAnswer: 'Hippocampus',
        explanation: 'The hippocampus plays a pivotal role in memory consolidation.',
        category: 'Quiz',
      };
  }
}
