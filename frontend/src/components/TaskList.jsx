import { useState, useEffect } from 'react';

const API_URL = '/api';

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  const loadTasks = async () => {
    const res = await fetch(`${API_URL}/tasks`);
    const data = await res.json();
    setTasks(data);
    setLoading(false);
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    });

    setTitle('');
    loadTasks();
  };

  const deleteTask = async (id) => {
    await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' });
    loadTasks();
  };

  const startEditing = (task) => {
    setEditingId(task.id);
    setEditingTitle(task.title);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const saveEdit = async (id) => {
    if (!editingTitle.trim()) return;
    await fetch(`${API_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editingTitle })
    });
    setEditingId(null);
    setEditingTitle('');
    loadTasks();
  };

  const toggleCompleted = async (task) => {
    await fetch(`${API_URL}/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: task.completed ? 0 : 1 })
    });
    loadTasks();
  };

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <div className="card">
      <form className="task-form" onSubmit={addTask}>
        <input
          className="task-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="¿Qué necesitas hacer?"
        />
        <button className="task-button" type="submit">
          Agregar
        </button>
      </form>

      {loading ? (
        <p className="empty-state">Cargando tareas...</p>
      ) : tasks.length === 0 ? (
        <p className="empty-state">No tienes tareas todavía. ¡Agrega una! ✨</p>
      ) : (
        <ul className="task-list">
          {tasks.map((t) => (
            <li key={t.id} className={`task-item ${t.completed ? 'completed' : ''}`}>
              {editingId === t.id ? (
                <>
                  <input
                    className="task-edit-input"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    autoFocus
                  />
                  <button className="icon-button save" onClick={() => saveEdit(t.id)}>
                    ✓
                  </button>
                  <button className="icon-button cancel" onClick={cancelEditing}>
                    ✕
                  </button>
                </>
              ) : (
                <>
                  <span className="task-dot" onClick={() => toggleCompleted(t)} />
                  <span className="task-title" onClick={() => toggleCompleted(t)}>
                    {t.title}
                  </span>
                  {t.completed ? <span className="task-badge">Completada</span> : null}
                  <button className="icon-button" onClick={() => startEditing(t)}>
                    ✏️
                  </button>
                  <button className="icon-button delete" onClick={() => deleteTask(t.id)}>
                    🗑️
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}