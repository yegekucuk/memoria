'use client';

import React from 'react';
import { Session } from '@/types';
import { Download, Share2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ShareCardProps {
  sessions: Session[];
}

function generateCard(
  canvas: HTMLCanvasElement,
  data: {
    name: string;
    totalHours: number;
    sessionCount: number;
    topTag: string;
    streak: number;
    month: string;
  }
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = 600;
  const h = 340;
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

  // Logo — rounded square with 'm'
  const logoX = 40;
  const logoY = 32;
  const logoSize = 24;
  ctx.fillStyle = '#137fec';
  ctx.beginPath();
  ctx.roundRect(logoX, logoY, logoSize, logoSize, 6);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('m', logoX + logoSize / 2, logoY + logoSize / 2);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // Title
  ctx.fillStyle = '#137fec';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('memoria', logoX + logoSize + 10, 50);

  // Month
  ctx.fillStyle = '#64748b';
  ctx.font = '13px sans-serif';
  ctx.fillText(data.month, 40, 72);

  // Name
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(`${data.name}'s Focus Stats`, 40, 112);

  // Divider
  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, 132);
  ctx.lineTo(w - 40, 132);
  ctx.stroke();

  // Stat cards
  const stats = [
    { label: 'Total Hours', value: data.totalHours.toFixed(1) + 'h', color: '#137fec' },
    { label: 'Sessions', value: String(data.sessionCount), color: '#8b5cf6' },
    { label: 'Top Tag', value: data.topTag || '—', color: '#10b981' },
    { label: 'Streak', value: data.streak + ' days', color: '#f97316' },
  ];

  const cardW = 118;
  const startX = 40;
  const gap = 16;

  stats.forEach((stat, i) => {
    const x = startX + i * (cardW + gap);
    const y = 158;

    // Card bg
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.roundRect(x, y, cardW, 90, 12);
    ctx.fill();

    // Card border
    ctx.strokeStyle = stat.color + '20';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, cardW, 90, 12);
    ctx.stroke();

    // Value
    ctx.fillStyle = stat.color;
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(stat.value, x + 12, y + 38);

    // Label
    ctx.fillStyle = '#64748b';
    ctx.font = '11px sans-serif';
    ctx.fillText(stat.label, x + 12, y + 62);
  });

  // Footer
  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px sans-serif';
  ctx.fillText('Track your focus time at memoria.yegekucuk.me', 40, h - 36);
}

export const ShareCard: React.FC<ShareCardProps> = ({ sessions }) => {
  const { user } = useAuth();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const cardData = React.useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const monthSessions = sessions.filter(s => new Date(s.startTime) >= monthStart);
    const totalHours = monthSessions.reduce((a, s) => a + s.durationSeconds, 0) / 3600;

    // Top tag
    const tagTime = new Map<string, number>();
    monthSessions.forEach(s => {
      s.tags.forEach(t => tagTime.set(t, (tagTime.get(t) || 0) + s.durationSeconds));
    });
    let topTag = '';
    let topSec = 0;
    tagTime.forEach((sec, tag) => {
      if (sec > topSec) { topSec = sec; topTag = tag; }
    });

    // Streak
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
      sessionCount: monthSessions.length,
      topTag,
      streak,
      month: monthLabel,
    };
  }, [sessions, user]);

  React.useEffect(() => {
    if (canvasRef.current) {
      generateCard(canvasRef.current, cardData);
    }
  }, [cardData]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `memoria-${cardData.month.toLowerCase().replace(' ', '-')}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <Share2 size={18} className="text-primary" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Share Stats</h3>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-blue-600 transition-colors cursor-pointer"
        >
          <Download size={16} />
          Download PNG
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
        <canvas
          ref={canvasRef}
          className="w-full h-auto"
          style={{ maxWidth: '100%' }}
        />
      </div>
    </div>
  );
};
