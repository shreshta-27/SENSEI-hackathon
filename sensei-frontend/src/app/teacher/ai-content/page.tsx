'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Plus, BookOpen, FileText, BarChart3, ArrowRight, Download, Edit, ChevronRight, Wand2, CheckCircle, Copy, FileJson, ScrollText, Sparkles
} from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import StickyCard from '@/components/faculty/StickyCard';
import ComicButton from '@/components/faculty/ComicButton';
import NotebookInput from '@/components/faculty/NotebookInput';

import ReactMarkdown from 'react-markdown';

type TabKey = 'quiz' | 'study' | 'rubric';

export default function AIContentPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('quiz');
  const [generating, setGenerating] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [topic, setTopic] = useState('');

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'quiz',   label: 'Quiz Builder',   icon: <FileJson size={16} /> },
    { key: 'study',  label: 'Study Material', icon: <ScrollText size={16} /> },
    { key: 'rubric', label: 'Rubric Creator', icon: <Wand2 size={16} /> },
  ];

  const generate = async () => {
    if (!topic.trim()) { toast.error('Enter a topic'); return; }
    setGenerating(true);
    try {
      const res = await api.post('/api/teacher/content-ai/generate', { type: activeTab, topic });
      toast.success('Content generated!');
      setOutput(res.data.content);
    } catch { toast.error('Generation failed'); } finally { setGenerating(false); }
  };

  const OutputCard = () => (
    <AnimatePresence>
      {output && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-6">
          <StickyCard color="green" className="!p-5 max-w-none prose prose-p:font-body prose-h3:font-display">
            <ReactMarkdown>{output}</ReactMarkdown>
          </StickyCard>
          <div className="flex gap-3">
            <ComicButton variant="secondary" icon={<Copy size={16} onClick={() => { navigator.clipboard.writeText(output); toast.success('Copied!'); }} />}>Copy Content</ComicButton>
            <ComicButton variant="ghost" icon={<Download size={14} />}>Download</ComicButton>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="page-mobile-pad space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-4xl text-[var(--text-primary)] flex items-center gap-3">
          <Sparkles size={32} className="text-[var(--accent-purple)]" /> AI Content Generator
        </h1>
        <p className="font-handwrite text-xl text-[var(--text-muted)]">Powered by Gemini AI — build quizzes, notes, and rubrics in seconds</p>
      </motion.div>

      {/* Sticky-tab row */}
      <div className="flex gap-3 flex-wrap">
        {tabs.map(t => (
          <button key={t.key} onClick={() => { setActiveTab(t.key); setOutput(null); }}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-ui font-bold border-2 transition-all cursor-pointer ${
              activeTab === t.key
                ? 'bg-[var(--accent-purple)] text-white border-[var(--accent-purple)] shadow-[2px_2px_0_var(--accent-purple)]'
                : 'bg-white text-[var(--text-secondary)] border-[var(--border-card)] shadow-[2px_2px_0_#D6D0C8] hover:-translate-y-0.5'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'quiz' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <StickyCard color="yellow" pinned className="!p-6 space-y-4">
            <h3 className="font-display text-2xl">📝 Create AI Quiz</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1"> Topic </label>
                <input placeholder="e.g. Binary Trees"
                  value={topic} onChange={e => setTopic(e.target.value)}
                  className="w-full bg-white/80 border-b-3 border-[var(--border-doodle)] border-t-0 border-l-0 border-r-0 px-3 py-2 font-body text-base outline-none focus:border-[var(--accent-purple)]" />
              </div>
              <div>
                <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1"> Class </label>
                <select className="w-full bg-white/80 border-2 border-[var(--border-doodle)] rounded-xl px-3 py-2 font-ui text-sm outline-none">
                  <option value="">Select class…</option>
                  <option>Fullstack - Sec B</option>
                  <option>DBMS - Sec A</option>
                </select>
              </div>
            </div>

            <ComicButton variant="primary" onClick={generate} loading={generating} className="gap-2">
              <Wand2 size={18} /> Generate Quiz
            </ComicButton>
          </StickyCard>
          <OutputCard />
        </motion.div>
      )}

      {activeTab === 'study' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <StickyCard color="blue" pinned className="!p-6 space-y-4">
            <h3 className="font-display text-2xl">📚 Create Study Material</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1"> Topic </label>
                <input placeholder="e.g. Object-Oriented Programming Fundamentals"
                  value={topic} onChange={e => setTopic(e.target.value)}
                  className="w-full bg-white/80 border-b-3 border-[var(--border-doodle)] border-t-0 border-l-0 border-r-0 px-3 py-2 font-body text-base outline-none focus:border-[var(--accent-purple)]" />
              </div>
              <div><label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1"> Class </label>
                <select className="w-full bg-white/80 border-2 border-[var(--border-doodle)] rounded-xl px-3 py-2 font-ui text-sm outline-none"><option>Fullstack - Sec B</option></select>
              </div>
            </div>
            <ComicButton variant="primary" onClick={generate} loading={generating} icon={<Wand2 size={18} />}>Generate Content</ComicButton>
          </StickyCard>
          <OutputCard />
        </motion.div>
      )}

      {activeTab === 'rubric' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <StickyCard color="green" pinned className="!p-6 space-y-4">
            <h3 className="font-display text-2xl">📋 Rubric Creator</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1"> Assignment Topic </label>
                <input placeholder="e.g. Fullstack Web App Final Project"
                  value={topic} onChange={e => setTopic(e.target.value)}
                  className="w-full bg-white/80 border-b-3 border-[var(--border-doodle)] border-t-0 border-l-0 border-r-0 px-3 py-2 font-body text-base outline-none focus:border-[var(--accent-purple)]" />
              </div>
              <div>
                <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1"> Class </label>
                <select className="w-full bg-white/80 border-2 border-[var(--border-doodle)] rounded-xl px-3 py-2 font-ui text-sm outline-none"><option>Fullstack - Sec B</option></select>
              </div>
            </div>
            <ComicButton variant="primary" onClick={generate} loading={generating} icon={<Wand2 size={18} />}>Generate Rubric</ComicButton>
          </StickyCard>
          <OutputCard />
        </motion.div>
      )}
    </div>
  );
}

function Badge4({ label, color }: { label: string; color?: string }) {
  return (
    <span className={`font-ui text-[10px] font-bold px-2 py-0.5 rounded-full ${color ?? 'bg-green-50 text-green-600'}`}>
      {label}
    </span>
  );
}
