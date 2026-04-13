import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else if (data.session === null) {
        setMessage('Registracija uspješna! Provjerite svoj email da potvrdite račun.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="bg-glow"></div>
      <div className="w-full max-w-md glass-panel rounded-2xl p-8 relative z-10">
        <div className="text-center mb-8 flex flex-col items-center">
          <img src="/logo.png" alt="Osmanović Garage" className="h-16 object-contain mb-2" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <span className="font-bold text-white text-xl tracking-tight mb-6">OSMANOVIĆ <span className="text-red-600">GARAGE</span></span>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            {isSignUp ? 'Napravite račun' : 'Dobrodošli nazad'}
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            {isSignUp ? 'Registrujte se za upravljanje narudžbama' : 'Prijavite se za upravljanje narudžbama'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-500/10 text-red-400 text-sm rounded-xl border border-red-500/20">
              {error}
            </div>
          )}
          {message && (
            <div className="p-3 bg-green-500/10 text-green-400 text-sm rounded-xl border border-green-500/20">
              {message}
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300 block">Email adresa</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all placeholder-gray-600"
              placeholder="admin@primjer.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300 block">Lozinka</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all placeholder-gray-600"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white font-medium py-2.5 rounded-xl hover:from-red-500 hover:to-red-700 transition-all disabled:opacity-70 flex justify-center items-center h-11 shadow-lg shadow-red-900/20"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              isSignUp ? 'Registruj se' : 'Prijavi se'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setMessage(null);
            }}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            {isSignUp ? 'Već imate račun? Prijavite se' : "Nemate račun? Registrujte se"}
          </button>
        </div>
      </div>
    </div>
  );
}
