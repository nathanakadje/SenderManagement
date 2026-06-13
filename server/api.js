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
    const result = await pool.query('SELECT * FROM senders WHERE deleted_at IS NULL OR deleted = FALSE ORDER BY date_created DESC, id DESC;');
    res.json(result.rows); 
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//-- 2. Endpoint pour ajouter un nouveau Sender depuis votre formulaire
// app.post('/api/senders', async (req, res) => {
//   const { name, country, operator } = req.body;
//   try {
//     const result = await pool.query(
//       'INSERT INTO senders (name, country, operator, status, date_created) VALUES ($1, $2, $3, $4, NOW()) RETURNING *;',
//       [name, country, operator, 'Pending']
//     );
//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });
// Dans server/api.js, corrigez l'endpoint POST /api/senders

// app.post('/api/senders', async (req, res) => {
//   const { name, country, operator, status, comment } = req.body;
  
//   // Validation des données
//   if (!name || !country || !operator || !status) {
//     return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis' });
//   }
  
//   try {
//     // Récupérer le nom complet du pays à partir du code
//     const countryResult = await pool.query(
//       'SELECT name FROM countries WHERE code = $1 OR name = $1',
//       [country]
//     );
    
//     let countryName = country;
//     if (countryResult.rows.length > 0) {
//       countryName = countryResult.rows[0].name;
//     }
    
//     const result = await pool.query(
//       `INSERT INTO senders (name, country, operator, status, comment, date_created) 
//        VALUES ($1, $2, $3, $4, $5, NOW()) 
//        RETURNING *;`,
//       [name, countryName, operator, status, comment || null]
//     );
    
