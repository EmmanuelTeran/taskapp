import { useEffect, useState } from 'react';
import AuthForm from './components/AuthForm';
import Tasks from './components/Tasks';
import { getToken, setToken, clearToken } from './auth';

export default function App() {
  const [token, setTok] = useState<string | null>(null);

  useEffect(() => setTok(getToken()), []);

  const onAuth = (t: string) => { setToken(t); setTok(t); };
  const logout = () => { clearToken(); setTok(null); };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto p-4">
        <header className="flex justify-between items-center py-4">
          <h1 className="text-2xl font-bold">TaskApp</h1>
          {token && <button className="text-sm underline" onClick={logout}>Salir</button>}
        </header>

        {!token ? <AuthForm onAuth={onAuth} /> : <Tasks token={token} />}
      </div>
    </div>
  );
}
