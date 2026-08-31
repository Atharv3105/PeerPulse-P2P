import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function RadarChartBreakdown({ breakdown = {} }) {
  const data = [
    { subject: 'Cash Flow (30%)', score: breakdown.cashflow || 75, fullMark: 100 },
    { subject: 'UPI Graph (25%)', score: breakdown.upi || 70, fullMark: 100 },
    { subject: 'GST Filing (20%)', score: breakdown.gst || 85, fullMark: 100 },
    { subject: 'Operational (15%)', score: breakdown.operational || 65, fullMark: 100 },
    { subject: 'AA Telemetry (10%)', score: breakdown.aaData || 60, fullMark: 100 }
  ];

  return (
    <div className="w-full h-64 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#334155" strokeDasharray="3 3" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} 
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            stroke="#475569" 
            tick={{ fill: '#64748b', fontSize: 10 }}
          />
          <Radar
            name="Score Breakdown"
            dataKey="score"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
