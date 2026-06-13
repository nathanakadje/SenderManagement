import express from 'express';
import pg from 'pg';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const pool = new pg.Pool({
  user: 'nathan',
  host: 'localhost',
  database: 'sender_db',
  password: 'Abdhr6??!34#ée&&',
  port: 5433,
});

// 1. Endpoint pour récupérer TOUS les Senders (Management View)
app.get('/api/senders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM senders ORDER BY date_created DESC, id DESC;');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//-- 2. Endpoint pour ajouter un nouveau Sender depuis votre formulaire
app.post('/api/senders', async (req, res) => {
  const { name, country, operator } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO senders (name, country, operator, status, date_created) VALUES ($1, $2, $3, $4, NOW()) RETURNING *;',
      [name, country, operator, 'Pending']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Endpoint global pour le Dashboard (Calcule kpiCards, pieData, countryData, etc.)
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    // Calcul des totaux par statut pour les KPIs et le diagramme circulaire
    const statsQuery = await pool.query(`
      SELECT 
        COUNT(*)::int as total,
        COUNT(CASE WHEN status = 'Validated' THEN 1 END)::int as validated,
        COUNT(CASE WHEN status = 'Pending' THEN 1 END)::int as pending,
        COUNT(CASE WHEN status = 'Rejected' THEN 1 END)::int as rejected
      FROM senders;
    `);
    const { total, validated, pending, rejected } = statsQuery.rows[0];

    // Top pays
    const countryQuery = await pool.query(`
      SELECT country, COUNT(*)::int as senders FROM senders GROUP BY country ORDER BY senders DESC;
    `);

    // Top opérateurs
    const operatorQuery = await pool.query(`
      SELECT operator, COUNT(*)::int as count FROM senders GROUP BY operator ORDER BY count DESC;
    `);

    // Activités récentes (les 7 derniers)
    const recentQuery = await pool.query(`
      SELECT name, country, operator, status, TO_CHAR(date_created, 'DD mon. YYYY') as date FROM senders ORDER BY date_created DESC, id DESC LIMIT 7;
    `);

    res.json({
      kpiCards: [
        { label: "Total Senders", value: total.toString(), delta: "+12%", up: true, accent: "#2563eb", bg: "#eff6ff", iconColor: "#2563eb" },
        { label: "Validés", value: validated.toString(), delta: "+8%", up: true, accent: "#059669", bg: "#ecfdf5", iconColor: "#059669" },
        { label: "En attente", value: pending.toString(), delta: "+3%", up: true, accent: "#d97706", bg: "#fffbeb", iconColor: "#d97706" },
        { label: "Rejetés", value: rejected.toString(), delta: "-2%", up: false, accent: "#e11d48", bg: "#fff1f2", iconColor: "#e11d48" }
      ],
      pieData: [
        { name: "Validés", value: validated, color: "#059669" },
        { name: "En attente", value: pending, color: "#d97706" },
        { name: "Rejetés", value: rejected, color: "#e11d48" }
      ],
      countryData: countryQuery.rows,
      operatorData: operatorQuery.rows,
      recentActivities: recentQuery.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Récupérer les pays configurés pour le formulaire
app.get('/api/countries', async (req, res) => {
  try {
    const result = await pool.query('SELECT code, name, flag, operators FROM countries;');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('🚀 API connectée à Postgres sur http://localhost:3000'));
