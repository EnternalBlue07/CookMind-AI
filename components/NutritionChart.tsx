import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { NutritionData } from '../types';

interface NutritionChartProps {
  data: NutritionData;
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D'];

export const NutritionChart: React.FC<NutritionChartProps> = ({ data }) => {
  const chartData = [
    { name: 'Protein', value: parseInt(data.protein) || 0 },
    { name: 'Carbs', value: parseInt(data.carbs) || 0 },
    { name: 'Fats', value: parseInt(data.fats) || 0 },
  ];

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center w-full">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Macro Breakdown</h3>
      {/* Explicit min-height and min-width to prevent Recharts rendering issues */}
      <div className="w-full h-48 min-h-[192px] min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={60}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-center">
        <p className="text-2xl font-bold text-slate-800">{data.calories}</p>
        <p className="text-xs text-slate-400">Total Calories</p>
        <div className="mt-2 inline-block px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
          {data.healthLabel}
        </div>
      </div>
    </div>
  );
};