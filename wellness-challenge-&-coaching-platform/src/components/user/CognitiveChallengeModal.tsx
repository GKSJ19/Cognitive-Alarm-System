import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BellRing,
  Brain,
  Volume2,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Flame,
  Award,
} from 'lucide-react';
import { CognitiveType } from '../../types';

interface PuzzleQuestion {
  question: string;
  answer: string;
  options?: string[];
  hint?: string;
}

const TRIVIA_POOL: PuzzleQuestion[] = [
  { question: 'What is the recommended minimum daily water intake for adults?', answer: '2 liters', options: ['1 liter', '2 liters', '5 liters', '10 liters'] },
  { question: 'Which hormone regulates sleep-wake cycles in humans?', answer: 'Melatonin', options: ['Melatonin', 'Cortisol', 'Insulin', 'Adrenaline'] },
  { question: 'How many steps per day is widely targeted for cardiovascular active health?', answer: '10,000', options: ['2,000', '5,000', '10,000', '25,000'] },
  { question: 'Which vitamin is synthesized by human skin exposed to sunlight?', answer: 'Vitamin D', options: ['Vitamin A', 'Vitamin C', 'Vitamin D', 'Vitamin B12'] },
];

const WORD_POOL = [
  { scrambled: 'W E L L N E S S', answer: 'WELLNESS' },
  { scrambled: 'H Y D R A T I O N', answer: 'HYDRATION' },
  { scrambled: 'C A R D I O', answer: 'CARDIO' },
  { scrambled: 'M I N D F U L', answer: 'MINDFUL' },
];

export const CognitiveChallengeModal: React.FC = () => {
  const { ringingAlarm, snoozeAlarm, dismissAlarm } = useApp();
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSolved, setIsSolved] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<PuzzleQuestion | null>(null);

  useEffect(() => {
    if (!ringingAlarm) return;

    setUserAnswer('');
    setSelectedOption(null);
    setErrorMsg('');
    setIsSolved(false);

    // Generate puzzle based on alarm's cognitive type
    const type = ringingAlarm.cognitiveType;
    if (type === 'math') {
      const num1 = Math.floor(Math.random() * 30) + 12;
      const num2 = Math.floor(Math.random() * 25) + 8;
      const num3 = Math.floor(Math.random() * 10) + 2;
      setCurrentQuestion({
        question: `Solve: (${num1} + ${num2}) × ${num3}`,
        answer: String((num1 + num2) * num3),
        hint: 'Mental Math Wake-Up Challenge',
      });
    } else if (type === 'trivia') {
      const randomTrivia = TRIVIA_POOL[Math.floor(Math.random() * TRIVIA_POOL.length)];
      setCurrentQuestion(randomTrivia);
    } else if (type === 'scramble') {
      const item = WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)];
      setCurrentQuestion({
        question: `Unscramble the wellness word: ${item.scrambled}`,
        answer: item.answer,
        hint: 'Type the unscrambled word in uppercase',
      });
    } else {
      // Pattern
      setCurrentQuestion({
        question: 'Complete the pattern: 2, 4, 8, 16, 32, __',
        answer: '64',
        hint: 'Powers of 2 sequence',
      });
    }
  }, [ringingAlarm]);

  if (!ringingAlarm) return null;

  const handleVerifyAnswer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentQuestion) return;

    const submitted = (selectedOption || userAnswer).trim().toLowerCase();
    const correct = currentQuestion.answer.trim().toLowerCase();

    if (submitted === correct) {
      setIsSolved(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Incorrect answer! Keep your brain active and try again.');
    }
  };

  const handleSnooze = () => {
    if (!isSolved) {
      setErrorMsg('You must solve the cognitive challenge to snooze!');
      return;
    }
    snoozeAlarm(ringingAlarm.id);
  };

  const handleDismiss = () => {
    if (!isSolved) {
      setErrorMsg('You must solve the cognitive challenge to turn off the alarm!');
      return;
    }
    dismissAlarm(ringingAlarm.id);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 text-white relative overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Pulsing Alert Light Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-500 animate-pulse" />

        {/* Alarm Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-4 rounded-full bg-rose-500/20 text-rose-400 ring-8 ring-rose-500/10 animate-bounce">
            <BellRing className="w-10 h-10" />
          </div>

          <div className="flex items-center justify-center space-x-2 text-rose-400 text-xs font-bold uppercase tracking-widest">
            <Volume2 className="w-4 h-4 animate-pulse" />
            <span>Alarm Ringing • {ringingAlarm.sound.replace('_', ' ')}</span>
          </div>

          <h2 className="text-5xl font-black text-white tracking-tight">
            {ringingAlarm.time}
          </h2>

          <p className="text-sm font-semibold text-slate-300">
            {ringingAlarm.label}
          </p>
        </div>

        {/* Cognitive Challenge Box */}
        <div className="mt-6 bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Cognitive Snooze Lock
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-extrabold uppercase">
              {ringingAlarm.cognitiveType}
            </span>
          </div>

          {!isSolved ? (
            <form onSubmit={handleVerifyAnswer} className="space-y-4">
              <div className="text-center space-y-1">
                <p className="text-sm font-bold text-white">
                  {currentQuestion?.question}
                </p>
                {currentQuestion?.hint && (
                  <p className="text-[11px] text-slate-400">{currentQuestion.hint}</p>
                )}
              </div>

              {/* Multiple Choice Options or Text Input */}
              {currentQuestion?.options ? (
                <div className="grid grid-cols-2 gap-2">
                  {currentQuestion.options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setSelectedOption(opt);
                        setErrorMsg('');
                      }}
                      className={`p-3 rounded-xl text-xs font-bold border transition-all text-center ${
                        selectedOption === opt
                          ? 'bg-emerald-600 border-emerald-400 text-white ring-2 ring-emerald-500/30'
                          : 'bg-slate-700/60 border-slate-600 text-slate-200 hover:bg-slate-700'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  placeholder="Enter your answer..."
                  value={userAnswer}
                  onChange={(e) => {
                    setUserAnswer(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full text-center text-sm font-bold p-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              )}

              {errorMsg && (
                <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-xs font-bold shadow-md hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Verify Cognitive Solution</span>
              </button>
            </form>
          ) : (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full mx-auto flex items-center justify-center ring-4 ring-emerald-500/10">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-emerald-400">
                  Challenge Solved!
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Your mind is active. Reward: <span className="font-bold text-amber-400">+50 Wellness Points</span> & Streak preserved!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={handleSnooze}
            disabled={!isSolved}
            className={`py-3 px-4 rounded-2xl text-xs font-extrabold border transition-all flex items-center justify-center space-x-2 ${
              isSolved
                ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700 shadow-md'
                : 'bg-slate-800/40 border-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Snooze (5m)</span>
          </button>

          <button
            onClick={handleDismiss}
            disabled={!isSolved}
            className={`py-3 px-4 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-center space-x-2 ${
              isSolved
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400/30'
                : 'bg-slate-800/40 border-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Wake Up & Turn Off</span>
          </button>
        </div>

      </div>
    </div>
  );
};
