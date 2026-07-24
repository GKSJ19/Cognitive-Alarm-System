import React from "react";
import { Link } from "react-router-dom";
import { Brain, Home, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export function NotFoundPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
      <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl relative z-10 text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20">
            <Brain className="w-8 h-8" />
          </div>
        </div>

        <h1 className="text-6xl font-extrabold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-pink-500">
          404
        </h1>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Page Not Found</h2>
        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
          The cognitive path you are trying to follow does not exist. It might have been moved, deleted, or never existed in the first place.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:scale-105"
          >
            <Home className="w-4 h-4" /> Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold hover:bg-white/10 transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Go Back
          </button>
        </div>
      </motion.div>
    </main>
  );
}
