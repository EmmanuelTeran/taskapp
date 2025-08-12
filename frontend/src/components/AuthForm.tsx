import { useState } from 'react';
import { api } from '../lib/api';

type Props = { onAuth: (token: string) => void };

export default function AuthForm({ onAuth }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const path = mode === 'login' ? '/api/login' : '/api/register';
      const { token } = await api<{ token: string }>(path, {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      onAuth(token);
    } catch (err: any) {
      setError(err.message ?? 'Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="flex gap-2 mb-4">
        <button
          className={`px-3 py-1 rounded ${mode==='login'?'bg-black text-white':'bg-gray-200'}`}
          onClick={() => setMode('login')}
        >Iniciar sesión</button>
        <button
          className={`px-3 py-1 rounded ${mode==='register'?'bg-black text-white':'bg-gray-200'}`}
          onClick={() => setMode('register')}
        >Crear cuenta</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="w-full border rounded px-3 py-2"
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          className="w-full rounded bg-black text-white py-2 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Procesando…' : (mode==='login' ? 'Entrar' : 'Registrarme')}
        </button>
      </form>
    </div>
  );
}
