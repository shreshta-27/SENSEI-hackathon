'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Phone, Mail, AlertTriangle, MessageCircle, FileText } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import StickyCard from '@/components/faculty/StickyCard';
import RiskBadge from '@/components/faculty/RiskBadge';
import ComicButton from '@/components/faculty/ComicButton';
import TeacherAvatar from '@/components/faculty/TeacherAvatar';
import CircularGauge from '@/components/faculty/CircularGauge';

export default function StudentDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showIntervention, setShowIntervention] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (id) {
      api.get(`/api/teacher/students/${id}`)
        .then(r => setData(r.data))
        .catch(() => toast.error('Failed to load student details'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const sendIntervention = async () => {
    if (!msg) return;
    try {
      await api.post('/api/teacher/interventions', { studentId: id, message: msg, triggerType: 'manual', urgency: 'medium' });
      toast.success('Intervention sent');
      setShowIntervention(false);
      setMsg('');
      api.get(`/api/teacher/students/${id}`).then(r => setData(r.data));
    } catch {
      toast.error('Failed to send');
    }
  };

  if (loading) return <div className="text-center py-20 font-handwrite text-2xl text-[var(--text-muted)]">Loading student profile…</div>;
  if (!data || !data.user) return <div className="text-center py-20 font-ui text-red-500">Student not found</div>;

  const { user, insight, interventions, marks, attendance } = data;
  const avgAtt = attendance?.length ? attendance.reduce((a: number, b: any) => a + b.percentage, 0) / attendance.length : 0;
  const latestCgpa = insight?.cgpa || 0;
  const risk = insight?.riskLevel || 'low';

  return (
    <div className="page-mobile-pad space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 font-ui text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--accent-purple)] transition-colors">
        <ArrowLeft size={16} /> Back to Students
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <StickyCard color="yellow" rotation={-1}>
            <div className="flex flex-col items-center text-center">
              <TeacherAvatar name={user.name} size={80} />
              <h2 className="mt-4 font-display text-2xl text-[var(--text-primary)]">{user.name}</h2>
              <p className="font-ui text-sm text-[var(--text-secondary)]">{user.studentId} • {user.department}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <RiskBadge level={risk} />
              </div>
            </div>
            <hr className="my-4 border-t-2 border-[var(--border-card)] border-dashed" />
            <div className="space-y-3 font-ui text-sm">
              <div className="flex items-center gap-2"><Mail size={14} className="text-[var(--text-muted)]"/> {user.email}</div>
            </div>
            <div className="mt-6 flex flex-col gap-2">
              <ComicButton variant="primary" icon={<MessageCircle size={16} />} onClick={() => setShowIntervention(true)}>
                Message Student
              </ComicButton>
            </div>
          </StickyCard>

          <StickyCard color="purple">
            <h3 className="font-display text-xl mb-4">Overall Stats</h3>
            <div className="flex justify-around items-center">
              <div className="flex flex-col items-center gap-2">
                <CircularGauge value={latestCgpa * 10} color="#7C3AED" displayValue={Number(latestCgpa).toFixed(1)} />
                <span className="font-ui font-bold text-xs uppercase tracking-wider text-[var(--text-muted)]">CGPA</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <CircularGauge value={avgAtt} color={avgAtt < 75 ? '#FF4F4F' : '#30D158'} displayValue={`${Math.round(avgAtt)}%`} />
                <span className="font-ui font-bold text-xs uppercase tracking-wider text-[var(--text-muted)]">Attendance</span>
              </div>
            </div>
          </StickyCard>
        </div>

        <div className="md:col-span-2 space-y-6">
          <StickyCard color="blue">
            <h3 className="font-display text-2xl mb-4">AI Insights</h3>
            {insight ? (
              <div className="space-y-4">
                <div className="p-4 bg-white/60 rounded-xl border-2 border-[var(--border-doodle)]">
                  <p className="font-body text-[var(--text-primary)] leading-relaxed">
                    <strong className="font-ui">Analysis:</strong> {insight.riskReason || 'Performing adequately.'}
                  </p>
                </div>
                <div>
                  <h4 className="font-ui font-bold mb-2">Recommendations</h4>
                  <ul className="list-disc pl-5 font-body text-sm text-[var(--text-secondary)] space-y-1">
                    {insight.recommendations?.map((r: string, i: number) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="font-body text-[var(--text-muted)]">No AI insights generated yet.</p>
            )}
          </StickyCard>

          <StickyCard color="green">
            <h3 className="font-display text-2xl mb-4">Recent Interventions</h3>
            {interventions?.length > 0 ? (
              <div className="space-y-3">
                {interventions.map((inv: any) => (
                  <div key={inv._id} className="p-3 bg-white/70 rounded-xl border border-[var(--border-card)]">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-ui font-bold text-sm text-[var(--text-primary)]">{new Date(inv.createdAt).toLocaleDateString()}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${inv.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {inv.status}
                      </span>
                    </div>
                    <p className="font-body text-sm text-[var(--text-secondary)]">{inv.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-body text-[var(--text-muted)]">No interventions logged.</p>
            )}
          </StickyCard>
        </div>
      </div>

      {showIntervention && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <StickyCard color="orange" className="w-full max-w-md !p-6">
            <h3 className="font-display text-2xl mb-4">New Intervention</h3>
            <textarea
              className="w-full bg-white/80 border-2 border-[var(--border-doodle)] rounded-xl px-3 py-2 font-body text-sm outline-none focus:border-[var(--accent-purple)] min-h-[100px] mb-4"
              placeholder={`Message to ${user.name}...`}
              value={msg}
              onChange={e => setMsg(e.target.value)}
            />
            <div className="flex gap-3">
              <ComicButton variant="primary" onClick={sendIntervention} className="flex-1">Send</ComicButton>
              <ComicButton variant="ghost" onClick={() => setShowIntervention(false)} className="flex-1">Cancel</ComicButton>
            </div>
          </StickyCard>
        </div>
      )}
    </div>
  );
}
