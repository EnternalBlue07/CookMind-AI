import React, { useState } from 'react';
import { 
  Mic, Camera, ChefHat, 
  Sparkles, ArrowRight, Plus, Minus,
  Loader2, X, Info, Zap, Clock, Heart, Brain,
  Flame, Leaf, BarChart3, GripHorizontal, ScanLine
} from 'lucide-react';
import { Recipe, AppView, Ingredient } from './types';
import { generateRecipeFromIntent, identifyIngredientsFromImage } from './services/geminiService';
import { NutritionChart } from './components/NutritionChart';
import { CookingMode } from './components/CookingMode';
import { InsightsDashboard } from './components/InsightsDashboard';

const INITIAL_INVENTORY = ['Salt', 'Pepper', 'Oil', 'Onion', 'Tomato', 'Milk', 'Basmati Rice', 'Dal'];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsListeningLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Thinking...');
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const [inventory, setInventory] = useState<string[]>(INITIAL_INVENTORY);
  const [newInventoryItem, setNewInventoryItem] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // --- Voice Input Logic ---
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
    };

    recognition.start();
  };

  // --- Image Input Logic ---
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove data URL prefix (data:image/jpeg;base64,)
        const base64Data = base64String.split(',')[1];
        setSelectedImage(base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInventoryScan = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsListeningLoading(true);
    setLoadingMessage("Scanning Fridge...");
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        const items = await identifyIngredientsFromImage(base64Data);
        if (items.length > 0) {
          // Add only unique items
          const newItems = items.filter(i => !inventory.map(inv => inv.toLowerCase()).includes(i.toLowerCase()));
          setInventory(prev => [...prev, ...newItems]);
          alert(`Found: ${newItems.join(", ")}`);
        } else {
          alert("Couldn't identify food items clearly.");
        }
      } catch (e) {
        console.error(e);
        alert("Scan failed.");
      } finally {
        setIsListeningLoading(false);
        setLoadingMessage("Thinking...");
      }
    };
    reader.readAsDataURL(file);
  };

  // --- Core Generation Logic ---
  const handleGenerate = async (overrideInput?: string) => {
    const textToUse = overrideInput || inputText;
    if (!textToUse && !selectedImage) return;
    
    setIsListeningLoading(true);
    setLoadingMessage("Cooking up a plan...");
    try {
      const recipe = await generateRecipeFromIntent(textToUse, selectedImage, inventory);
      setGeneratedRecipe(recipe);
      setCurrentView(AppView.ANALYSIS);
    } catch (error) {
      console.error(error);
      alert("CookMind couldn't analyze that. Please check your API Key or try again.");
    } finally {
      setIsListeningLoading(false);
      setLoadingMessage("Thinking...");
    }
  };

  // --- Helper: Smart Inventory Check ---
  const checkInventoryStatus = (ingredient: Ingredient): boolean => {
    if (ingredient.inInventory) return true;
    const normalize = (str: string) => str.toLowerCase().replace(/s$/, '').trim();
    const target = normalize(ingredient.name);
    return inventory.some(item => {
      const inv = normalize(item);
      return inv.includes(target) || target.includes(inv);
    });
  };

  // --- Render Functions ---

  const renderHome = () => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
    
    const kitchenReadiness = Math.min(Math.round((inventory.length / 10) * 100), 85); 
    const possibleDishes = Math.floor(inventory.length * 1.8);
    const lowStock = Math.floor(Math.random() * 3);

    return (
      <div className="flex flex-col p-5 max-w-md mx-auto w-full pt-8">
        {/* HERO SECTION */}
        <header className="mb-6">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">CookMind AI v2.0</p>
              <h1 className="text-3xl font-bold text-dark leading-tight">
                {greeting}, Chef <span className="text-primary">.</span>
              </h1>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
               <div className="w-full h-full bg-gradient-to-tr from-primary to-secondary opacity-80" />
            </div>
          </div>
          <div className="bg-dark text-white p-4 rounded-2xl shadow-xl shadow-slate-300/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-300 text-xs font-medium uppercase">Kitchen Readiness</span>
                <span className="text-primary font-bold text-lg">{kitchenReadiness}%</span>
              </div>
              <div className="w-full bg-slate-700 h-1.5 rounded-full mb-3 overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-orange-500 h-full rounded-full transition-all duration-1000" style={{ width: `${kitchenReadiness}%` }}></div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                I can cook <span className="text-white font-bold">{possibleDishes} dishes</span> with what you already have. System is online.
              </p>
            </div>
          </div>
        </header>

        {/* AI STATUS CARD (KITCHEN BRAIN) */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
             <div className="p-2 bg-blue-50 text-blue-500 rounded-full mb-2"><Zap className="w-4 h-4" /></div>
             <span className="text-lg font-bold text-dark">{inventory.length}</span>
             <span className="text-[10px] text-slate-400 font-bold uppercase">Items Synced</span>
          </div>
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
             <div className="p-2 bg-red-50 text-red-500 rounded-full mb-2"><Flame className="w-4 h-4" /></div>
             <span className="text-lg font-bold text-dark">{lowStock}</span>
             <span className="text-[10px] text-slate-400 font-bold uppercase">Low Stock</span>
          </div>
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
             <div className="p-2 bg-green-50 text-green-500 rounded-full mb-2"><Heart className="w-4 h-4" /></div>
             <span className="text-lg font-bold text-dark">Good</span>
             <span className="text-[10px] text-slate-400 font-bold uppercase">Health Mode</span>
          </div>
        </div>

        {/* INPUT / COMMAND AREA */}
        <div className="mb-8">
           <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-white p-1 pl-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2">
                 <Brain className="w-5 h-5 text-primary animate-pulse" />
                 <input 
                   type="text"
                   value={inputText}
                   onChange={(e) => setInputText(e.target.value)}
                   placeholder="Type a dish, ingredient, or mood..."
                   className="flex-1 bg-transparent py-4 outline-none text-slate-700 placeholder:text-slate-400 font-medium"
                   onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                 />
                 <button 
                   onClick={handleVoiceInput}
                   className={`p-3 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white' : 'text-slate-400 hover:text-dark'}`}
                 >
                   <Mic className="w-5 h-5" />
                 </button>
              </div>
           </div>
           
           {/* Image Upload Trigger */}
           {selectedImage ? (
             <div className="mt-3 flex items-center gap-2 bg-slate-100 p-2 rounded-xl text-xs font-medium text-slate-600">
                <img src={`data:image/jpeg;base64,${selectedImage}`} className="w-8 h-8 rounded-lg object-cover" />
                <span>Image analyzed & ready</span>
                <button onClick={() => setSelectedImage(null)} className="ml-auto p-1 hover:bg-slate-200 rounded-full"><X className="w-3 h-3"/></button>
             </div>
           ) : (
             <div className="flex justify-end mt-2">
                <label className="text-xs font-semibold text-slate-400 hover:text-primary flex items-center gap-1 cursor-pointer transition-colors">
                  <Camera className="w-3 h-3" /> Upload Fridge/Dish Photo
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
             </div>
           )}
        </div>

        {/* CHOICE-BASED INTELLIGENCE (ACTIONS) */}
        <div className="mb-8">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1">Quick Commands</p>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => handleGenerate("Suggest a dish using strictly what I have in my inventory.")}
              className="bg-orange-50 hover:bg-orange-100 border border-orange-100 p-4 rounded-2xl text-left transition-colors group"
            >
              <div className="bg-white w-8 h-8 rounded-full flex items-center justify-center mb-2 shadow-sm text-orange-500 group-hover:scale-110 transition-transform">
                <ChefHat className="w-4 h-4" />
              </div>
              <span className="block text-slate-800 font-bold text-sm">Use Inventory</span>
              <span className="text-[10px] text-slate-500">Cook with what I have</span>
            </button>

            <button 
              onClick={() => handleGenerate("Suggest a quick dish that takes less than 20 minutes.")}
              className="bg-blue-50 hover:bg-blue-100 border border-blue-100 p-4 rounded-2xl text-left transition-colors group"
            >
              <div className="bg-white w-8 h-8 rounded-full flex items-center justify-center mb-2 shadow-sm text-blue-500 group-hover:scale-110 transition-transform">
                <Clock className="w-4 h-4" />
              </div>
              <span className="block text-slate-800 font-bold text-sm">20 Minutes</span>
              <span className="text-[10px] text-slate-500">Quick & easy meals</span>
            </button>

            <button 
              onClick={() => handleGenerate("Suggest a healthy, nutrient-rich dish low in oil and carbs.")}
              className="bg-green-50 hover:bg-green-100 border border-green-100 p-4 rounded-2xl text-left transition-colors group"
            >
              <div className="bg-white w-8 h-8 rounded-full flex items-center justify-center mb-2 shadow-sm text-green-500 group-hover:scale-110 transition-transform">
                <Leaf className="w-4 h-4" />
              </div>
              <span className="block text-slate-800 font-bold text-sm">Healthy</span>
              <span className="text-[10px] text-slate-500">Low calorie options</span>
            </button>

            <button 
              onClick={() => handleGenerate("Suggest something unique and exciting using my ingredients.")}
              className="bg-purple-50 hover:bg-purple-100 border border-purple-100 p-4 rounded-2xl text-left transition-colors group"
            >
              <div className="bg-white w-8 h-8 rounded-full flex items-center justify-center mb-2 shadow-sm text-purple-500 group-hover:scale-110 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="block text-slate-800 font-bold text-sm">Surprise Me</span>
              <span className="text-[10px] text-slate-500">Creative twist</span>
            </button>
          </div>
        </div>

        {/* CONTEXT AWARE SUGGESTION */}
        <div className="mb-6">
          <div className="bg-gradient-to-br from-dark to-slate-800 p-5 rounded-2xl shadow-lg relative overflow-hidden text-white">
             <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2 opacity-80">
                  <Brain className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wide">AI Recommendation</span>
                </div>
                <h3 className="font-medium text-lg mb-1">
                  {hour > 18 ? "Light dinner, heavy lunch?" : "Power up your morning."}
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  {hour > 18 
                    ? "Based on the time, a protein-rich, low-carb stir fry would be perfect." 
                    : "How about a high-energy breakfast to start your day?"}
                </p>
                <button 
                  onClick={() => handleGenerate(hour > 18 ? "Suggest a light protein rich dinner" : "Suggest a high energy breakfast")}
                  className="bg-primary hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                >
                  View Suggestions <ArrowRight className="w-4 h-4" />
                </button>
             </div>
             {/* Decorative */}
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    );
  }

  const renderAnalysis = () => {
    if (!generatedRecipe) return null;

    const missingIngredients = generatedRecipe.ingredients.filter(i => !checkInventoryStatus(i));

    return (
      <div className="flex flex-col bg-slate-50 min-h-full">
        {/* Hero Image / Title */}
        <div className="bg-white p-6 pb-8 rounded-b-[2.5rem] shadow-sm z-10 relative">
          <button onClick={() => setCurrentView(AppView.HOME)} className="absolute top-6 left-6 p-2 bg-slate-100 rounded-full hover:bg-slate-200">
             <ArrowRight className="w-5 h-5 rotate-180 text-slate-700" />
          </button>
          <div className="mt-8">
            <div className="flex justify-between items-start mb-2">
               <h1 className="text-3xl font-bold text-dark leading-tight">{generatedRecipe.name}</h1>
               <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase">{generatedRecipe.difficulty}</span>
            </div>
            <p className="text-slate-500 mb-4">{generatedRecipe.description}</p>
            
            {generatedRecipe.tips && generatedRecipe.tips.length > 0 && (
               <div className="mb-5 bg-amber-50 border border-amber-100 p-4 rounded-xl">
                  <h3 className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <Flame className="w-3 h-3" /> Chef's Tips
                  </h3>
                  <ul className="space-y-1.5">
                    {generatedRecipe.tips.map((tip, idx) => (
                      <li key={idx} className="text-sm text-slate-700 leading-relaxed flex items-start gap-2">
                        <span className="mt-1.5 w-1 h-1 bg-amber-400 rounded-full shrink-0"></span>
                        {tip}
                      </li>
                    ))}
                  </ul>
               </div>
            )}

            <div className="flex gap-4 text-sm text-slate-600 font-medium">
               <span className="flex items-center gap-1"><span className="text-primary">⏱</span> {generatedRecipe.prepTime} Prep</span>
               <span className="flex items-center gap-1"><span className="text-primary">🔥</span> {generatedRecipe.cookTime} Cook</span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <NutritionChart data={generatedRecipe.nutrition} />

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
             <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-dark">Ingredients</h3>
                <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">{generatedRecipe.servings} Servings</span>
             </div>
             
             <div className="space-y-3">
               {generatedRecipe.ingredients.map((ing, idx) => {
                 const hasIt = checkInventoryStatus(ing);
                 
                 return (
                   <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className={`font-medium ${hasIt ? 'text-slate-700' : 'text-red-500'}`}>
                                {ing.name}
                            </span>
                            {!hasIt && ing.estimatedCost && (
                                <span className="text-xs px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">
                                    {ing.estimatedCost}
                                </span>
                            )}
                        </div>
                        
                        <span className="text-xs text-slate-400 font-medium">
                            {ing.quantity}
                        </span>

                        {!hasIt && ing.substitute && (
                             <span className="text-xs text-orange-500 bg-orange-50 px-2 py-1 rounded w-fit flex items-center gap-1">
                                <Info className="w-3 h-3" /> Substitute: {ing.substitute}
                             </span>
                        )}
                      </div>

                      {hasIt ? (
                        <span className="text-secondary text-xs font-bold bg-secondary/10 px-2 py-1 rounded">HAVE</span>
                      ) : (
                        <span className="text-red-400 text-xs font-bold bg-red-50 px-2 py-1 rounded">MISSING</span>
                      )}
                   </div>
                 )
               })}
             </div>
             {missingIngredients.length > 0 && (
                 <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                    <p className="text-sm text-slate-500 mb-2">Estimated Grocery Cost: <span className="font-bold text-dark">{generatedRecipe.costEstimate}</span></p>
                 </div>
             )}
          </div>

          <button 
             onClick={() => setCurrentView(AppView.COOKING)}
             className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-red-500/30 flex items-center justify-center gap-2"
          >
            Start Cooking <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  const renderInventory = () => (
    <div className="p-6 pt-12 max-w-md mx-auto w-full flex flex-col">
      <h2 className="text-3xl font-bold mb-6 text-dark">Smart Pantry</h2>
      
      <div className="flex gap-3 mb-6">
        <label className="bg-primary text-white p-3 rounded-xl cursor-pointer hover:bg-red-500 transition shadow-lg shadow-red-500/20">
          <ScanLine className="w-6 h-6" />
          <input type="file" accept="image/*" className="hidden" onChange={handleInventoryScan} />
        </label>
        <div className="flex-1 flex gap-2">
          <input 
            type="text" 
            value={newInventoryItem}
            onChange={(e) => setNewInventoryItem(e.target.value)}
            placeholder="Add item"
            className="flex-1 bg-white border border-slate-200 p-3 rounded-xl outline-none focus:border-primary"
          />
          <button 
            onClick={() => {
              if (newInventoryItem) {
                setInventory([...inventory, newInventoryItem]);
                setNewInventoryItem('');
              }
            }}
            className="bg-dark text-white p-3 rounded-xl"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex-1">
        {inventory.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 border-b border-slate-50 last:border-0">
             <span className="font-medium text-slate-700">{item}</span>
             <button 
                onClick={() => setInventory(inventory.filter(i => i !== item))}
                className="text-slate-300 hover:text-red-500"
             >
               <Minus className="w-5 h-5" />
             </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-[#F7F9F9] h-[100dvh] w-full font-sans text-slate-800 relative overflow-hidden flex flex-col">
      
      {/* Content Area - Single Scroll Container */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {currentView === AppView.HOME && renderHome()}
        {currentView === AppView.ANALYSIS && renderAnalysis()}
        {currentView === AppView.INVENTORY && renderInventory()}
        {currentView === AppView.PROFILE && <InsightsDashboard />}
      </main>

      {/* Full Screen Overlays */}
      {currentView === AppView.COOKING && generatedRecipe && (
        <CookingMode recipe={generatedRecipe} onClose={() => setCurrentView(AppView.ANALYSIS)} />
      )}

      {/* Loading Overlay */}
      {isLoading && (
         <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-dark font-bold text-lg">{loadingMessage}</p>
            <p className="text-slate-400 text-sm">CookMind is working</p>
         </div>
      )}

      {/* Static Bottom Navigation */}
      {currentView !== AppView.COOKING && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 px-6 py-4 flex justify-between items-center z-40 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button 
             onClick={() => setCurrentView(AppView.HOME)}
             className={`flex flex-col items-center gap-1 transition-all duration-200 ${currentView === AppView.HOME || currentView === AppView.ANALYSIS ? 'text-primary scale-110' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <GripHorizontal className="w-6 h-6" />
            <span className="text-[10px] font-bold">Command</span>
          </button>
          
          <button 
             onClick={() => setCurrentView(AppView.INVENTORY)}
             className={`flex flex-col items-center gap-1 transition-all duration-200 ${currentView === AppView.INVENTORY ? 'text-primary scale-110' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <div className="relative">
              <ChefHat className="w-6 h-6" />
              {/* Optional notification dot */}
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white"></span>
            </div>
            <span className="text-[10px] font-bold">Kitchen</span>
          </button>

          <button 
             onClick={() => setCurrentView(AppView.PROFILE)}
             className={`flex flex-col items-center gap-1 transition-all duration-200 ${currentView === AppView.PROFILE ? 'text-primary scale-110' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <BarChart3 className="w-6 h-6" />
            <span className="text-[10px] font-bold">Insights</span>
          </button>
        </nav>
      )}
    </div>
  );
};

export default App;