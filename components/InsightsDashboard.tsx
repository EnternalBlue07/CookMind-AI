import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Legend
} from 'recharts';
import { Trophy, TrendingUp, Flame, Clock, Award, Leaf, Target, Star, Plus, X, CheckCircle, ChefHat, Utensils } from 'lucide-react';

const activityData = [
  { day: 'Mon', meals: 1 },
  { day: 'Tue', meals: 2 },
  { day: 'Wed', meals: 0 },
  { day: 'Thu', meals: 1 },
  { day: 'Fri', meals: 3 },
  { day: 'Sat', meals: 2 },
  { day: 'Sun', meals: 4 },
];

const flavorData = [
  { subject: 'Spicy', A: 120, fullMark: 150 },
  { subject: 'Sweet', A: 80, fullMark: 150 },
  { subject: 'Savory', A: 130, fullMark: 150 },
  { subject: 'Healthy', A: 100, fullMark: 150 },
  { subject: 'Exotic', A: 60, fullMark: 150 },
  { subject: 'Quick', A: 90, fullMark: 150 },
];

const cuisineData = [
  { name: 'Indian', value: 45, color: '#FF6B6B' }, // Primary
  { name: 'Italian', value: 25, color: '#4ECDC4' }, // Secondary
  { name: 'Asian', value: 20, color: '#FFE66D' }, // Yellow
  { name: 'Other', value: 10, color: '#2D3436' }, // Dark
];

const BADGES = [
  { name: 'Weekender', icon: <Star className="w-5 h-5 text-yellow-500" />, bg: 'bg-yellow-100', desc: 'Cooked 5 meals on weekends' },
  { name: 'Spice Lord', icon: <Flame className="w-5 h-5 text-red-500" />, bg: 'bg-red-100', desc: 'Used high spice levels 3x' },
  { name: 'Eco Warrior', icon: <Leaf className="w-5 h-5 text-green-500" />, bg: 'bg-green-100', desc: 'Zero waste for 7 days' },
  { name: 'Speedster', icon: <Clock className="w-5 h-5 text-blue-500" />, bg: 'bg-blue-100', desc: '3 meals under 20 mins' },
];

interface Goal {
  id: string;
  title: string;
  current: number;
  target: number;
  unit: string;
  icon: React.ReactNode;
  colorClass: string; 
  bgClass: string;
  textClass: string;
}

