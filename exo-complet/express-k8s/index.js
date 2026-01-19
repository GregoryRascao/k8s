require('dotenv').config(); 
const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// Configuration de la connexion via variables d'environnement
const pool = new Pool({
  host: process.env.DB_HOST || 'pgsql-service',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// GET : Récupérer la liste des personnes
app.get('/persons', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM person ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST : Ajouter un nouveau nom
app.post('/person', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Le nom est requis' });

  try {
    const result = await pool.query(
      'INSERT INTO person (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API démarrée sur le port 3000`);
});