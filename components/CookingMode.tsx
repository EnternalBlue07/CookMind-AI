import React, { useState, useEffect } from 'react';
import { Recipe, CookingStep } from '../types';
import { ArrowLeft, ArrowRight, Volume2, Timer, CheckCircle, Flame, Camera, X } from 'lucide-react';
import { validateCookedDish } from '../services/geminiService';

interface CookingModeProps {
  recipe: Recipe;
  onClose: () => void;
}

export const CookingMode: React.FC<CookingModeProps> = ({ recipe, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  
  // Verification State
  const [showVerification, setShowVerification] = useState(false);
  const [verificationImage, setVerificationImage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{ isValid: boolean; message: string } | null>(null);

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
    } else {
      // Last step, trigger verification
      setShowVerification(true);
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

  const handleVerificationUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        setVerificationImage(base64Data);
        
        // Auto verify
        setIsVerifying(true);
        const result = await validateCookedDish(base64Data, recipe.name);
        setVerificationResult(result);
        setIsVerifying(false);
      };
      reader.readAsDataURL(file);
    }
  };

  if (showVerification) {
    return (
      <div className="fixed inset-0 bg-slate-900 text-white z-50 flex flex-col items-center justify-center p-6">
        <button onClick={() => setShowVerification(false)} className="absolute top-6 left-6 text-slate-400">
           <ArrowLeft className="w-6 h-6" />
        </button>
        
        <h2 className="text-3xl font-bold mb-2">Bon Appétit!</h2>
        <p className="text-slate-400 mb-8 text-center max-w-xs">
          To complete this cooking session, please verify your masterpiece.
        </p>

        {!verificationImage ? (
           <label className="w-full max-w-xs aspect-square rounded-3xl border-2 border-dashed border-slate-600 flex flex-col items-center justify-center bg-slate-800 cursor-pointer hover:bg-slate-700 transition">
              <Camera className="w-12 h-12 text-primary mb-4" />
              <span className="font-bold">Upload Dish Photo</span>
              <span className="text-xs text-slate-500 mt-2">Required for verification</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleVerificationUpload} />
           </label>
        ) : (
           <div className="w-full max-w-xs rounded-3xl overflow-hidden bg-slate-800 border border-slate-700">
              <img src={`data:image/jpeg;base64,${verificationImage}`} className="w-full h-48 object-cover" />
              <div className="p-6 text-center">
                 {isVerifying ? (
                    <div className="flex flex-col items-center gap-2">
                       <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                       <p className="text-sm font-bold">Verifying...</p>
                    </div>
                 ) : verificationResult ? (
                    <div>
                       {verificationResult.isValid ? (
                         <div className="text-green-500 flex flex-col items-center gap-2">
                            <CheckCircle className="w-10 h-10" />
                            <p className="font-bold text-lg">Verified!</p>
                            <p className="text-xs text-slate-400">{verificationResult.message}</p>
                         </div>
                       ) : (
                         <div className="text-red-500 flex flex-col items-center gap-2">
                            <X className="w-10 h-10" />
                            <p className="font-bold text-lg">Not Verified</p>
                            <p className="text-xs text-slate-400">{verificationResult.message}</p>
                            <button onClick={() => setVerificationImage(null)} className="text-white text-xs underline mt-2">Try Again</button>
                         </div>
                       )}
                    </div>
                 ) : null}
              </div>
           </div>
        )}
        
        {verificationResult?.isValid && (
           <button 
             onClick={onClose}
             className="mt-8 bg-primary text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:bg-red-500 transition w-full max-w-xs"
           >
             Finish Cooking
           </button>
        )}
      </div>
    )
  }

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
            className="p-4 rounded-full bg-primary hover:bg-red-500 text-white transition shadow-lg shadow-red-900/20"
          >
            {currentStepIndex === recipe.steps.length - 1 ? (
              <CheckCircle className="w-8 h-8" />
            ) : (
              <ArrowRight className="w-8 h-8" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};