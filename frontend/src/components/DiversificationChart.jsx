import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

export default function DiversificationChart({ investments = [] }) {
  // Aggregate by grade
  const gradeDistribution = { 'Grade A': 0, 'Grade B': 0, 'Grade C': 0 };
  
  if (investments.length === 0) {
    gradeDistribution['Grade A'] = 50000;
    gradeDistribution['Grade B'] = 50000;
    gradeDistribution['Grade C'] = 25000;
  } else {
    investments.forEach(inv => {
      const g = inv.loanId?.acieScore?.grade;
      const key = g === 'A' ? 'Grade A' : g === 'B' ? 'Grade B' : 'Grade C';
      gradeDistribution[key] = (gradeDistribution[key] || 0) + (inv.trancheAmount || 25000);
    });
  }

  const data = [
    { name: 'Grade A (Prime)', value: gradeDistribution['Grade A'] || 1, color: '#10b981' },
    { name: 'Grade B (Standard)', value: gradeDistribution['Grade B'] || 1, color: '#3b82f6' },
    { name: 'Grade C (Subprime)', value: gradeDistribution['Grade C'] || 1, color: '#f59e0b' }
  ];

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex flex-col items-center">
      <div className="w-full h-52 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs text-slate-400 font-medium">Total Exposure</span>
          <span className="text-sm font-bold text-white font-mono">₹{totalValue.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-2">
        {data.map(item => (
          <div key={item.name} className="flex items-center gap-1.5 text-xs text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span>{item.name.split(' ')[0]} {item.name.split(' ')[1]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
