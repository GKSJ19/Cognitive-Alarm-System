import React from 'react';
import { AppProvider } from './context/AppContext';
import { MobileFrame } from './components/mobile/MobileFrame';
import { CognitiveChallengeModal } from './components/user/CognitiveChallengeModal';

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-100 font-sans text-slate-900 antialiased">
        <MobileFrame />
        <CognitiveChallengeModal />
      </div>
    </AppProvider>
  );
}

