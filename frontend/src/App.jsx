import React, { useState, useEffect } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTodo, setNewTodo] = useState({ title: '', description: '' });

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/todos`);
      if (!response.ok) throw new Error('Failed to fetch todos');
      const data = await response.json();
      setTodos(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching todos:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTodo = async (e) => {
    e.preventDefault();
    
    if (!newTodo.title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTodo),
      });

      if (!response.ok) throw new Error('Failed to create todo');
      
      const data = await response.json();
      setTodos([data, ...todos]);
      setNewTodo({ title: '', description: '' });
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error creating todo:', err);
    }
  };

  const toggleTodo = async (id, completed) => {
    try {
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed }),
      });

      if (!response.ok) throw new Error('Failed to update todo');
      
      const data = await response.json();
      setTodos(todos.map(todo => todo.id === id ? data : todo));
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error updating todo:', err);
    }
  };

  const deleteTodo = async (id) => {
    try {
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete todo');
      
      setTodos(todos.filter(todo => todo.id !== id));
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error deleting todo:', err);
    }
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>🐳 Docker Todo App</h1>
          <p>Powered by Docker & Docker Compose</p>
        </header>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={createTodo} className="todo-form">
          <input
            type="text"
            placeholder="Enter todo title..."
            value={newTodo.title}
            onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
            className="input"
          />
          <input
            type="text"
            placeholder="Enter description (optional)..."
            value={newTodo.description}
            onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
            className="input"
          />
          <button type="submit" className="btn-primary">
            Add Todo
          </button>
        </form>

        {loading ? (
          <div className="loading">Loading todos...</div>
        ) : (
          <div className="todos">
            {todos.length === 0 ? (
              <div className="empty-state">No todos yet. Create one above!</div>
            ) : (
              todos.map(todo => (
                <div key={todo.id} className={`todo-card ${todo.completed ? 'completed' : ''}`}>
                  <div className="todo-content">
                    <h3 className="todo-title">{todo.title}</h3>
                    {todo.description && (
                      <p className="todo-description">{todo.description}</p>
                    )}
                    <small className="todo-date">
                      Created: {new Date(todo.created_at).toLocaleString()}
                    </small>
                  </div>
                  <div className="todo-actions">
                    <button
                      onClick={() => toggleTodo(todo.id, todo.completed)}
                      className={`btn ${todo.completed ? 'btn-undo' : 'btn-complete'}`}
                    >
                      {todo.completed ? '✓ Undo' : '✓ Complete'}
                    </button>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="btn btn-delete"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
