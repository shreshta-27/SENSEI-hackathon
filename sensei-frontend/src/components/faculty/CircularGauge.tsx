'use client';

type CircularGaugeProps = {
  value: number;
  color?: string;
  displayValue?: string;
};

export default function CircularGauge({ value, color = '#10B981', displayValue }: CircularGaugeProps) {
  const radius = 46;
  const circumference = radius * 2 * Math.PI;
  const pct = Math.max(0, Math.min(100, value));
  const offset = circumference - (pct / 100) * circumference;
  
  const textVal = displayValue !== undefined ? displayValue : `${Math.round(pct)}%`;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="110" height="110" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} stroke="var(--border-card)" strokeWidth="10" fill="none" />
        <circle
          cx="60" cy="60" r={radius}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl leading-none text-[var(--text-primary)]" style={{ color: color }}>
          {textVal}
        </span>
      </div>
    </div>
  );
}
