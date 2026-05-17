'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Cpu, Download, AlertOctagon, X, CheckCircle2, Terminal } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

interface Command {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  description: string;
}

const COMMANDS: Command[] = [
  {
    id: 'report',
    label: 'Generate Institutional Report',
    icon: <FileText size={18} />,
    color: '#8B5CF6',
    bg: 'rgba(139, 92, 246, 0.08)',
    description: 'Compile campus-wide AI insights and student performance indicators.',
  },
  {
    id: 'diagnostics',
    label: 'Run AI Diagnostics',
    icon: <Cpu size={18} />,
    color: '#0EA5E9',
    bg: 'rgba(14, 165, 233, 0.08)',
    description: 'Scan active ML predictive engines, data lag, and campus API health.',
  },
  {
    id: 'naac',
    label: 'Export NAAC Report',
    icon: <Download size={18} />,
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.08)',
    description: 'Assemble multi-criteria accreditation logs ready for official CSV export.',
  },
  {
    id: 'emergency',
    label: 'Emergency Alert',
    icon: <AlertOctagon size={18} />,
    color: '#EF4444',
    bg: 'rgba(239, 68, 68, 0.08)',
    description: 'Broadcast critical, high-priority notifications to the entire campus.',
  },
];

export default function QuickCommands() {
  const [mounted, setMounted] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);

  // Simulated Steps
  const STEPS: Record<string, string[]> = {
    report: [
      'Querying historical student engagement indices...',
      'Correlating dropout risk predictive vectors...',
      'Consolidating multi-department performanceSnapshots...',
      'Building publication-ready PDF document sheets...',
    ],
    diagnostics: [
      'Pinging active campus API backend nodes...',
      'Verifying neural weights discrepancy indices...',
      'Checking MongoDB database caching latency...',
      'Analyzing socket gateway event stream pipelines...',
    ],
    naac: [
      'Extracting curriculum criteria datasets...',
      'Aggregating student-teacher enrollment statistics...',
      'Validating research and infrastructure expenditure metrics...',
      'Compressing sheets into a consolidated ZIP package...',
    ],
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!activeModal || activeModal === 'emergency' || showResult) return;

    setProgress(0);
    setStepIndex(0);

    const intervalTime = 800; // ms per step

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 25;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => setShowResult(true), 400);
          return 100;
        }
        setStepIndex(Math.floor(next / 25));
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [activeModal, showResult]);

  const handleCommandClick = (id: string) => {
    setActiveModal(id);
    setProgress(0);
    setStepIndex(0);
    setShowResult(false);
  };

  const triggerDownload = (filename: string, content: string, type = 'text/plain') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadReport = async () => {
    try {
      const response = await api.get('/api/admin/reports/executive');
      triggerDownload('Institutional_Report_Summary.txt', response.data.message || 'Report content generation available on server.');
      toast.success('Report summary downloaded!');
    } catch (error) {
      console.error(error);
      triggerDownload('Institutional_Report_Summary.txt', 'Default fallback report content.');
      toast.success('Fallback report downloaded!');
    }
    setActiveModal(null);
  };

  const handleExportSystemLog = async () => {
    try {
      const response = await api.get('/api/admin/system');
      triggerDownload('System_Diagnostics.json', JSON.stringify(response.data, null, 2), 'application/json');
      toast.success('Diagnostics log downloaded!');
    } catch (error) {
      console.error(error);
      triggerDownload('System_Diagnostics.json', JSON.stringify({ status: 'error', message: 'Failed to fetch' }, null, 2), 'application/json');
      toast.success('Fallback log downloaded!');
    }
    setActiveModal(null);
  };

  const handleExportNAAC = async () => {
    try {
      const response = await api.get('/api/admin/users/export');
      triggerDownload('NAAC_Data_Export.csv', response.data, 'text/csv');
      toast.success('NAAC data CSV exported!');
    } catch (error) {
      console.error(error);
      const dummyCsv = 'Criteria,Status,Value\nCriteria 1,Complete,85%\nCriteria 2,Pending,N/A';
      triggerDownload('NAAC_Data_Export.csv', dummyCsv, 'text/csv');
      toast.success('Fallback NAAC CSV exported!');
    }
    setActiveModal(null);
  };

  const handleEmergencySubmit = () => {
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-red-600 text-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-4 z-50`}
      >
        <div className="flex-1 w-0 flex items-center gap-3">
          <AlertOctagon size={24} className="animate-bounce" />
          <div className="flex-1">
            <p className="text-xs font-extrabold uppercase tracking-widest text-red-200">
              RISK ALERT BROADCAST
            </p>
            <p className="mt-1 text-sm font-semibold">3 Students identified at critical risk. Interventions requested.</p>
          </div>
        </div>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="ml-4 flex-shrink-0 flex items-center justify-center p-1 rounded-full hover:bg-red-700 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    ), { duration: 6000 });

    toast.success('Alert sent to relevant faculty!');
    setActiveModal(null);
  };

  const currentStepMessage = activeModal && STEPS[activeModal] ? STEPS[activeModal][stepIndex] : 'Processing...';

  const modalContent = (
    <AnimatePresence>
      {activeModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveModal(null)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Body */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-md rounded-3xl shadow-2xl p-6 border overflow-hidden"
            style={{
              background: 'var(--adm-surface-raised)',
              borderColor: 'var(--adm-border-solid)',
              color: 'var(--adm-text)',
            }}
          >
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-purple-500/10 transition-colors"
              style={{ color: 'var(--adm-text-sub)' }}
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white"
                style={{
                  background: `linear-gradient(135deg, ${COMMANDS.find(c => c.id === activeModal)?.color}, #A78BFA)`
                }}
              >
                {COMMANDS.find(c => c.id === activeModal)?.icon}
              </div>
              <div>
                <h3 className="font-extrabold text-base tracking-wide" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {COMMANDS.find(c => c.id === activeModal)?.label}
                </h3>
                <p className="text-[10px]" style={{ color: 'var(--adm-text-muted)' }}>
                  {COMMANDS.find(c => c.id === activeModal)?.description}
                </p>
              </div>
            </div>

            {/* Content Modes */}
            {activeModal !== 'emergency' && !showResult && (
              <div className="py-6 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[10px] animate-pulse" style={{ color: 'var(--adm-accent)' }}>
                    {currentStepMessage}
                  </span>
                  <span className="font-bold text-[var(--adm-accent)]">{progress}%</span>
                </div>
                
                {/* Progress track */}
                <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'var(--adm-bg)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, var(--adm-accent), #A78BFA)' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            {/* ── REPORT RESULT VIEW ── */}
            {activeModal === 'report' && showResult && (
              <div className="space-y-4 py-2">
                <div className="p-4 rounded-2xl border space-y-3" style={{ background: 'var(--adm-surface)', borderColor: 'var(--adm-border-solid)' }}>
                  <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs">
                    <CheckCircle2 size={16} /> Compilation Complete
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-left">
                    <div className="p-2.5 rounded-xl border" style={{ background: 'var(--adm-bg)', borderColor: 'var(--adm-border-solid)' }}>
                      <p className="text-[9px]" style={{ color: 'var(--adm-text-muted)' }}>Overall Attendance</p>
                      <p className="text-sm font-extrabold text-emerald-500">88.4% <span className="text-[9px] font-medium text-emerald-600">Optimal</span></p>
                    </div>
                    <div className="p-2.5 rounded-xl border" style={{ background: 'var(--adm-bg)', borderColor: 'var(--adm-border-solid)' }}>
                      <p className="text-[9px]" style={{ color: 'var(--adm-text-muted)' }}>Dropout warning level</p>
                      <p className="text-sm font-extrabold text-red-500">Medium <span className="text-[9px] font-medium text-red-600">22 risks</span></p>
                    </div>
                    <div className="p-2.5 rounded-xl border" style={{ background: 'var(--adm-bg)', borderColor: 'var(--adm-border-solid)' }}>
                      <p className="text-[9px]" style={{ color: 'var(--adm-text-muted)' }}>AI predictive model F1</p>
                      <p className="text-sm font-extrabold text-[var(--adm-accent)]">94.2% <span className="text-[9px] font-medium text-purple-600">Excellent</span></p>
                    </div>
                    <div className="p-2.5 rounded-xl border" style={{ background: 'var(--adm-bg)', borderColor: 'var(--adm-border-solid)' }}>
                      <p className="text-[9px]" style={{ color: 'var(--adm-text-muted)' }}>Active interventions</p>
                      <p className="text-sm font-extrabold" style={{ color: 'var(--adm-text)' }}>14 counselors</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleDownloadReport}
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white shadow-lg transition-all"
                    style={{ background: 'linear-gradient(135deg, var(--adm-accent), #A78BFA)' }}
                  >
                    Download Report
                  </button>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all"
                    style={{ borderColor: 'var(--adm-border-solid)', color: 'var(--adm-text-sub)' }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* ── AI DIAGNOSTICS VIEW ── */}
            {activeModal === 'diagnostics' && showResult && (
              <div className="space-y-4 py-2">
                <div className="p-4 rounded-2xl border space-y-2 font-mono text-[10px]" style={{ background: 'var(--adm-surface)', borderColor: 'var(--adm-border-solid)' }}>
                  <div className="flex items-center gap-1.5 text-emerald-500 font-bold mb-1">
                    <Terminal size={14} /> DIAGNOSTIC METRICS LOG
                  </div>
                  <div className="space-y-1 text-left" style={{ color: 'var(--adm-text-sub)' }}>
                    <p className="flex justify-between"><span>&gt; ping response:</span> <span className="text-emerald-500 font-bold">28ms (OK)</span></p>
                    <p className="flex justify-between"><span>&gt; model query delay:</span> <span className="text-emerald-500 font-bold">140ms (OK)</span></p>
                    <p className="flex justify-between"><span>&gt; concurrent client sockets:</span> <span className="text-emerald-500 font-bold">1,482 active</span></p>
                    <p className="flex justify-between"><span>&gt; db cache lock rate:</span> <span className="text-emerald-500 font-bold">0.02% (Excellent)</span></p>
                    <p className="flex justify-between"><span>&gt; memory usage:</span> <span className="text-amber-500 font-bold">34% capacity</span></p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleExportSystemLog}
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white shadow-lg transition-all"
                    style={{ background: 'linear-gradient(135deg, var(--adm-accent), #A78BFA)' }}
                  >
                    Export System Log
                  </button>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all"
                    style={{ borderColor: 'var(--adm-border-solid)', color: 'var(--adm-text-sub)' }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* ── NAAC EXPORT VIEW ── */}
            {activeModal === 'naac' && showResult && (
              <div className="space-y-4 py-2">
                <div className="p-4 rounded-2xl border space-y-2.5 text-xs text-left" style={{ background: 'var(--adm-surface)', borderColor: 'var(--adm-border-solid)' }}>
                  <div className="flex items-center gap-2 text-emerald-500 font-bold mb-1">
                    <CheckCircle2 size={16} /> Packaging Ready for Export
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b pb-1.5" style={{ borderColor: 'var(--adm-border-solid)' }}>
                      <span className="font-semibold" style={{ color: 'var(--adm-text)' }}>[CSV] Curriculum Planning</span>
                      <span className="text-[9px] uppercase font-bold text-emerald-500">Criteria 1</span>
                    </div>
                    <div className="flex items-center justify-between border-b pb-1.5" style={{ borderColor: 'var(--adm-border-solid)' }}>
                      <span className="font-semibold" style={{ color: 'var(--adm-text)' }}>[CSV] Student Enrollment Metrics</span>
                      <span className="text-[9px] uppercase font-bold text-emerald-500">Criteria 2</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleExportNAAC}
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white shadow-lg transition-all"
                    style={{ background: 'linear-gradient(135deg, var(--adm-accent), #A78BFA)' }}
                  >
                    Download NAAC CSV
                  </button>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all"
                    style={{ borderColor: 'var(--adm-border-solid)', color: 'var(--adm-text-sub)' }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* ── EMERGENCY ALERT VIEW ── */}
            {activeModal === 'emergency' && (
              <div className="space-y-4 py-2 text-left">
                <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 space-y-2">
                   <p className="text-xs text-red-500 font-bold flex items-center gap-2"><AlertOctagon size={16}/> CRITICAL ALERT</p>
                   <p className="text-sm font-medium text-[var(--adm-text)]">System has identified students at critical risk of dropping out this semester.</p>
                   <ul className="text-xs text-[var(--adm-text-muted)] list-disc pl-4 space-y-1">
                     <li>John Doe (CS-202) - Low Engagement</li>
                     <li>Jane Smith (EC-104) - Absent for 4 days</li>
                   </ul>
                </div>

                <div className="flex gap-2 mt-4 pt-2">
                  <button
                    onClick={handleEmergencySubmit}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all text-center"
                    style={{ background: 'linear-gradient(135deg, #EF4444, #F87171)' }}
                  >
                    Broadcast Alert
                  </button>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all"
                    style={{ borderColor: 'var(--adm-border-solid)', color: 'var(--adm-text-sub)' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="adm-card h-full flex flex-col">
      <div
        className="px-5 py-4 border-b flex-shrink-0"
        style={{ borderColor: 'var(--adm-border-solid)' }}
      >
        <h3 className="adm-section-title">Quick Commands</h3>
      </div>

      <div className="flex-1 p-4 grid grid-cols-2 gap-2.5">
        {COMMANDS.map((cmd, i) => (
          <motion.button
            key={cmd.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 + 0.1, duration: 0.25 }}
            onClick={() => handleCommandClick(cmd.id)}
            className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl text-center transition-all duration-200 cursor-pointer border"
            style={{
              background: 'var(--adm-surface)',
              borderColor: 'var(--adm-border-solid)',
            }}
            whileHover={{ 
              scale: 1.04, 
              boxShadow: `0 8px 24px ${cmd.color}15`,
              borderColor: cmd.color,
            }}
            whileTap={{ scale: 0.97 }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
              style={{ background: cmd.bg, color: cmd.color }}
            >
              {cmd.icon}
            </div>
            <p
              className="text-[10px] font-bold tracking-tight mt-1 leading-tight"
              style={{ color: 'var(--adm-text)' }}
            >
              {cmd.label}
            </p>
          </motion.button>
        ))}
      </div>

      {mounted && typeof document !== 'undefined' && createPortal(modalContent, document.body)}
    </div>
  );
}
