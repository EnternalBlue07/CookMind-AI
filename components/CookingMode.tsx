import React, { useState, useEffect } from 'react';
import { Recipe, CookingStep } from '../types';
import { ArrowLeft, ArrowRight, Volume2, Timer, CheckCircle, Flame } from 'lucide-react';

interface CookingModeProps {
  recipe: Recipe;
  onClose: () => void;
}

export const CookingMode: React.FC<CookingModeProps> = ({ recipe, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const currentStep: CookingStep = recipe.steps[currentStepIndex];

  useEffect(() => {
    let interval: number;
    if (timerActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      // Play a beep sound here ideally
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const startTimer = (seconds: number) => {
    setTimeLeft(seconds);
    setTimerActive(true);
  };

  const nextStep = () => {
    if (currentStepIndex < recipe.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setTimerActive(false);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setTimerActive(false);
    }
  };

  const speakInstruction = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentStep.instruction);
      if (currentStep.tip) {
          utterance.text += ` Chef's Tip: ${currentStep.tip}`;
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 text-white z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-slate-700">
        <button onClick={onClose} className="text-slate-400 hover:text-white">Close</button>
        <h2 className="font-bold truncate max-w-[60%]">{recipe.name}</h2>
        <div className="text-sm font-mono text-primary">
          Step {currentStepIndex + 1}/{recipe.steps.length}
        </div>
      </div>

      {/* Main Content - Centered */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center overflow-y-auto">
        
        {/* Step Number Badge */}
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center border-2 border-primary mb-6">
            <span className="text-3xl font-bold">{currentStep.stepNumber}</span>
        </div>

        {/* Instruction Text */}
        <p className="text-2xl md:text-4xl font-medium leading-relaxed mb-8 transition-all">
          {currentStep.instruction}
        </p>

        {/* Tip Box */}
        {currentStep.tip && (
          <div className="bg-slate-800 border-l-4 border-yellow-400 p-4 rounded-r-lg max-w-lg mb-8 text-left w-full">
            <p className="text-yellow-400 font-bold flex items-center text-sm uppercase tracking-wide mb-1">
               <Flame className="w-4 h-4 mr-2" /> Chef&apos;s Insight
            </p>
            <p className="text-slate-200">{currentStep.tip}</p>
          </div>
        )}

        {/* Timer UI */}
        {currentStep.timerSeconds && currentStep.timerSeconds > 0 && (
          <div className="mb-8">
            <button
              onClick={() => startTimer(currentStep.timerSeconds!)}
              className={`flex items-center gap-3 px-8 py-4 rounded-full text-xl font-bold transition-all ${
                timerActive 
                  ? 'bg-red-500/20 text-red-400 border border-red-500 animate-pulse' 
                  : 'bg-primary text-white shadow-lg hover:bg-red-500'
              }`}
            >
              <Timer className="w-6 h-6" />
              {timerActive 
                ? `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}` 
                : `Start ${Math.floor(currentStep.timerSeconds / 60)}m Timer`
              }
            </button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-slate-800 p-6 pb-8 border-t border-slate-700">
        <div className="flex items-center justify-between max-w-2xl mx-auto gap-4">
          <button 
            onClick={prevStep}
            disabled={currentStepIndex === 0}
            className="p-4 rounded-full bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-600 transition"
          >
            <ArrowLeft className="w-8 h-8" />
          </button>

          <button 
            onClick={speakInstruction}
            className="p-5 rounded-full bg-slate-700 hover:bg-slate-600 border border-slate-500 transition shadow-lg"
          >
            <Volume2 className="w-8 h-8 text-secondary" />
          </button>

          <button 
            onClick={nextStep}
            disabled={currentStepIndex === recipe.steps.length - 1}
            className="p-4 rounded-full bg-primary disabled:opacity-30 disabled:cursor-not-allowed hover:bg-red-500 text-white transition shadow-lg shadow-red-900/20"
          >
            {currentStepIndex === recipe.steps.length - 1 ? (
              <CheckCircle className="w-8 h-8" />
            ) : (
              <ArrowRight className="w-8 h-8" />
            )}
          </button>
        </div>
        <p className="text-center text-slate-500 text-xs mt-4">
          Voice commands: "Next", "Repeat", "Timer" (Simulation)
        </p>
      </div>
    </div>
  );
};