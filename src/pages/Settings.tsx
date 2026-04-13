import { useState, useEffect } from 'react';

export default function Settings() {
  const [appName, setAppName] = useState('COD Admin');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem('appName');
    if (storedName) {
      setAppName(storedName);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('appName', appName);
    
    // Dispatch custom event to update Layout
    const event = new CustomEvent('appNameChanged', { detail: appName });
    window.dispatchEvent(event);
    
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-2xl relative z-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Postavke</h1>
        <p className="text-sm text-gray-400 mt-1">Upravljajte postavkama aplikacije.</p>
      </div>

      <div className="glass-panel rounded-2xl p-6">
        <h2 className="text-lg font-medium text-white mb-4">Općenito</h2>
        
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300 block">Ime aplikacije</label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="w-full max-w-md px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all placeholder-gray-600"
              placeholder="npr. COD Admin"
            />
            <p className="text-xs text-gray-500">Ovo ime će se prikazati na kartici pretraživača.</p>
          </div>

          <div className="pt-2 flex items-center gap-4">
            <button
              type="submit"
              className="bg-gradient-to-r from-red-600 to-red-800 text-white font-medium px-6 py-2.5 rounded-xl hover:from-red-500 hover:to-red-700 transition-all shadow-lg shadow-red-900/20"
            >
              Sačuvaj promjene
            </button>
            
            {saved && (
              <span className="text-sm text-green-400 flex items-center gap-1.5 animate-in fade-in duration-200">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Uspješno sačuvano
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
