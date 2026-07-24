import { ArrowRight, Brain, Clock, ShieldCheck, Sparkles, TrendingUp, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-4000"></div>

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-6 py-16">
        
        {/* Navbar */}
        <motion.nav 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50"
        >
          <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
            <Brain className="w-6 h-6 text-primary" />
            <span>ICAP</span>
          </div>
          <div className="flex gap-4">
            <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2">
              Sign In
            </Link>
            <Link to="/register" className="inline-flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 px-5 py-2 text-sm font-medium transition-colors">
              Get Started
            </Link>
          </div>
        </motion.nav>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center mt-20"
        >
          <motion.div variants={fadeIn} className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary font-medium backdrop-blur-md">
            <Sparkles className="h-4 w-4" />
            AI-ready habit architecture
          </motion.div>
          
          <motion.h1 variants={fadeIn} className="max-w-4xl text-5xl font-extrabold tracking-tight sm:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            Intelligent Cognitive <br className="hidden sm:block" /> Alarm Platform
          </motion.h1>
          
          <motion.p variants={fadeIn} className="mt-8 max-w-2xl text-lg leading-8 text-muted-foreground">
            Build consistent wake-up habits with structured alarms, personalized cognitive challenges, progress insights,
            and role-based productivity workflows. Stop snoozing, start doing.
          </motion.p>
          
          <motion.div variants={fadeIn} className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              to="/dashboard"
              className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
            >
              Open Dashboard
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-32 grid gap-6 md:grid-cols-3"
        >
          {[
            { label: "Adaptive Difficulty", desc: "Puzzles scale in difficulty based on your wake-up performance.", icon: Activity, color: "text-blue-400" },
            { label: "Habit Scoring", desc: "Track consistency, puzzle success, and schedule adherence.", icon: TrendingUp, color: "text-purple-400" },
            { label: "Anti-Snooze Logic", desc: "Multi-step verification ensures you're actually awake.", icon: Clock, color: "text-pink-400" },
          ].map((feature, i) => (
            <motion.div 
              key={feature.label} 
              variants={fadeIn}
              whileHover={{ y: -5 }}
              className="group relative rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-lg overflow-hidden transition-all hover:bg-white/10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <feature.icon className={`h-8 w-8 ${feature.color} mb-6`} />
              <h3 className="text-xl font-semibold mb-3">{feature.label}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </main>
  );
}
