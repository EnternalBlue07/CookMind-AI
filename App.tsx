import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, Camera, Search, ChefHat, ShoppingCart, 
  User, Sparkles, ArrowRight, Plus, Minus,
  Loader2, X, Info, Zap, Clock, Heart, Brain,
  Flame, Leaf, BarChart3, GripHorizontal, Check, Trash2
} from 'lucide-react';
import { Recipe, AppView, Ingredient } from './types';
import { generateRecipeFromIntent } from './services/geminiService';
import { NutritionChart } from './components/NutritionChart';
import { CookingMode } from './components/CookingMode';

const INITIAL_INVENTORY = ['Salt', 'Pepper', 'Oil', 'Onion', 'Tomato', 'Milk', 'Basmati Rice', 'Dal'];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const [inventory, setInventory] = useState<string[]>(INITIAL_INVENTORY);
  const [newInventoryItem, setNewInventoryItem] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Shopping List State
  const [shoppingList, setShoppingList] = useState<Ingredient[]>([]);
  const [itemToAddToGrocery, setItemToAddToGrocery] = useState<Ingredient | null>(null);
  const [groceryQuantity, setGroceryQuantity] = useState('');

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

  // --- Core Generation Logic ---
  const handleGenerate = async (overrideInput?: string) => {
    const textToUse = overrideInput || inputText;
    if (!textToUse && !selectedImage) return;
    
    setIsLoading(true);
    try {
      const recipe = await generateRecipeFromIntent(textToUse, selectedImage, inventory);
      setGeneratedRecipe(recipe);
      setCurrentView(AppView.ANALYSIS);
    } catch (error) {
      console.error(error);
      alert("CookMind couldn't analyze that. Please check your API Key or try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Helper: Smart Inventory Check ---
  // Combines AI's "inInventory" flag with a client-side fuzzy check
  // to handle cases where user adds items AFTER generation.
  const checkInventoryStatus = (ingredient: Ingredient): boolean => {
    // 1. Trust AI first (if strictly true)
    if (ingredient.inInventory) return true;

    // 2. Client-side fuzzy fallback
    const normalize = (str: string) => str.toLowerCase().replace(/s$/, '').trim(); // Remove trailing 's'
    const target = normalize(ingredient.name);
    
    return inventory.some(item => {
      const inv = normalize(item);
      // Check for substring matches (e.g. "Chopped Onion" matches "Onion")
      return inv.includes(target) || target.includes(inv);
    });
  };

  // --- Helper: Check Shopping List ---
  const isInShoppingList = (ingredientName: string) => {
    return shoppingList.some(item => item.name === ingredientName);
  };

  // --- Handlers for Grocery Modal ---
  const openGroceryModal = (ingredient: Ingredient) => {
    setItemToAddToGrocery(ingredient);
    setGroceryQuantity(ingredient.quantity);
  };

  const confirmAddToGrocery = () => {
    if (itemToAddToGrocery) {
      setShoppingList(prev => [...prev, { ...itemToAddToGrocery, quantity: groceryQuantity }]);
      setItemToAddToGrocery(null);
      setGroceryQuantity('');
    }
  };

  // --- Render Functions ---

  const renderHome = () => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
    
    // Mock AI Intelligence Metrics
    const kitchenReadiness = Math.min(Math.round((inventory.length / 10) * 100), 85); 
    const possibleDishes = Math.floor(inventory.length * 1.8);
    const lowStock = Math.floor(Math.random() * 3);

    return (
      <div className="flex flex-col h-full p-5 max-w-md mx-auto w-full pt-10 pb-24 overflow-y-auto no-scrollbar">
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
           
           {/* Image Upload Trigger - Subtle */}
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

        {/* LIVE KITCHEN SNAPSHOT */}
        <div>
          <div className="flex justify-between items-center mb-3 ml-1">
             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kitchen Snapshot</p>
             <button onClick={() => setCurrentView(AppView.INVENTORY)} className="text-xs text-primary font-bold">Manage</button>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
             <div className="flex flex-wrap gap-2 mb-4">
               {inventory.slice(0, 5).map((item, idx) => (
                 <span key={idx} className="px-2 py-1 bg-slate-50 text-slate-600 rounded text-xs font-medium border border-slate-100">
                    {item}
                 </span>
               ))}
               {inventory.length > 5 && <span className="px-2 py-1 text-slate-400 text-xs">+{inventory.length - 5} more</span>}
             </div>
             
             {/* The "Hook" */}
             <div className="flex items-start gap-3 pt-3 border-t border-slate-50">
               <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                 <ShoppingCart className="w-4 h-4" />
               </div>
               <div>
                  <p className="text-sm text-dark font-medium">You're 1 ingredient away from <span className="font-bold">Paneer Tikka</span>.</p>
                  <p className="text-xs text-slate-400 mt-1">Missing: <span className="text-red-500">Capsicum</span> (₹20 est)</p>
               </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  const renderAnalysis = () => {
    if (!generatedRecipe) return null;

    // Use helper to determine missing ingredients
    const missingIngredients = generatedRecipe.ingredients.filter(i => !checkInventoryStatus(i));

    return (
      <div className="flex flex-col h-full bg-slate-50 pb-20 overflow-y-auto no-scrollbar">
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
            
            <div className="flex gap-4 text-sm text-slate-600 font-medium">
               <span className="flex items-center gap-1"><span className="text-primary">⏱</span> {generatedRecipe.prepTime} Prep</span>
               <span className="flex items-center gap-1"><span className="text-primary">🔥</span> {generatedRecipe.cookTime} Cook</span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Nutrition */}
          <NutritionChart data={generatedRecipe.nutrition} />

          {/* Grocery / Ingredients */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
             <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-dark">Ingredients</h3>
                <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">{generatedRecipe.servings} Servings</span>
             </div>
             
             <div className="space-y-3">
               {generatedRecipe.ingredients.map((ing, idx) => {
                 const hasIt = checkInventoryStatus(ing);
                 const inList = isInShoppingList(ing.name);
                 
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

                        {/* Show substitute prominently if missing */}
                        {!hasIt && ing.substitute && (
                             <span className="text-xs text-orange-500 bg-orange-50 px-2 py-1 rounded w-fit flex items-center gap-1">
                                <Info className="w-3 h-3" /> Substitute: {ing.substitute}
                             </span>
                        )}
                      </div>

                      {hasIt ? (
                        <span className="text-secondary text-xs font-bold bg-secondary/10 px-2 py-1 rounded">HAVE</span>
                      ) : (
                        <button 
                           onClick={() => !inList && openGroceryModal(ing)}
                           disabled={inList}
                           className={`text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 shadow-sm transition-colors ${inList ? 'bg-green-100 text-green-700' : 'text-white bg-dark hover:bg-black'}`}
                        >
                           {inList ? <Check className="w-3 h-3" /> : <ShoppingCart className="w-3 h-3" />}
                           {inList ? 'IN LIST' : 'ADD'}
                        </button>
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
    <div className="p-6 pt-12 max-w-md mx-auto w-full flex flex-col h-full">
      <h2 className="text-3xl font-bold mb-6 text-dark">Smart Pantry</h2>
      
      <div className="flex gap-2 mb-6">
        <input 
          type="text" 
          value={newInventoryItem}
          onChange={(e) => setNewInventoryItem(e.target.value)}
          placeholder="Add item (e.g., Basil)"
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

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex-1 overflow-y-auto">
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

  const renderShoppingList = () => (
    <div className="p-6 pt-12 max-w-md mx-auto w-full flex flex-col h-full">
      <h2 className="text-3xl font-bold mb-2 text-dark">Smart Buy List</h2>
      <p className="text-slate-400 mb-6">Generated from your recipe needs.</p>
      
      {shoppingList.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
           <ShoppingCart className="w-12 h-12 mb-4 opacity-50" />
           <p>Your list is empty.</p>
           <p className="text-sm mt-2">Generate a recipe and add missing ingredients!</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex-1 overflow-y-auto">
          {shoppingList.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 border-b border-slate-50 last:border-0">
               <div className="flex flex-col">
                  <span className="font-medium text-slate-800">{item.name}</span>
                  <span className="text-xs text-slate-500">{item.quantity} {item.estimatedCost && `• ${item.estimatedCost}`}</span>
               </div>
               <button 
                  onClick={() => setShoppingList(shoppingList.filter(i => i !== item))}
                  className="text-slate-300 hover:text-red-500"
               >
                 <Trash2 className="w-5 h-5" />
               </button>
            </div>
          ))}
          {/* Total Estimate Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
             <p className="text-sm font-bold text-dark">
                Items: {shoppingList.length}
             </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-[#F7F9F9] h-screen w-full font-sans text-slate-800 relative overflow-hidden">
      
      {/* Content Area */}
      <main className="h-full pb-20 overflow-y-auto no-scrollbar">
        {currentView === AppView.HOME && renderHome()}
        {currentView === AppView.ANALYSIS && renderAnalysis()}
        {currentView === AppView.INVENTORY && renderInventory()}
        {currentView === AppView.SHOPPING_LIST && renderShoppingList()}
        {currentView === AppView.PROFILE && <div className="p-10 text-center text-slate-400">Insights & Health Goals (Coming Soon)</div>}
      </main>

      {/* Full Screen Overlays */}
      {currentView === AppView.COOKING && generatedRecipe && (
        <CookingMode recipe={generatedRecipe} onClose={() => setCurrentView(AppView.ANALYSIS)} />
      )}

      {/* Grocery Add Confirmation Modal */}
      {itemToAddToGrocery && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl transform transition-all scale-100">
             <div className="flex justify-between items-start mb-4">
                <div>
                   <h3 className="text-xl font-bold text-dark">Add to Smart Buy</h3>
                   <p className="text-sm text-slate-400">Verify details before adding</p>
                </div>
                <button onClick={() => setItemToAddToGrocery(null)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X className="w-4 h-4"/></button>
             </div>
             
             <div className="bg-slate-50 p-4 rounded-xl mb-6">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Ingredient</p>
                <p className="text-lg font-bold text-dark mb-3">{itemToAddToGrocery.name}</p>
                
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Quantity Needed</label>
                <input 
                  type="text" 
                  value={groceryQuantity}
                  onChange={(e) => setGroceryQuantity(e.target.value)}
                  className="w-full bg-white border border-slate-200 p-3 rounded-lg font-medium text-slate-700 outline-none focus:border-primary"
                />
                
                {itemToAddToGrocery.estimatedCost && (
                   <p className="text-xs text-right mt-2 text-slate-500">Est. Cost: <span className="font-bold text-dark">{itemToAddToGrocery.estimatedCost}</span></p>
                )}
             </div>

             <div className="flex gap-3">
               <button 
                 onClick={() => setItemToAddToGrocery(null)}
                 className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition"
               >
                 Cancel
               </button>
               <button 
                 onClick={confirmAddToGrocery}
                 className="flex-1 py-3 bg-dark text-white font-bold rounded-xl shadow-lg hover:bg-black transition flex justify-center items-center gap-2"
               >
                 <ShoppingCart className="w-4 h-4" /> Add to List
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
         <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-dark font-bold text-lg">Thinking...</p>
            <p className="text-slate-400 text-sm">Analyzing ingredients & nutrition</p>
         </div>
      )}

      {/* Bottom Navigation */}
      {currentView !== AppView.COOKING && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-4 flex justify-between items-center z-40 pb-safe">
          <button 
             onClick={() => setCurrentView(AppView.HOME)}
             className={`flex flex-col items-center gap-1 ${currentView === AppView.HOME || currentView === AppView.ANALYSIS ? 'text-primary' : 'text-slate-400'}`}
          >
            <GripHorizontal className="w-6 h-6" />
            <span className="text-[10px] font-bold">Command</span>
          </button>
          
          <button 
             onClick={() => setCurrentView(AppView.INVENTORY)}
             className={`flex flex-col items-center gap-1 ${currentView === AppView.INVENTORY ? 'text-primary' : 'text-slate-400'}`}
          >
            <div className="relative">
              <ChefHat className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white"></span>
            </div>
            <span className="text-[10px] font-bold">Kitchen</span>
          </button>

          <button 
             onClick={() => setCurrentView(AppView.SHOPPING_LIST)} 
             className={`flex flex-col items-center gap-1 ${currentView === AppView.SHOPPING_LIST ? 'text-primary' : 'text-slate-400'}`}
          >
            <div className="relative">
              <ShoppingCart className="w-6 h-6" />
              {shoppingList.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border border-white text-[9px] text-white flex items-center justify-center font-bold">
                  {shoppingList.length}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold">Smart Buy</span>
          </button>

          <button 
             onClick={() => setCurrentView(AppView.PROFILE)}
             className={`flex flex-col items-center gap-1 ${currentView === AppView.PROFILE ? 'text-primary' : 'text-slate-400'}`}
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