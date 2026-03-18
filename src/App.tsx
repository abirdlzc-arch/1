import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Download, 
  RefreshCw, 
  Plus, 
  X, 
  Sparkles,
  ChevronRight,
  LayoutGrid,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateHomeScenes, GeneratedScene } from './services/geminiService';

export default function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('Make it look elegant and high-end.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [scenes, setScenes] = useState<GeneratedScene[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setMimeType(file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage) return;
    
    setIsGenerating(true);
    setError(null);
    try {
      const generatedScenes = await generateHomeScenes(selectedImage, mimeType, prompt);
      setScenes(generatedScenes);
    } catch (err) {
      console.error(err);
      setError('Failed to generate scenes. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = (url: string, id: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `home-scene-${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setSelectedImage(null);
    setScenes([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Sparkles size={22} />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-900">
              HomeScene <span className="text-indigo-600">AI</span>
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-500">
            <a href="#" className="hover:text-zinc-900 transition-colors">How it works</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">Pricing</a>
            <button className="bg-zinc-900 text-white px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors">
              Sign In
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        <div className="grid lg:grid-cols-[400px_1fr] gap-12 items-start">
          
          {/* Controls Sidebar */}
          <section className="space-y-8">
            <div className="space-y-4">
              <h2 className="font-display text-xl font-semibold flex items-center gap-2">
                <LayoutGrid size={20} className="text-indigo-600" />
                Configure Scene
              </h2>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Upload a product image and describe the mood you want to create. We'll generate 4 unique interior scenes.
              </p>
            </div>

            {/* Upload Area */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Product Image</label>
              {!selectedImage ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-zinc-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 group"
                >
                  <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                    <Upload size={24} />
                  </div>
                  <div className="text-center px-6">
                    <p className="font-medium text-zinc-900">Click to upload</p>
                    <p className="text-xs text-zinc-500 mt-1">PNG, JPG up to 10MB</p>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>
              ) : (
                <div className="relative aspect-square rounded-2xl overflow-hidden border border-zinc-200 bg-white group">
                  <img src={selectedImage} alt="Product" className="w-full h-full object-contain p-4" />
                  <button 
                    onClick={reset}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-sm hover:bg-black/70 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Prompt Input */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Style & Mood</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Minimalist, warm lighting, luxury apartment..."
                className="w-full h-32 px-4 py-3 rounded-xl border border-zinc-200 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none text-sm"
              />
            </div>

            <button 
              onClick={handleGenerate}
              disabled={!selectedImage || isGenerating}
              className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg transition-all ${
                !selectedImage || isGenerating 
                ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="animate-spin" size={20} />
                  Generating Scenes...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Generate 4 Scenes
                </>
              )}
            </button>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-start gap-3">
                <Info size={18} className="shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}
          </section>

          {/* Results Area */}
          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">Generated Scenes</h2>
              {scenes.length > 0 && (
                <button 
                  onClick={handleGenerate}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5"
                >
                  <RefreshCw size={14} />
                  Regenerate All
                </button>
              )}
            </div>

            {scenes.length === 0 && !isGenerating ? (
              <div className="aspect-video rounded-3xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-400 gap-4 bg-zinc-50/50">
                <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center">
                  <ImageIcon size={32} />
                </div>
                <p className="font-medium">Your generated scenes will appear here</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                  {isGenerating && scenes.length === 0 ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <motion.div 
                        key={`skeleton-${i}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="aspect-square rounded-3xl bg-zinc-200 animate-pulse"
                      />
                    ))
                  ) : (
                    scenes.map((scene, index) => (
                      <motion.div 
                        key={scene.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative aspect-square rounded-3xl overflow-hidden bg-white border border-zinc-200 shadow-sm hover:shadow-xl transition-all"
                      >
                        <img 
                          src={scene.url} 
                          alt={`Generated Scene ${index + 1}`} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                          <button 
                            onClick={() => downloadImage(scene.url, scene.id)}
                            className="w-full py-3 bg-white text-zinc-900 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-zinc-100 transition-colors"
                          >
                            <Download size={18} />
                            Download Scene
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-12 px-6 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2 opacity-50 grayscale">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white">
              <Sparkles size={16} />
            </div>
            <span className="font-display font-bold">HomeScene AI</span>
          </div>
          <p className="text-zinc-400 text-sm">
            &copy; 2026 HomeScene AI. Powered by Gemini.
          </p>
          <div className="flex items-center gap-6 text-sm text-zinc-400">
            <a href="#" className="hover:text-zinc-900">Privacy</a>
            <a href="#" className="hover:text-zinc-900">Terms</a>
            <a href="#" className="hover:text-zinc-900">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
