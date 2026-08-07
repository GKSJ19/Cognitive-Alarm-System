import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Send,
  User,
  Bot,
  Apple,
  Dumbbell,
  Brain,
  Loader2,
  RefreshCw,
} from 'lucide-react';

export const AiAssistantView: React.FC = () => {
  const { messages, sendMessage, currentUser } = useApp();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Filter messages for direct coach / AI chat
  const chatHistory = messages.filter(
    (m) => m.receiverId === currentUser.id || m.senderId === currentUser.id
  );

  const handleSendPrompt = async (textToSend?: string) => {
    const inputMsg = textToSend || prompt;
    if (!inputMsg.trim() || isLoading) return;

    // Send user message
    sendMessage('cch-1', inputMsg);
    setPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: inputMsg,
          systemInstruction:
            'You are an expert AI Wellness & Fitness Coach named Verve AI. Provide concise, encouraging, highly actionable advice regarding nutrition, workouts, sleep, and habit building.',
        }),
      });

      const data = await response.json();
      if (data.text) {
        sendMessage(currentUser.id, data.text, true);
      } else {
        sendMessage(currentUser.id, "I'm here to support your fitness journey! Focus on consistent hydration and 8 hours of quality rest today.", true);
      }
    } catch (err) {
      sendMessage(
        currentUser.id,
        "Great question! Remember to maintain a balanced intake of whole foods, lean proteins, and stay consistent with your 10,000 steps goal.",
        true
      );
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    { icon: Apple, label: 'Suggest high-protein lunch ideas', query: 'Can you suggest 3 quick, high-protein lunch recipes under 500 calories for my fitness challenge?' },
    { icon: Dumbbell, label: '15-min core & HIIT routine', query: 'Give me a 15-minute home workout routine targeting core and mobility with no equipment needed.' },
    { icon: Brain, label: 'Improve deep sleep quality', query: 'What are the top 4 science-backed tips to improve deep REM sleep and cut nighttime screen fatigue?' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-5 flex flex-col h-[620px]">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-1.5">
              <span>Verve AI Wellness Assistant</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-semibold">
                Gemini 3.6-Flash
              </span>
            </h3>
            <p className="text-xs text-slate-500">Ask about workout plans, nutrition macros, or recovery science</p>
          </div>
        </div>

        <button
          onClick={() => handleSendPrompt("Summarize my current daily fitness progress and give me 2 actionable coaching tips.")}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors flex items-center space-x-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Auto-Analyze Progress</span>
        </button>
      </div>

      {/* Quick Prompt Chips */}
      <div className="py-3 flex items-center space-x-2 overflow-x-auto">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendPrompt(p.query)}
            className="px-3 py-1.5 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-xl text-xs font-medium text-slate-700 hover:text-purple-800 transition-all whitespace-nowrap flex items-center space-x-1.5"
          >
            <p.icon className="w-3.5 h-3.5 text-purple-600" />
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
        {chatHistory.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-2">
            <Bot className="w-10 h-10 mx-auto text-purple-300" />
            <p className="text-xs font-medium">No messages yet. Ask Gemini AI anything about your wellness journey!</p>
          </div>
        ) : (
          chatHistory.map((m) => (
            <div
              key={m.id}
              className={`flex items-start space-x-3 ${
                m.senderId === currentUser.id ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.senderId !== currentUser.id && (
                <img
                  src={m.senderAvatar}
                  alt={m.senderName}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-purple-300"
                />
              )}

              <div
                className={`max-w-lg rounded-2xl p-3.5 text-xs leading-relaxed ${
                  m.senderId === currentUser.id
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : m.isAi
                    ? 'bg-purple-50 border border-purple-100 text-purple-950 rounded-tl-none'
                    : 'bg-slate-100 text-slate-800 rounded-tl-none'
                }`}
              >
                <div className="flex items-center justify-between mb-1 text-[10px] opacity-75">
                  <span className="font-semibold">{m.senderName}</span>
                  <span>{m.timestamp}</span>
                </div>
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>

              {m.senderId === currentUser.id && (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-400"
                />
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex items-center space-x-2 text-xs text-purple-600 bg-purple-50 p-3 rounded-2xl w-fit">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Gemini AI is analyzing health data and generating advice...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendPrompt();
        }}
        className="pt-3 border-t border-slate-100 flex items-center space-x-2"
      >
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask AI Coach about diet plans, workouts, or recovery..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
        />
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-all flex items-center space-x-1"
        >
          <Send className="w-4 h-4" />
          <span>Ask</span>
        </button>
      </form>

    </div>
  );
};
