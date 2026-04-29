'use client';

import React from 'react';
import { Session, User } from '@/types';
import { Download, Share2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ShareCardData {
  name: string;
  totalHours: number;
  sessionCount: number;
  topTag: string;
  streak: number;
  label: string;
}

function computePeriodData(
  sessions: Session[],
  periodStart: Date,
  label: string,
  user: User | null
): ShareCardData {
  const periodSessions = sessions.filter(s => new Date(s.startTime) >= periodStart);
  const totalHours = periodSessions.reduce((a, s) => a + s.durationSeconds, 0) / 3600;

  const tagTime = new Map<string, number>();
  periodSessions.forEach(s => {
    s.tags.forEach(t => tagTime.set(t, (tagTime.get(t) || 0) + s.durationSeconds));
  });
  let topTag = '';
  let topSec = 0;
  tagTime.forEach((sec, tag) => {
    if (sec > topSec) { topSec = sec; topTag = tag; }
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  const check = new Date(today);
  while (true) {
    const key = check.toISOString().split('T')[0];
    const hasSession = sessions.some(s => {
      const sd = new Date(s.startTime);
      return sd.toISOString().split('T')[0] === key && s.durationSeconds > 0;
    });
    if (hasSession) { streak++; check.setDate(check.getDate() - 1); }
    else if (check.getTime() === today.getTime()) { check.setDate(check.getDate() - 1); continue; }
    else break;
  }

  return {
    name: user?.name || user?.email?.split('@')[0] || 'User',
    totalHours,
    sessionCount: periodSessions.length,
    topTag,
    streak,
    label,
  };
}

interface ShareCardProps {
  sessions: Session[];
}

function generateCard(
  canvas: HTMLCanvasElement,
  data: ShareCardData,
  logo: HTMLImageElement | null
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = 600;
  const h = 420;
  canvas.width = w;
  canvas.height = h;

  // Background mesh
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#eff6ff');
  bg.addColorStop(0.5, '#fefce8');
  bg.addColorStop(1, '#f3e8ff');
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, 24);
  ctx.fill();

  // Blur circle decoration
  ctx.save();
  ctx.beginPath();
  ctx.arc(w - 50, 0, 120, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(19, 127, 236, 0.12)';
  ctx.filter = 'blur(40px)';
  ctx.fill();
  ctx.restore();

  // Logo
  if (logo) {
    ctx.drawImage(logo, 36, 28, 110, 28);
  }

  // Month
  ctx.fillStyle = '#64748b';
  ctx.font = '13px sans-serif';
  ctx.fillText(data.label, 40, 80);

  // Name
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(`${data.name}'s Focus Stats`, 40, 118);

  // Divider
  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, 138);
  ctx.lineTo(w - 40, 138);
  ctx.stroke();

  // Stat cards — 2x2 grid
  const stats = [
    { label: 'Total Hours', value: data.totalHours.toFixed(1) + 'h', color: '#137fec' },
    { label: 'Sessions', value: String(data.sessionCount), color: '#8b5cf6' },
    { label: 'Top Tag', value: data.topTag || '—', color: '#10b981' },
    { label: 'Streak', value: data.streak + ' days', color: '#f97316' },
  ];

  const cardW = 252;
  const cardH = 80;
  const cols = 2;
  const gap = 16;
  const startX = 40;
  const startY = 158;

  const rows = 2;

  stats.forEach((stat, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * (cardW + gap);
    const y = startY + row * (cardH + gap);

    // Card bg
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.roundRect(x, y, cardW, cardH, 12);
    ctx.fill();

    // Card border
    ctx.strokeStyle = stat.color + '20';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, cardW, cardH, 12);
    ctx.stroke();

    // Value
    ctx.fillStyle = stat.color;
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(stat.value, x + 14, y + 34);

    // Label
    ctx.fillStyle = '#64748b';
    ctx.font = '11px sans-serif';
    ctx.fillText(stat.label, x + 14, y + 58);
  });

  // Footer
  const footerY = startY + rows * (cardH + gap) + 28;
  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px sans-serif';
  ctx.fillText('Track your focus time at memoria.yegekucuk.me', 40, footerY);
}

export const ShareCard: React.FC<ShareCardProps> = ({ sessions }) => {
  const { user } = useAuth();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const logoRef = React.useRef<HTMLImageElement | null>(null);
  const [logoReady, setLogoReady] = React.useState(false);

  // Load logo image
  React.useEffect(() => {
    const img = new Image();
    img.src = '/memoria-logo-3-removebg.png';
    img.onload = () => {
      logoRef.current = img;
      setLogoReady(true);
    };
  }, []);

  const monthlyData = React.useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const label = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    return computePeriodData(sessions, monthStart, label, user);
  }, [sessions, user]);

  const yearlyData = React.useMemo(() => {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    return computePeriodData(sessions, yearStart, String(now.getFullYear()), user);
  }, [sessions, user]);

  React.useEffect(() => {
    if (canvasRef.current) {
      generateCard(canvasRef.current, monthlyData, logoRef.current);
    }
  }, [monthlyData, logoReady]);

  const downloadCard = (data: ShareCardData, filename: string) => {
    if (!canvasRef.current) return;
    generateCard(canvasRef.current, data, logoRef.current);
    setTimeout(() => {
      if (!canvasRef.current) return;
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvasRef.current.toDataURL('image/png');
      link.click();
      // Restore monthly preview
      generateCard(canvasRef.current, monthlyData, logoRef.current);
    }, 100);
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Share2 size={18} className="text-primary" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Share Stats</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadCard(monthlyData, `memoria-${monthlyData.label.toLowerCase().replace(' ', '-')}.png`)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-blue-600 transition-colors cursor-pointer"
          >
            <Download size={14} />
            Monthly
          </button>
          <button
            onClick={() => downloadCard(yearlyData, `memoria-${yearlyData.label}.png`)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-blue-600 transition-colors cursor-pointer"
          >
            <Download size={14} />
            Yearly
          </button>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
