const express = require('express');
const { Pool } = require('pg');
const { auth } = require('express-oauth2-jwt-bearer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 8080;

const jwtCheck = auth({
  audience: 'https://mekaniprijatelj-api',
  issuerBaseURL: 'https://dev-i25ptmtk6aiqoev1.us.auth0.com/',
  tokenSigningAlg: 'RS256'
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.get('/authorized', function (req, res) {
    res.send('Secured Resource');
});

const createTablesQuery = `
  CREATE TABLE IF NOT EXISTS users (
    auth0_id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255)
  );

  CREATE TABLE IF NOT EXISTS pets (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255),
      pet_id VARCHAR(255),
      pet_name VARCHAR(255)
  );
`;

pool.query(createTablesQuery);

app.get('/api/my-pets', checkJwt, async (req, res) => {
  const auth0Id = req.auth.payload.sub;
  try {
    const result = await pool.query('SELECT * FROM pets WHERE user_id = $1', [auth0Id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/add-pet', checkJwt, async (req, res) => {
  try {
    await pool.query(
      'INSERT INTO users (auth0_id) VALUES ($1) ON CONFLICT (auth0_id) DO NOTHING',
      [req.auth.payload.sub]
    );

    await pool.query(
      'INSERT INTO pets (user_id, pet_id, pet_name) VALUES ($1, $2, $3)',
      [req.auth.payload.sub, req.body.pet_id, req.body.pet_name]
    );
    res.sendStatus(201);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port);

console.log('Running on port ', port);