//     res.status(201).json({ 
//       success: true, 
//       message: 'Sender créé avec succès',
//       data: result.rows[0] 
//     });
//   } catch (err) {
//     console.error('Erreur lors de la création:', err);
//     res.status(500).json({ error: err.message });
//   }
// });
app.post('/api/senders', async (req, res) => {
  const { name, country, operator, status, comment } = req.body;
  
  // Validation des données obligatoires
  if (!name || !country || !operator || !status) {
    return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis' });
  }
  
  try {
    // Nettoyage de la chaîne du code pays pour éliminer les espaces et forcer les majuscules
    const cleanCountryParam = country.trim().toUpperCase();

    // Recherche blindée insensible à la casse sur le code ou le nom
    const countryResult = await pool.query(
      'SELECT name FROM countries WHERE UPPER(TRIM(code)) = $1 OR UPPER(TRIM(name)) = $1',
      [cleanCountryParam]
    );
    
    let countryName = country;
    if (countryResult.rows.length > 0) {
      countryName = countryResult.rows[0].name; // Récupère le nom complet (ex: Albania ou Côte d'Ivoire)
    } else {
      console.warn(`⚠️ Pays introuvable en base pour le paramètre: ${country}. Enregistrement de la valeur brute.`);
    }
    
    const result = await pool.query(
      `INSERT INTO senders (name, country, operator, status, comment, date_created) 
       VALUES ($1, $2, $3, $4, $5, NOW()) 
       RETURNING *;`,
      [name, countryName, operator, status, comment || null]
    );
    
    res.status(201).json({ 
      success: true, 
      message: 'Sender créé avec succès',
      data: result.rows[0] 
    });
  } catch (err) {
    console.error('Erreur lors de la création:', err);
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

// 6. Mettre à jour les opérateurs d'un pays
app.put('/api/countries/:code/operators', async (req, res) => {
  const { code } = req.params;
  const { operators } = req.body;
  try {
    const result = await pool.query(
      'UPDATE countries SET operators = $1 WHERE code = $2 RETURNING *;',
      [operators, code]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pays non trouvé' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 7. Ajouter un opérateur à un pays
app.post('/api/countries/:code/operators', async (req, res) => {
  const { code } = req.params;
  const { operator } = req.body;
  try {
    const result = await pool.query(
      'UPDATE countries SET operators = array_append(operators, $1) WHERE code = $2 AND NOT ($1 = ANY(operators)) RETURNING *;',
      [operator, code]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pays non trouvé ou opérateur déjà existant' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

  // 8. Mettre à jour un sender
app.put('/api/senders/:id', async (req, res) => {
  const { id } = req.params;
  const { senderName, country, operator, status, comment } = req.body;
  
  console.log(`Mise à jour du sender ${id}:`, { senderName, country, operator, status, comment });
  
  try {
    // Récupérer l'ancien sender pour l'historique
    const oldSender = await pool.query('SELECT * FROM senders WHERE id = $1', [id]);
    
    if (oldSender.rows.length === 0) {
      return res.status(404).json({ error: 'Sender non trouvé' });
    }
    
    // Récupérer le nom complet du pays
    let countryName = country;
    const countryResult = await pool.query(
      'SELECT name FROM countries WHERE code = $1 OR name = $1',
      [country]
    );
    
    if (countryResult.rows.length > 0) {
      countryName = countryResult.rows[0].name;
    }
    
    // Mettre à jour le sender
    const result = await pool.query(
      `UPDATE senders 
       SET name = $1, country = $2, operator = $3, status = $4, comment = $5
       WHERE id = $6 
       RETURNING *`,
      [senderName, countryName, operator, status, comment || null, id]
    );
    
    // Ajouter à l'historique si le statut a changé
    if (oldSender.rows[0].status !== status) {
      await pool.query(
        `INSERT INTO sender_history (sender_id, action, user_email, created_at) 
         VALUES ($1, $2, $3, NOW())`,
        [id, `Statut modifié : ${oldSender.rows[0].status} → ${status}`, 'admin@arolisender.io']
      );
    }
    
    // Ajouter une entrée pour la modification générale
    await pool.query(
      `INSERT INTO sender_history (sender_id, action, user_email, created_at) 
       VALUES ($1, $2, $3, NOW())`,
      [id, `Sender modifié : ${oldSender.rows[0].name} → ${senderName}`, 'admin@arolisender.io']
    );
    
    console.log('Sender mis à jour avec succès:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur lors de la mise à jour:', err);
    res.status(500).json({ error: err.message });
  }
});

// Récupérer l'historique d'un sender
app.get('/api/senders/:id/history', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT action, user_email as user, TO_CHAR(created_at, 'DD mon. YYYY – HH24:MI') as date 
       FROM sender_history 
       WHERE sender_id = $1 
       ORDER BY created_at DESC 
       LIMIT 20`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'historique:', err);
    res.status(500).json({ error: err.message });
  }
});

// Suppression douce d'un sender
app.delete('/api/senders/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Vérifier si le sender existe
    const sender = await pool.query('SELECT * FROM senders WHERE id = $1', [id]);
    
    if (sender.rows.length === 0) {
      return res.status(404).json({ error: 'Sender non trouvé' });
    }
    
    // Soft delete - ajouter une colonne deleted_at si elle n'existe pas
    // Sinon, on peut simplement ajouter une entrée dans l'historique
    await pool.query(
      `INSERT INTO sender_history (sender_id, action, user_email, created_at) 
       VALUES ($1, $2, $3, NOW())`,
      [id, `Sender supprimé : ${sender.rows[0].name}`, 'admin@arolisender.io']
    );
    
    // Option 1: Marquer comme supprimé (si vous avez une colonne deleted_at)
    // await pool.query(`UPDATE senders SET deleted_at = NOW() WHERE id = $1`, [id]);
    
    // Option 2: Supprimer réellement (si vous voulez une vraie suppression)
    await pool.query('DELETE FROM senders WHERE id = $1', [id]);
    
    console.log(`Sender ${id} supprimé avec succès`);
    res.json({ success: true, message: 'Sender supprimé avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression:', err);
    res.status(500).json({ error: err.message });
  }
});

// Créer la table d'historique si elle n'existe pas
const createHistoryTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sender_history (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER REFERENCES senders(id) ON DELETE CASCADE,
        action TEXT NOT NULL,
        user_email VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('Table sender_history vérifiée/créée');
  } catch (err) {
    console.error('Erreur lors de la création de sender_history:', err);
  }
};

// Appeler la création de la table au démarrage
createHistoryTable();

app.listen(3000, () => console.log('🚀 API connectée à Postgres sur http://localhost:3000'));

