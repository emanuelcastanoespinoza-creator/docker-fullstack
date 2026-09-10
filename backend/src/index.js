require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'app_db',
  waitForConnections: true
});

// Health check: para verificar que la API y la conexión a la DB están vivas
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', db: error.message });
  }
});

// Estadísticas: total, completadas y pendientes
// Esta ruta va ANTES de /api/tasks/:id para que Express no confunda
// "stats" con un valor de :id
app.get('/api/tasks/stats', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) AS completadas,
        SUM(CASE WHEN completed = 0 OR completed IS NULL THEN 1 ELSE 0 END) AS pendientes
      FROM task
    `);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener todas las tareas
app.get('/api/tasks', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM task ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener una tarea por su ID
app.get('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM task WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear una tarea
app.post('/api/tasks', async (req, res) => {
  try {
    const { title } = req.body;
    const [result] = await pool.query('INSERT INTO task (title) VALUES (?)', [title]);
    res.status(201).json({ id: result.insertId, title });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Editar el título de una tarea
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;

    const fields = [];
    const values = [];

    if (title !== undefined) {
      fields.push('title = ?');
      values.push(title);
    }
    if (completed !== undefined) {
      fields.push('completed = ?');
      values.push(completed);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'Nada para actualizar' });
    }

    values.push(id);
    await pool.query(`UPDATE task SET ${fields.join(', ')} WHERE id = ?`, values);
    res.json({ id: Number(id), title, completed });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar una tarea
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM task WHERE id = ?', [id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API en http://localhost:${port}`);
});