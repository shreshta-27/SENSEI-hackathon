'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, GraduationCap, BookOpen, Shield, ChevronRight, Star, Brain, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { useAuthStore } from '@/stores/authStore';

// ─── Design tokens (matching landing page) ───────────────────────────────────
const PURPLE      = '#7B4FE9';
const PURPLE_DARK = '#5B35C4';
const NAVY        = '#1A1A2E';
const CREAM       = '#F5EFE8';
const NOTE_YELLOW   = '#FFE93A';
const NOTE_GREEN    = '#81D4A8';
const NOTE_LAVENDER = '#C9A0FF';
const NOTE_PINK     = '#F48FB1';
const NOTE_BLUE     = '#81D4FA';

const ROLES = [
  { id: 'student', label: 'STUDENT', Icon: GraduationCap, color: PURPLE,    accentBg: NOTE_LAVENDER },
  { id: 'teacher', label: 'FACULTY', Icon: BookOpen,      color: '#0097A7', accentBg: NOTE_BLUE },
  { id: 'admin',   label: 'ADMIN',   Icon: Shield,        color: '#388E3C', accentBg: NOTE_GREEN },
] as const;

type RoleId = typeof ROLES[number]['id'];

const DEMOS = [
  { role: 'student' as RoleId, label: 'Student', email: 'aarav.sharma.cse@sensei.edu', pass: 'student123' },
  { role: 'teacher' as RoleId, label: 'Faculty', email: 'teacher.cse@sensei.edu',      pass: 'teacher123' },
  { role: 'admin'   as RoleId, label: 'Admin',   email: 'shivam77@gmail.com',           pass: '9082249120' },
];

const ROLE_BENEFITS: Record<RoleId, string[]> = {
  student: ['Adaptive AI Assessments', '24/7 AI Study Tutor', 'Focus & Wellness Guardian', 'Career Simulator & Planner'],
  teacher: ['Smart Class Analytics',   'AI-Powered Grading',  'Intervention Alerts',       'Poll & Quiz Creator'],
  admin:   ['University Dashboard',    'Dropout Risk Alerts', 'Department Analytics',      'Intervention Management'],
};