export const InsightsDashboard: React.FC = () => {
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalUnit, setNewGoalUnit] = useState('meals');

  const [goals, setGoals] = useState<Goal[]>([
    { 
      id: '1', 
      title: 'Eat Healthy Dinners', 
      current: 3, 
      target: 5, 
      unit: 'meals/wk', 
      icon: <Leaf className="w-4 h-4" />, 
      colorClass: 'bg-green-500',
      bgClass: 'bg-green-50',
      textClass: 'text-green-600'
    },
    { 
      id: '2', 
      title: 'Cook New Recipes', 
      current: 1, 
      target: 2, 
      unit: 'recipes/mo', 
      icon: <ChefHat className="w-4 h-4" />, 
      colorClass: 'bg-orange-500',
      bgClass: 'bg-orange-50',
      textClass: 'text-orange-600'
    }
  ]);

  const addGoal = () => {
    if(!newGoalTitle || !newGoalTarget) return;
    
    const newGoal: Goal = {
      id: Date.now().toString(),
      title: newGoalTitle,
      current: 0,
      target: parseInt(newGoalTarget),
      unit: newGoalUnit,
      icon: <Target className="w-4 h-4" />,
      colorClass: 'bg-blue-500',
      bgClass: 'bg-blue-50',
      textClass: 'text-blue-600'
    };
    
    setGoals([...goals, newGoal]);
    setNewGoalTitle('');
    setNewGoalTarget('');
    setNewGoalUnit('meals');
    setShowGoalModal(false);
  };

  // Calculate statistics
  const totalMeals = activityData.reduce((acc, curr) => acc + curr.meals, 0);
  const averageMeals = totalMeals / activityData.length;

  return (
    <div className="p-6 pt-12 max-w-md mx-auto w-full flex flex-col relative">
      
      {/* Header & Level */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-orange-400 p-1 shadow-xl">
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
            <UserAvatar />
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-dark">Master Chef</h2>
          <div className="flex justify-between items-center text-xs text-slate-500 font-medium mb-1">
            <span>Level 12</span>
            <span>2,450 / 3,000 XP</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-primary w-[82%] rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
           <div className="p-2 bg-orange-50 text-orange-500 rounded-full mb-2"><Flame className="w-4 h-4" /></div>
           <span className="text-xl font-bold text-dark">14</span>
           <span className="text-[10px] text-slate-400 font-bold uppercase">Day Streak</span>
        </div>
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
           <div className="p-2 bg-green-50 text-green-500 rounded-full mb-2"><Clock className="w-4 h-4" /></div>
           <span className="text-xl font-bold text-dark">28m</span>
           <span className="text-[10px] text-slate-400 font-bold uppercase">Avg Prep</span>
        </div>
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
           <div className="p-2 bg-blue-50 text-blue-500 rounded-full mb-2"><Trophy className="w-4 h-4" /></div>
           <span className="text-xl font-bold text-dark">85</span>
           <span className="text-[10px] text-slate-400 font-bold uppercase">Dishes</span>
        </div>
      </div>

      {/* --- GOALS SECTION --- */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="font-bold text-dark flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" /> My Goals
            </h3>
            <button 
              onClick={() => setShowGoalModal(true)}
              className="text-xs font-bold text-primary flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors"
            >
              <Plus className="w-3 h-3" /> Add Goal
            </button>
        </div>
        
        <div className="space-y-3">
            {goals.map(goal => (
              <div key={goal.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
                  <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${goal.bgClass} ${goal.textClass}`}>
                            {goal.icon}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-800">{goal.title}</p>
                            <p className="text-[10px] text-slate-400 font-medium">Target: {goal.target} {goal.unit}</p>
                          </div>
                      </div>
                      <div className="text-right">
                          <span className={`text-lg font-bold ${goal.textClass}`}>{goal.current}</span>
                          <span className="text-xs text-slate-400 font-bold">/{goal.target}</span>
                      </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${goal.colorClass} transition-all duration-1000 ease-out`} 
                        style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                      ></div>
                  </div>
              </div>
            ))}
        </div>
      </div>

      {/* Activity Chart */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-dark flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Cooking Activity
            </h3>
            <p className="text-[10px] text-slate-400 font-medium ml-6 mt-1">
               Avg: <span className="text-dark font-bold">{averageMeals.toFixed(1)} meals/day</span>
            </p>
          </div>
          <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">+12%</span>
        </div>
        {/* Explicit height and min-w-0 to fix Recharts width/height warnings */}
        <div className="h-48 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
              <Bar dataKey="meals" radius={[4, 4, 0, 0]}>
                {activityData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.meals > averageMeals ? '#FF6B6B' : '#cbd5e1'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Flavor & Cuisine */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Flavor Profile Radar */}
        <div className="bg-slate-900 p-5 rounded-3xl shadow-lg shadow-slate-300/50 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <h3 className="font-bold mb-2 relative z-10 flex items-center gap-2">
                <Target className="w-4 h-4 text-secondary" /> Flavor DNA
            </h3>
            {/* Explicit height and min-w-0 */}
            <div className="h-48 w-full min-w-0 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={flavorData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                <Radar name="My Taste" dataKey="A" stroke="#4ECDC4" strokeWidth={2} fill="#4ECDC4" fillOpacity={0.3} />
                </RadarChart>
            </ResponsiveContainer>
            </div>
        </div>

        {/* Cuisine Mix Pie */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
            <h3 className="font-bold text-dark mb-2 flex items-center gap-2">
                <Utensils className="w-4 h-4 text-orange-500" /> Top Cuisines
            </h3>
            {/* Changed flex-1 to explicit height to prevent collapse */}
            <div className="h-48 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={cuisineData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={60}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {cuisineData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend 
                            verticalAlign="bottom" 
                            align="center" 
                            iconType="circle" 
                            iconSize={8}
                            wrapperStyle={{ fontSize: '10px' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* Meal Time Distribution */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 mb-6">
        <h3 className="font-bold text-dark mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-500" /> Meal Timing Habits
        </h3>
        <div className="space-y-4">
            <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-600">Early Birds (Breakfast)</span>
                    <span className="text-slate-800">30%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-purple-400 h-full rounded-full" style={{ width: '30%' }}></div>
                </div>
            </div>
            <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-600">Lunch Rush</span>
                    <span className="text-slate-800">20%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-purple-400 h-full rounded-full opacity-60" style={{ width: '20%' }}></div>
                </div>
            </div>
            <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-600">Dinner & Late Night</span>
                    <span className="text-slate-800">50%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: '50%' }}></div>
                </div>
            </div>
        </div>
      </div>

      {/* Badges */}
      <div className="mb-8">
        <h3 className="font-bold text-dark mb-3 px-1 flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-500" /> Recent Achievements
        </h3>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
           {BADGES.map((badge, idx) => (
             <div key={idx} className="min-w-[140px] bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                <div className={`p-3 rounded-full mb-2 ${badge.bg}`}>
                   {badge.icon}
                </div>
                <p className="font-bold text-sm text-dark mb-1">{badge.name}</p>
                <p className="text-[10px] text-slate-400 leading-tight">{badge.desc}</p>
             </div>
           ))}
        </div>
      </div>

      <div className="text-center text-xs text-slate-400 pb-8">
        CookMind AI ID: 8829-XJ-22
      </div>

      {/* --- ADD GOAL MODAL --- */}
      {showGoalModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl transform transition-all scale-100">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-dark">Set New Goal</h3>
                <button onClick={() => setShowGoalModal(false)} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 text-slate-500">
                  <X className="w-4 h-4" />
                </button>
             </div>

             <div className="space-y-4 mb-6">
               <div>
                 <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Goal Title</label>
                 <input 
                   type="text" 
                   value={newGoalTitle}
                   onChange={(e) => setNewGoalTitle(e.target.value)}
                   placeholder="e.g. Reduce sugar"
                   className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl font-medium text-slate-700 outline-none focus:border-primary focus:bg-white transition-colors"
                 />
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Target</label>
                   <input 
                     type="number" 
                     value={newGoalTarget}
                     onChange={(e) => setNewGoalTarget(e.target.value)}
                     placeholder="5"
                     className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl font-medium text-slate-700 outline-none focus:border-primary focus:bg-white transition-colors"
                   />
                 </div>
                 <div>
                   <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Unit</label>
                   <input 
                     type="text" 
                     value={newGoalUnit}
                     onChange={(e) => setNewGoalUnit(e.target.value)}
                     placeholder="meals/wk"
                     className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl font-medium text-slate-700 outline-none focus:border-primary focus:bg-white transition-colors"
                   />
                 </div>
               </div>
             </div>

             <button 
               onClick={addGoal}
               className="w-full py-3.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-red-500/20 hover:bg-red-500 transition-colors flex justify-center items-center gap-2"
             >
               <CheckCircle className="w-4 h-4" /> Create Goal
             </button>
           </div>
         </div>
       )}
    </div>
  );
};

const UserAvatar = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="#2D3436"/>
    <path d="M12.0002 14.5C6.99016 14.5 2.91016 17.86 2.91016 22C2.91016 22.28 3.13016 22.5 3.41016 22.5H20.5902C20.8702 22.5 21.0902 22.28 21.0902 22C21.0902 17.86 17.0102 14.5 12.0002 14.5Z" fill="#2D3436"/>
  </svg>
);