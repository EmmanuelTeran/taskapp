import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Task } from '../types';

type Props = { token: string };

export default function Tasks({ token }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      const data = await api<Task[]>('/api/tasks', {}, token);
      setTasks(data);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* carga al montar */ }, []);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const t = await api<Task>('/api/tasks', { method: 'POST', body: JSON.stringify({ title }) }, token);
    setTasks([t, ...tasks]);
    setTitle('');
  }

  async function toggle(t: Task) {
    await api('/api/tasks/' + t.id, {
      method: 'PUT',
      body: JSON.stringify({ completed: !t.completed }),
    }, token);
    setTasks(tasks.map(x => x.id === t.id ? { ...x, completed: !x.completed } : x));
  }

  async function remove(id: number) {
    await api('/api/tasks/' + id, { method: 'DELETE' }, token);
    setTasks(tasks.filter(x => x.id !== id));
  }

  return (
    <div className="space-y-4">
      <form onSubmit={addTask} className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="Nueva tarea…"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <button className="px-4 py-2 rounded bg-black text-white">Agregar</button>
      </form>

      {loading && <p>Cargando…</p>}
      {err && <p className="text-red-600 text-sm">{err}</p>}

      <ul className="space-y-2">
        {tasks.map(t => (
          <li key={t.id} className="flex items-center justify-between bg-white rounded-xl shadow px-3 py-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={t.completed} onChange={() => toggle(t)} />
              <span className={t.completed ? 'line-through text-gray-500' : ''}>{t.title}</span>
            </label>
            <button className="text-sm text-red-600" onClick={() => remove(t.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