// ─── StickyNote ───────────────────────────────────────────────────────────────
function StickyNote({ color, rotate = 0, children, style }: { color: string; rotate?: number; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: color, borderRadius: 12, padding: '1.1rem', position: 'relative', transform: `rotate(${rotate}deg)`, border: '1.5px solid rgba(0,0,0,0.08)', boxShadow: '4px 5px 0px rgba(0,0,0,0.12)', ...style }}>
      <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', width: 48, height: 14, background: 'rgba(210,190,140,0.6)', borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)' }} />
      {children}
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState<RoleId>('student');
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const activeRole  = ROLES.find(r => r.id === selectedRole)!;
  const roleIndex   = ROLES.findIndex(r => r.id === selectedRole);
  const benefits    = ROLE_BENEFITS[selectedRole];

  // ── Login ──
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      if (data.user.role !== selectedRole) {
        toast.error(`Account is registered as "${data.user.role}", not "${selectedRole}".`);
        setLoading(false);
        return;
      }
      login(data.user, data.accessToken);
      setIsTransitioning(true);
      setTimeout(() => setIsTransitioning(false), 8000);
      const routeMap: Record<string, string> = { student: '/student', teacher: '/teacher', admin: '/admin' };
      router.push(routeMap[data.user.role] || '/student');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } }; message?: string };
      if (!error.response) toast.error('Network Error. Server might be starting — please try again.');
      else toast.error(error.response?.data?.error || 'Login failed');
      setLoading(false);
    }
  };

  // ── Transition loader ──
  if (isTransitioning) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: CREAM, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
        {/* polka dots */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(123,79,233,0.09) 1.2px, transparent 1.2px)', backgroundSize: '26px 26px', pointerEvents: 'none' }} />
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{ width: 64, height: 64, border: `4px solid ${NOTE_LAVENDER}`, borderTopColor: PURPLE, borderRadius: '50%' }} />
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <h2 className="font-cinzel" style={{ color: PURPLE, fontSize: '1.1rem', letterSpacing: '0.2em', margin: 0 }}>Loading your dashboard...</h2>
          <p style={{ color: '#888', fontSize: '0.78rem', marginTop: '0.5rem' }}>Setting up your workspace</p>
        </div>
        <StickyNote color={NOTE_YELLOW} rotate={-3} style={{ width: 160, textAlign: 'center', zIndex: 1 }}>
          <p style={{ fontSize: '0.82rem', fontWeight: 700, color: NAVY }}>Welcome to SENSEI!</p>
        </StickyNote>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: CREAM, display: 'flex', fontFamily: "'Raleway', sans-serif", overflow: 'hidden', position: 'relative' }}>
      {/* global polka dot bg */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(123,79,233,0.07) 1px, transparent 1px)', backgroundSize: '24px 24px', pointerEvents: 'none', zIndex: 0 }} />
      {/* animated ambient gradient */}
      <motion.div animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'fixed', inset: 0, background: 'linear-gradient(135deg, rgba(212,184,255,0.08) 0%, transparent 30%, rgba(181,234,215,0.06) 60%, transparent 100%)', backgroundSize: '400% 400%', pointerEvents: 'none', zIndex: 0 }} />

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex" style={{ flex: '0 0 52%', flexDirection: 'column', justifyContent: 'space-between', padding: '3rem 4rem', position: 'relative', zIndex: 1 }}>
        {/* Ambient blob */}
        <div style={{ position: 'absolute', top: '10%', left: '-8%', width: 450, height: 450, background: 'rgba(212,184,255,0.22)', borderRadius: '50%', filter: 'blur(90px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '-5%', width: 360, height: 360, background: 'rgba(181,234,215,0.22)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />

        {/* logo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
            <motion.div whileHover={{ scale: 1.07, rotate: -5 }} transition={{ type: 'spring', stiffness: 300 }}
              style={{ width: 42, height: 42, background: `linear-gradient(135deg,${PURPLE},${PURPLE_DARK})`, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(123,79,233,0.32)' }}>
              <Brain size={21} color="#fff" />
            </motion.div>
            <div>
              <p className="font-cinzel" style={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '0.1em', color: NAVY, lineHeight: 1, margin: 0 }}>SENSEI</p>
              <p style={{ fontSize: '0.45rem', letterSpacing: '0.24em', color: PURPLE, fontWeight: 700, margin: 0, marginTop: 2 }}>AI CAMPUS OS</p>
            </div>
          </Link>
        </div>

        {/* hero text */}
        <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: '3rem', paddingBottom: '2rem' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}>
            <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.4em', color: PURPLE, marginBottom: '1rem', textTransform: 'uppercase' }}>AI-POWERED UNIVERSITY PLATFORM</p>
            <h2 style={{ fontSize: 'clamp(2rem, 3.2vw, 3.2rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.25rem', color: NAVY, fontFamily: "'Raleway', sans-serif" }}>
              The <span style={{ color: PURPLE, fontStyle: 'italic' }}>AI</span> Operating<br />
              System for<br />
              <span style={{ color: PURPLE }}>Modern Campuses</span>
            </h2>
            <p style={{ fontSize: '0.98rem', color: '#444', lineHeight: 1.8, maxWidth: 400, marginBottom: '2.5rem', fontWeight: 500 }}>
              Join 12,000+ students and 850+ faculty members already learning and teaching smarter with AI.
            </p>
          </motion.div>

          {/* animated line divider */}
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.2, delay: 0.5 }}
            style={{ height: 2, background: `linear-gradient(90deg, ${PURPLE}40, ${PURPLE}, ${PURPLE}40)`, borderRadius: 1, marginBottom: '2rem', transformOrigin: '0%', maxWidth: 300 }} />

          {/* stats as sticky note chips */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
            style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            {[
              { value: '10K+',  label: 'Students',  color: NOTE_LAVENDER },
              { value: '500+',  label: 'Courses',   color: NOTE_YELLOW },
              { value: '95%',   label: 'Risk Detection', color: NOTE_GREEN },
              { value: '24/7',  label: 'AI Monitor', color: NOTE_PINK },
            ].map(({ value, label, color }) => (
              <motion.div key={label} whileHover={{ scale: 1.08, y: -3 }} whileTap={{ scale: 0.95 }} transition={{ type: 'spring', stiffness: 400 }}
                style={{ background: color, border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 10, padding: '0.65rem 1rem', boxShadow: '3px 3px 0 rgba(0,0,0,0.1)', cursor: 'default' }}>
                <p className="font-cinzel" style={{ fontSize: '1.25rem', fontWeight: 900, color: NAVY, lineHeight: 1, margin: 0 }}>{value}</p>
                <p style={{ fontSize: '0.65rem', color: '#444', marginTop: '0.2rem', margin: 0, fontWeight: 600 }}>{label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* role-specific benefits sticky note */}
          <AnimatePresence mode="wait">
            <motion.div key={selectedRole} initial={{ opacity: 0, x: -20, rotate: -4 }} animate={{ opacity: 1, x: 0, rotate: -2 }} exit={{ opacity: 0, x: 20, rotate: 4 }} transition={{ duration: 0.45 }}>
              <StickyNote color={activeRole.accentBg} rotate={-2} style={{ maxWidth: 360, padding: '1.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
                  <div style={{ width: 36, height: 36, background: `${activeRole.color}1A`, border: `1.5px solid ${activeRole.color}30`, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <activeRole.Icon size={18} color={activeRole.color} />
                  </div>
                  <p style={{ fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.08em', color: NAVY, margin: 0 }}>
                    FOR {activeRole.label}S
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                  {benefits.map(b => (
                    <div key={b} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                      <CheckCircle2 size={13} color={activeRole.color} strokeWidth={2.5} style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: '0.82rem', color: '#333', fontWeight: 500 }}>{b}</span>
                    </div>
                  ))}
                </div>
              </StickyNote>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* floating decorative notes */}
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: '30%', right: '-2%', zIndex: 0, rotate: '6deg' }}>
          <StickyNote color={NOTE_YELLOW} rotate={6} style={{ width: 100, padding: '0.75rem', opacity: 0.7 }}>
            <p style={{ fontWeight: 800, fontSize: '0.6rem', color: NAVY, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, textAlign: 'center' }}>Predict.</p>
          </StickyNote>
        </motion.div>
        <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          style={{ position: 'absolute', bottom: '22%', right: '5%', zIndex: 0 }}>
          <StickyNote color={NOTE_GREEN} rotate={-4} style={{ width: 100, padding: '0.75rem', opacity: 0.65 }}>
            <p style={{ fontWeight: 800, fontSize: '0.6rem', color: NAVY, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, textAlign: 'center' }}>Empower.</p>
          </StickyNote>
        </motion.div>

        {/* back to home */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#999', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = PURPLE)}
            onMouseLeave={e => (e.currentTarget.style.color = '#999')}>
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* ── RIGHT PANEL: form ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem', position: 'relative', zIndex: 1, overflowY: 'auto' }}>
        <motion.div initial={{ opacity: 0, y: 28, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          style={{ width: '100%', maxWidth: 460 }}>

          {/* mobile logo */}
          <div className="lg:hidden" style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: 40, height: 40, background: `linear-gradient(135deg,${PURPLE},${PURPLE_DARK})`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Brain size={20} color="#fff" />
                </div>
                <span className="font-cinzel" style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '0.12em', color: NAVY }}>SENSEI</span>
              </div>
            </Link>
          </div>

          {/* heading */}
          <div style={{ marginBottom: '2rem' }}>
            <motion.h1 className="font-cinzel" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              style={{ fontSize: '1.8rem', fontWeight: 900, color: NAVY, marginBottom: '0.5rem' }}>Welcome Back</motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }}
              style={{ fontSize: '0.92rem', color: '#555', fontWeight: 500 }}>Sign in to your Sensei workspace</motion.p>
          </div>

          {/* main card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            style={{ background: '#fff', border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: 20, padding: '2rem', boxShadow: '0 8px 32px rgba(0,0,0,0.09), 0 2px 8px rgba(123,79,233,0.06)', position: 'relative', overflow: 'hidden' }}>
            {/* tape strip at top of card */}
            <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', width: 64, height: 18, background: 'rgba(210,190,140,0.55)', borderRadius: 4, border: '1px solid rgba(0,0,0,0.06)' }} />
            {/* subtle polka pattern inside card */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(123,79,233,0.04) 1px, transparent 1px)', backgroundSize: '18px 18px', pointerEvents: 'none', borderRadius: 20 }} />

            {/* role tabs */}
            <div style={{ display: 'flex', background: '#F8F4FF', borderRadius: 12, padding: 4, gap: 4, marginBottom: '1.75rem', position: 'relative', zIndex: 1 }}>
              {ROLES.map(({ id, label, Icon, color }, idx) => (
                <button key={id} type="button" onClick={() => setSelectedRole(id)}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', padding: '0.6rem 0', borderRadius: 9, border: 'none', cursor: 'pointer', background: selectedRole === id ? '#fff' : 'transparent', color: selectedRole === id ? color : '#999', boxShadow: selectedRole === id ? '0 2px 8px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.25s', fontFamily: "'Raleway', sans-serif", fontWeight: 700 }}>
                  <Icon size={13} />
                  <span style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>{label}</span>
                </button>
              ))}
            </div>

            {/* role accent bar */}
            <AnimatePresence>
              <motion.div key={selectedRole} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} style={{ height: 3, background: activeRole.color, borderRadius: 2, marginBottom: '1.5rem', transformOrigin: '0%', position: 'relative', zIndex: 1 }} />
            </AnimatePresence>

            {/* form */}
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', zIndex: 1 }}>
              {/* email */}
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.15em', color: '#666', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="your@institution.edu"
                  style={{ width: '100%', background: '#FAFAFA', border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: 10, padding: '0.8rem 1rem', color: NAVY, fontSize: '0.92rem', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s', fontFamily: "'Raleway', sans-serif", boxSizing: 'border-box' }}
                  onFocus={e => { e.currentTarget.style.borderColor = `${activeRole.color}80`; e.currentTarget.style.boxShadow = `0 0 0 3px ${activeRole.color}14`; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; e.currentTarget.style.boxShadow = 'none'; }} />
              </div>

              {/* password */}
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.15em', color: '#666', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••••••"
                    style={{ width: '100%', background: '#FAFAFA', border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: 10, padding: '0.8rem 2.75rem 0.8rem 1rem', color: NAVY, fontSize: '0.92rem', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s', fontFamily: "'Raleway', sans-serif", letterSpacing: showPassword ? '0' : '0.2em', boxSizing: 'border-box' }}
                    onFocus={e => { e.currentTarget.style.borderColor = `${activeRole.color}80`; e.currentTarget.style.boxShadow = `0 0 0 3px ${activeRole.color}14`; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; e.currentTarget.style.boxShadow = 'none'; }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: 0, display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = NAVY)}
                    onMouseLeave={e => (e.currentTarget.style.color = '#aaa')}>
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* forgot */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-0.5rem' }}>
                <a href="#" style={{ fontSize: '0.72rem', color: '#aaa', textDecoration: 'none', transition: 'color 0.2s', fontWeight: 600 }}
                  onMouseEnter={e => (e.currentTarget.style.color = activeRole.color)}
                  onMouseLeave={e => (e.currentTarget.style.color = '#aaa')}>
                  Forgot password?
                </a>
              </div>

              {/* submit */}
              <motion.button type="submit" disabled={loading}
                whileHover={!loading ? { scale: 1.015, y: -2 } : {}}
                whileTap={!loading ? { scale: 0.99 } : {}}
                style={{ width: '100%', padding: '0.9rem 0', background: loading ? '#E0D9F5' : `linear-gradient(135deg,${activeRole.color},${activeRole.color === PURPLE ? PURPLE_DARK : activeRole.color}CC)`, color: loading ? '#aaa' : '#fff', fontWeight: 800, fontSize: '0.82rem', letterSpacing: '0.15em', borderRadius: 12, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.3s', fontFamily: "'Raleway', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: loading ? 'none' : `0 6px 20px ${activeRole.color}40` }}>
                {loading ? (
                  <>
                    <span style={{ width: 7, height: 7, background: '#bbb', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1.2s 0s infinite' }} />
                    <span style={{ width: 7, height: 7, background: '#bbb', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1.2s 0.15s infinite' }} />
                    <span style={{ width: 7, height: 7, background: '#bbb', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1.2s 0.3s infinite' }} />
                  </>
                ) : (
                  <>SIGN IN <ChevronRight size={16} /></>
                )}
              </motion.button>
            </form>

            {/* create account */}
            <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.82rem', color: '#888', position: 'relative', zIndex: 1 }}>
              Don&apos;t have an account?{' '}
              <Link href="/register" style={{ color: activeRole.color, textDecoration: 'none', fontWeight: 700, transition: 'opacity 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                Create Account
              </Link>
            </p>
          </motion.div>

          {/* demo quick access */}
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.875rem' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.08)' }} />
              <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#bbb', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Demo Quick Access</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.08)' }} />
            </div>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              {DEMOS.map(({ role, label, email: dEmail, pass }) => {
                const roleData = ROLES.find(r => r.id === role)!;
                return (
                  <button key={role} type="button"
                    onClick={() => { setSelectedRole(role); setEmail(dEmail); setPassword(pass); toast.success(`${label} credentials loaded`, { icon: '🚀' }); }}
                    style={{ flex: 1, padding: '0.6rem 0', background: '#F8F4FF', border: `1.5px solid rgba(0,0,0,0.08)`, borderRadius: 9, color: '#888', fontSize: '0.65rem', fontFamily: "'Raleway', sans-serif", fontWeight: 700, cursor: 'pointer', letterSpacing: '0.05em', transition: 'all 0.25s' }}
                    onMouseEnter={e => { const el = e.currentTarget; el.style.background = roleData.accentBg; el.style.borderColor = `${roleData.color}40`; el.style.color = roleData.color; }}
                    onMouseLeave={e => { const el = e.currentTarget; el.style.background = '#F8F4FF'; el.style.borderColor = 'rgba(0,0,0,0.08)'; el.style.color = '#888'; }}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* trust badges */}
          <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            {[['🔒', 'Secure'], ['⚡', 'Fast'], ['✅', 'Stable']].map(([icon, text]) => (
              <span key={text} style={{ fontSize: '0.72rem', color: '#999', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>{icon} {text}</span>
            ))}
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40%            { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
