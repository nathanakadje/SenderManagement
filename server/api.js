import express from 'express';
import pg from 'pg';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Server } from 'socket.io';
import http from 'http';

// Clé secrète pour JWT (à mettre dans une variable d'environnement en production)
const JWT_SECRET = 'votre_secret_jwt_tres_secure_2024';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

const pool = new pg.Pool({
  user: 'nathan',
  host: 'localhost',
  database: 'sender_db',
  password: 'Abdhr6??!34#ée&&',
  port: 5433,
});

// ============ WEBSOCKET CONNEXION ============
io.on('connection', (socket) => {
  console.log('🔌 Client WebSocket connecté');
  
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`📱 Utilisateur ${userId} a rejoint son channel`);
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 Client WebSocket déconnecté');
  });
});

// ============ FONCTION DE NOTIFICATION ============
async function createNotification(userId, title, message, type = 'info', senderId = null) {
  try {
    // Si userId est null, envoyer à tous les admins
    if (!userId) {
      const admins = await pool.query('SELECT id FROM users WHERE role = $1', ['admin']);
      for (const admin of admins.rows) {
        const result = await pool.query(`
          INSERT INTO notifications (user_id, title, message, type, sender_id, created_at)
          VALUES ($1, $2, $3, $4, $5, NOW())
          RETURNING *
        `, [admin.id, title, message, type, senderId]);
        
        // Émettre en temps réel via WebSocket
        io.to(`user_${admin.id}`).emit('new_notification', result.rows[0]);
      }
    } else {
      const result = await pool.query(`
        INSERT INTO notifications (user_id, title, message, type, sender_id, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING *
      `, [userId, title, message, type, senderId]);
      
      // Émettre en temps réel via WebSocket
      io.to(`user_${userId}`).emit('new_notification', result.rows[0]);
    }
    console.log(`🔔 Notification: ${title}`);
  } catch (err) {
    console.error('Erreur création notification:', err);
  }
}

// ============ FONCTIONS AUTOMATIQUES ============

// 1. Vérifier les senders en attente depuis plus de 3 jours
async function checkPendingSenders() {
  console.log('🔍 Vérification des senders en attente...');
  try {
    const result = await pool.query(`
      SELECT id, name, date_created 
      FROM senders 
      WHERE status = 'Pending' 
      AND date_created < NOW() - INTERVAL '3 days'
      AND deleted_at IS NULL
    `);
    
    if (result.rows.length > 0) {
      const senderList = result.rows.map(s => s.name).join(', ');
      await createNotification(
        null, // Tous les admins
        '⏰ Senders en attente depuis plus de 3 jours',
        `${result.rows.length} sender(s) nécessitent votre attention : ${senderList}`,
        'warning',
        null
      );
      console.log(`📧 Notification envoyée pour ${result.rows.length} senders en attente`);
    }
  } catch (err) {
    console.error('Erreur vérification senders en attente:', err);
  }
}

// 2. Vérifier le seuil de rejets (>10 rejets en 24h)
async function checkRejectionThreshold() {
  console.log('🔍 Vérification du seuil de rejets...');
  try {
    const result = await pool.query(`
      SELECT COUNT(*) as rejected_count, 
             array_agg(name) as rejected_names
      FROM senders 
      WHERE status = 'Rejected' 
      AND date_created > NOW() - INTERVAL '24 hours'
      AND deleted_at IS NULL
    `);
    
    const rejectedCount = parseInt(result.rows[0].rejected_count);
    
    if (rejectedCount > 10) {
      await createNotification(
        null, // Tous les admins
        '⚠️ ALERTE : Seuil de rejets dépassé',
        `${rejectedCount} senders ont été rejetés ces dernières 24 heures. Veuillez vérifier les motifs. Rejets: ${result.rows[0].rejected_names.slice(0, 5).join(', ')}${rejectedCount > 5 ? '...' : ''}`,
        'error',
        null
      );
      console.log(`📧 Alerte: ${rejectedCount} rejets en 24h`);
    }
  } catch (err) {
    console.error('Erreur vérification seuil rejets:', err);
  }
}

// Exécuter les tâches périodiques
setInterval(checkPendingSenders, 6 * 60 * 60 * 1000); // Toutes les 6 heures
setInterval(checkRejectionThreshold, 60 * 60 * 1000); // Toutes les heures

// Exécuter une fois au démarrage
setTimeout(() => {
  checkPendingSenders();
  checkRejectionThreshold();
}, 5000);

// 1. Endpoint pour récupérer TOUS les Senders (Management View)
app.get('/api/senders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM senders WHERE deleted_at IS NULL OR deleted = FALSE ORDER BY date_created DESC, id DESC;');
    res.json(result.rows); 
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Endpoint pour ajouter un nouveau Sender avec notification
app.post('/api/senders', async (req, res) => {
  const { name, country, operator, status, comment } = req.body;
  
  if (!name || !country || !operator || !status) {
    return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis' });
  }
  
  try {
    const cleanCountryParam = country.trim().toUpperCase();
    const countryResult = await pool.query(
      'SELECT name FROM countries WHERE UPPER(TRIM(code)) = $1 OR UPPER(TRIM(name)) = $1',
      [cleanCountryParam]
    );
    
    let countryName = country;
    if (countryResult.rows.length > 0) {
      countryName = countryResult.rows[0].name;
    } else {
      console.warn(`⚠️ Pays introuvable en base pour le paramètre: ${country}. Enregistrement de la valeur brute.`);
    }
    
    const result = await pool.query(
      `INSERT INTO senders (name, country, operator, status, comment, date_created) 
       VALUES ($1, $2, $3, $4, $5, NOW()) 
       RETURNING *;`,
      [name, countryName, operator, status, comment || null]
    );
    
    // 🔔 NOTIFICATION: Nouveau sender créé
    await createNotification(
      null, // Tous les admins
      '📝 Nouveau sender créé',
      `Le sender "${name}" (${countryName} - ${operator}) a été créé avec le statut "${status}"`,
      status === 'Validated' ? 'success' : 'info',
      result.rows[0].id
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

// 3. Endpoint global pour le Dashboard
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const statsQuery = await pool.query(`
      SELECT 
        COUNT(*)::int as total,
        COUNT(CASE WHEN status = 'Validated' THEN 1 END)::int as validated,
        COUNT(CASE WHEN status = 'Pending' THEN 1 END)::int as pending,
        COUNT(CASE WHEN status = 'Rejected' THEN 1 END)::int as rejected
      FROM senders WHERE deleted_at IS NULL;
    `);
    const { total, validated, pending, rejected } = statsQuery.rows[0];

    const countryQuery = await pool.query(`
      SELECT country, COUNT(*)::int as senders FROM senders WHERE deleted_at IS NULL GROUP BY country ORDER BY senders DESC;
    `);

    const operatorQuery = await pool.query(`
      SELECT operator, COUNT(*)::int as count FROM senders WHERE deleted_at IS NULL GROUP BY operator ORDER BY count DESC;
    `);

    const recentQuery = await pool.query(`
      SELECT name, country, operator, status, TO_CHAR(date_created, 'DD mon. YYYY') as date 
      FROM senders WHERE deleted_at IS NULL
      ORDER BY date_created DESC, id DESC LIMIT 7;
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

// 4. Récupérer les pays configurés
app.get('/api/countries', async (req, res) => {
  try {
    const result = await pool.query('SELECT code, name, flag, operators FROM countries;');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Mettre à jour les opérateurs d'un pays
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

// 6. Ajouter un opérateur à un pays
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

// 7. Mettre à jour un sender avec notification
app.put('/api/senders/:id', async (req, res) => {
  const { id } = req.params;
  const { senderName, country, operator, status, comment } = req.body;
  
  console.log(`Mise à jour du sender ${id}:`, { senderName, country, operator, status, comment });
  
  try {
    const oldSender = await pool.query('SELECT * FROM senders WHERE id = $1', [id]);
    
    if (oldSender.rows.length === 0) {
      return res.status(404).json({ error: 'Sender non trouvé' });
    }
    
    const oldStatus = oldSender.rows[0].status;
    const oldName = oldSender.rows[0].name;
    
    let countryName = country;
    const countryResult = await pool.query(
      'SELECT name FROM countries WHERE code = $1 OR name = $1',
      [country]
    );
    
    if (countryResult.rows.length > 0) {
      countryName = countryResult.rows[0].name;
    }
    
    const result = await pool.query(
      `UPDATE senders 
       SET name = $1, country = $2, operator = $3, status = $4, comment = $5
       WHERE id = $6 
       RETURNING *`,
      [senderName, countryName, operator, status, comment || null, id]
    );
    
    // 🔔 NOTIFICATION: Changement de statut
    if (oldStatus !== status) {
      let notificationTitle = '';
      let notificationType = 'info';
      
      switch(status) {
        case 'Validated':
          notificationTitle = '✅ Sender validé';
          notificationType = 'success';
          break;
        case 'Rejected':
          notificationTitle = '❌ Sender rejeté';
          notificationType = 'error';
          break;
        case 'Pending':
          notificationTitle = '⏳ Sender en attente';
          notificationType = 'warning';
          break;
      }
      
      await createNotification(
        null, // Tous les admins
        notificationTitle,
        `Le sender "${senderName}" a changé de statut : ${oldStatus} → ${status}`,
        notificationType,
        parseInt(id)
      );
    }
    
    await pool.query(
      `INSERT INTO sender_history (sender_id, action, user_email, created_at) 
       VALUES ($1, $2, $3, NOW())`,
      [id, `Statut modifié : ${oldStatus} → ${status}`, 'admin@arolisender.io']
    );
    
    await pool.query(
      `INSERT INTO sender_history (sender_id, action, user_email, created_at) 
       VALUES ($1, $2, $3, NOW())`,
      [id, `Sender modifié : ${oldName} → ${senderName}`, 'admin@arolisender.io']
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

// Suppression d'un sender avec notification
app.delete('/api/senders/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const sender = await pool.query('SELECT name, status FROM senders WHERE id = $1', [id]);
    
    if (sender.rows.length === 0) {
      return res.status(404).json({ error: 'Sender non trouvé' });
    }
    
    const senderName = sender.rows[0].name;
    const senderStatus = sender.rows[0].status;
    
    await pool.query(
      `INSERT INTO sender_history (sender_id, action, user_email, created_at) 
       VALUES ($1, $2, $3, NOW())`,
      [id, `Sender supprimé : ${senderName} (${senderStatus})`, 'admin@arolisender.io']
    );
    
    // 🔔 NOTIFICATION: Suppression
    await createNotification(
      null, // Tous les admins
      '🗑️ Sender supprimé',
      `Le sender "${senderName}" (statut: ${senderStatus}) a été supprimé`,
      'warning',
      parseInt(id)
    );
    
    await pool.query('DELETE FROM senders WHERE id = $1', [id]);
    
    console.log(`Sender ${id} supprimé avec succès`);
    res.json({ success: true, message: 'Sender supprimé avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============ ENDPOINTS D'AUTHENTIFICATION ============

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  console.log('Tentative de connexion:', { email });
  
  try {
    const result = await pool.query(
      'SELECT id, email, password_hash, first_name, last_name, role FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      console.log('Utilisateur non trouvé:', email);
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
    }
    
    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      console.log('Mot de passe incorrect pour:', email);
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Mettre à jour la dernière connexion
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
    
    // 🔔 NOTIFICATION: Connexion admin
    if (user.role === 'admin') {
      await createNotification(
        user.id,
        '🔐 Connexion administrateur',
        `Vous vous êtes connecté à la plateforme`,
        'info',
        null
      );
    }
    
    console.log('Connexion réussie pour:', email);
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Erreur lors de la connexion:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur lors de la connexion' });
  }
});

app.get('/api/auth/verify', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ valid: false });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (err) {
    res.status(401).json({ valid: false });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.json({ success: true, message: 'Si cet email existe, un lien de réinitialisation a été envoyé' });
    }
    const resetToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
    await pool.query('UPDATE users SET reset_token = $1, reset_token_expires = NOW() + INTERVAL \'1 hour\' WHERE email = $2', [resetToken, email]);
    console.log(`Lien de réinitialisation pour ${email}: http://localhost:5173/reset-password?token=${resetToken}`);
    res.json({ success: true, message: 'Si cet email existe, un lien de réinitialisation a été envoyé' });
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const email = decoded.email;
    const result = await pool.query('SELECT id FROM users WHERE email = $1 AND reset_token = $2 AND reset_token_expires > NOW()', [email, token]);
    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Token invalide ou expiré' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE email = $2', [hashedPassword, email]);
    res.json({ success: true, message: 'Mot de passe réinitialisé avec succès' });
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ============ ENDPOINTS DE GESTION DES UTILISATEURS ============

app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, email, first_name, last_name, role, status, phone, address, department, created_at, last_login 
      FROM users ORDER BY created_at DESC
    `);
    const users = result.rows.map(user => ({
      id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name,
      role: user.role, status: user.status, phone: user.phone, address: user.address,
      department: user.department, createdAt: user.created_at, lastLogin: user.last_login
    }));
    res.json(users);
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT id, email, first_name, last_name, role, status, phone, address, department, created_at, last_login 
      FROM users WHERE id = $1
    `, [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    const user = result.rows[0];
    res.json({
      id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name,
      role: user.role, status: user.status, phone: user.phone, address: user.address,
      department: user.department, createdAt: user.created_at, lastLogin: user.last_login
    });
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  const { firstName, lastName, email, password, role, phone, department } = req.body;
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: 'Les champs requis sont manquants' });
  }
  try {
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, status, phone, department, created_at)
      VALUES ($1, $2, $3, $4, $5, 'active', $6, $7, NOW())
      RETURNING id, email, first_name, last_name, role, status, phone, department
    `, [email, hashedPassword, firstName, lastName, role || 'user', phone || null, department || null]);
    const newUser = result.rows[0];
    res.status(201).json({
      id: newUser.id, email: newUser.email, firstName: newUser.first_name, lastName: newUser.last_name,
      role: newUser.role, status: newUser.status, phone: newUser.phone, department: newUser.department
    });
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, phone, address, department, role, status } = req.body;
  try {
    const userExists = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    if (userExists.rows.length === 0) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    if (email) {
      const emailExists = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, id]);
      if (emailExists.rows.length > 0) return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }
    const result = await pool.query(`
      UPDATE users SET first_name = COALESCE($1, first_name), last_name = COALESCE($2, last_name),
      email = COALESCE($3, email), phone = COALESCE($4, phone), address = COALESCE($5, address),
      department = COALESCE($6, department), role = COALESCE($7, role), status = COALESCE($8, status), updated_at = NOW()
      WHERE id = $9 RETURNING id, email, first_name, last_name, role, status, phone, address, department
    `, [firstName, lastName, email, phone, address, department, role, status, id]);
    const updatedUser = result.rows[0];
    res.json({ id: updatedUser.id, email: updatedUser.email, firstName: updatedUser.first_name, lastName: updatedUser.last_name, role: updatedUser.role, status: updatedUser.status, phone: updatedUser.phone, address: updatedUser.address, department: updatedUser.department });
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('UPDATE users SET status = $1, deleted_at = NOW() WHERE id = $2 RETURNING id', ['inactive', id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json({ success: true, message: 'Utilisateur désactivé avec succès' });
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/users/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!['active', 'inactive', 'suspended'].includes(status)) return res.status(400).json({ error: 'Statut invalide' });
  try {
    const result = await pool.query('UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, status', [status, id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json({ success: true, status: result.rows[0].status });
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============ ENDPOINTS DE GESTION DES NOTIFICATIONS ============

const createNotificationsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        read BOOLEAN DEFAULT FALSE,
        sender_id INTEGER REFERENCES senders(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('Table notifications vérifiée/créée');
  } catch (err) {
    console.error('Erreur lors de la création de la table notifications:', err);
  }
};

app.get('/api/notifications/unread/count', async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND read = false',
      [userId]
    );
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) {
    console.error('Erreur lors du comptage des notifications:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/notifications', async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const result = await pool.query(`
      SELECT n.*, s.name as sender_name 
      FROM notifications n
      LEFT JOIN senders s ON n.sender_id = s.id
      WHERE n.user_id = $1 
      ORDER BY n.created_at DESC
      LIMIT 50
    `, [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur lors de la récupération des notifications:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/notifications/:id/read', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE notifications SET read = true WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Erreur lors du marquage de la notification:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/notifications/read-all', async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    await pool.query('UPDATE notifications SET read = true WHERE user_id = $1', [userId]);
    res.json({ success: true });
  } catch (err) {
    console.error('Erreur lors du marquage de toutes les notifications:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/notifications/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM notifications WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Erreur lors de la suppression de la notification:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/notifications', async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    await pool.query('DELETE FROM notifications WHERE user_id = $1', [userId]);
    res.json({ success: true });
  } catch (err) {
    console.error('Erreur lors de la suppression des notifications:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============ CRÉATION DES TABLES ============
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

// ============ DÉMARRAGE DU SERVEUR ============
createHistoryTable();
createNotificationsTable();

server.listen(3000, () => {
  console.log('🚀 API connectée à Postgres sur http://localhost:3000');
  console.log('🔌 WebSocket activé pour les notifications temps réel');
});
// import express from 'express';
// import pg from 'pg';
// import cors from 'cors';
// import jwt from 'jsonwebtoken';
// import bcrypt from 'bcryptjs';

// // Clé secrète pour JWT (à mettre dans une variable d'environnement en production)
// const JWT_SECRET = 'votre_secret_jwt_tres_secure_2024';

// const app = express();
// app.use(cors());
// app.use(express.json());

// const pool = new pg.Pool({
//   user: 'nathan',
//   host: 'localhost',
//   database: 'sender_db',
//   password: 'Abdhr6??!34#ée&&',
//   port: 5433,
// });

// // 1. Endpoint pour récupérer TOUS les Senders (Management View)
// app.get('/api/senders', async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM senders WHERE deleted_at IS NULL OR deleted = FALSE ORDER BY date_created DESC, id DESC;');
//     res.json(result.rows); 
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// //-- 2. Endpoint pour ajouter un nouveau Sender depuis votre formulaire
// // app.post('/api/senders', async (req, res) => {
// //   const { name, country, operator } = req.body;
// //   try {
// //     const result = await pool.query(
// //       'INSERT INTO senders (name, country, operator, status, date_created) VALUES ($1, $2, $3, $4, NOW()) RETURNING *;',
// //       [name, country, operator, 'Pending']
// //     );
// //     res.status(201).json(result.rows[0]);
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // });
// // Dans server/api.js, corrigez l'endpoint POST /api/senders

// // app.post('/api/senders', async (req, res) => {
// //   const { name, country, operator, status, comment } = req.body;
  
// //   // Validation des données
// //   if (!name || !country || !operator || !status) {
// //     return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis' });
// //   }
  
// //   try {
// //     // Récupérer le nom complet du pays à partir du code
// //     const countryResult = await pool.query(
// //       'SELECT name FROM countries WHERE code = $1 OR name = $1',
// //       [country]
// //     );
    
// //     let countryName = country;
// //     if (countryResult.rows.length > 0) {
// //       countryName = countryResult.rows[0].name;
// //     }
    
// //     const result = await pool.query(
// //       `INSERT INTO senders (name, country, operator, status, comment, date_created) 
// //        VALUES ($1, $2, $3, $4, $5, NOW()) 
// //        RETURNING *;`,
// //       [name, countryName, operator, status, comment || null]
// //     );
    
// //     res.status(201).json({ 
// //       success: true, 
// //       message: 'Sender créé avec succès',
// //       data: result.rows[0] 
// //     });
// //   } catch (err) {
// //     console.error('Erreur lors de la création:', err);
// //     res.status(500).json({ error: err.message });
// //   }
// // });
// app.post('/api/senders', async (req, res) => {
//   const { name, country, operator, status, comment } = req.body;
  
//   // Validation des données obligatoires
//   if (!name || !country || !operator || !status) {
//     return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis' });
//   }
  
//   try {
//     // Nettoyage de la chaîne du code pays pour éliminer les espaces et forcer les majuscules
//     const cleanCountryParam = country.trim().toUpperCase();

//     // Recherche blindée insensible à la casse sur le code ou le nom
//     const countryResult = await pool.query(
//       'SELECT name FROM countries WHERE UPPER(TRIM(code)) = $1 OR UPPER(TRIM(name)) = $1',
//       [cleanCountryParam]
//     );
    
//     let countryName = country;
//     if (countryResult.rows.length > 0) {
//       countryName = countryResult.rows[0].name; // Récupère le nom complet (ex: Albania ou Côte d'Ivoire)
//     } else {
//       console.warn(`⚠️ Pays introuvable en base pour le paramètre: ${country}. Enregistrement de la valeur brute.`);
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

// // 3. Endpoint global pour le Dashboard (Calcule kpiCards, pieData, countryData, etc.)
// app.get('/api/dashboard/stats', async (req, res) => {
//   try {
//     // Calcul des totaux par statut pour les KPIs et le diagramme circulaire
//     const statsQuery = await pool.query(`
//       SELECT 
//         COUNT(*)::int as total,
//         COUNT(CASE WHEN status = 'Validated' THEN 1 END)::int as validated,
//         COUNT(CASE WHEN status = 'Pending' THEN 1 END)::int as pending,
//         COUNT(CASE WHEN status = 'Rejected' THEN 1 END)::int as rejected
//       FROM senders;
//     `);
//     const { total, validated, pending, rejected } = statsQuery.rows[0];

//     // Top pays
//     const countryQuery = await pool.query(`
//       SELECT country, COUNT(*)::int as senders FROM senders GROUP BY country ORDER BY senders DESC;
//     `);

//     // Top opérateurs
//     const operatorQuery = await pool.query(`
//       SELECT operator, COUNT(*)::int as count FROM senders GROUP BY operator ORDER BY count DESC;
//     `);

//     // Activités récentes (les 7 derniers)
//     const recentQuery = await pool.query(`
//       SELECT name, country, operator, status, TO_CHAR(date_created, 'DD mon. YYYY') as date FROM senders ORDER BY date_created DESC, id DESC LIMIT 7;
//     `);

//     res.json({
//       kpiCards: [
//         { label: "Total Senders", value: total.toString(), delta: "+12%", up: true, accent: "#2563eb", bg: "#eff6ff", iconColor: "#2563eb" },
//         { label: "Validés", value: validated.toString(), delta: "+8%", up: true, accent: "#059669", bg: "#ecfdf5", iconColor: "#059669" },
//         { label: "En attente", value: pending.toString(), delta: "+3%", up: true, accent: "#d97706", bg: "#fffbeb", iconColor: "#d97706" },
//         { label: "Rejetés", value: rejected.toString(), delta: "-2%", up: false, accent: "#e11d48", bg: "#fff1f2", iconColor: "#e11d48" }
//       ],
//       pieData: [
//         { name: "Validés", value: validated, color: "#059669" },
//         { name: "En attente", value: pending, color: "#d97706" },
//         { name: "Rejetés", value: rejected, color: "#e11d48" }
//       ],
//       countryData: countryQuery.rows,
//       operatorData: operatorQuery.rows,
//       recentActivities: recentQuery.rows
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // 4. Récupérer les pays configurés pour le formulaire
// app.get('/api/countries', async (req, res) => {
//   try {
//     const result = await pool.query('SELECT code, name, flag, operators FROM countries;');
//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // 6. Mettre à jour les opérateurs d'un pays
// app.put('/api/countries/:code/operators', async (req, res) => {
//   const { code } = req.params;
//   const { operators } = req.body;
//   try {
//     const result = await pool.query(
//       'UPDATE countries SET operators = $1 WHERE code = $2 RETURNING *;',
//       [operators, code]
//     );
//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'Pays non trouvé' });
//     }
//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // 7. Ajouter un opérateur à un pays
// app.post('/api/countries/:code/operators', async (req, res) => {
//   const { code } = req.params;
//   const { operator } = req.body;
//   try {
//     const result = await pool.query(
//       'UPDATE countries SET operators = array_append(operators, $1) WHERE code = $2 AND NOT ($1 = ANY(operators)) RETURNING *;',
//       [operator, code]
//     );
//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'Pays non trouvé ou opérateur déjà existant' });
//     }
//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

//   // 8. Mettre à jour un sender
// app.put('/api/senders/:id', async (req, res) => {
//   const { id } = req.params;
//   const { senderName, country, operator, status, comment } = req.body;
  
//   console.log(`Mise à jour du sender ${id}:`, { senderName, country, operator, status, comment });
  
//   try {
//     // Récupérer l'ancien sender pour l'historique
//     const oldSender = await pool.query('SELECT * FROM senders WHERE id = $1', [id]);
    
//     if (oldSender.rows.length === 0) {
//       return res.status(404).json({ error: 'Sender non trouvé' });
//     }
    
//     // Récupérer le nom complet du pays
//     let countryName = country;
//     const countryResult = await pool.query(
//       'SELECT name FROM countries WHERE code = $1 OR name = $1',
//       [country]
//     );
    
//     if (countryResult.rows.length > 0) {
//       countryName = countryResult.rows[0].name;
//     }
    
//     // Mettre à jour le sender
//     const result = await pool.query(
//       `UPDATE senders 
//        SET name = $1, country = $2, operator = $3, status = $4, comment = $5
//        WHERE id = $6 
//        RETURNING *`,
//       [senderName, countryName, operator, status, comment || null, id]
//     );
    
//     // Ajouter à l'historique si le statut a changé
//     if (oldSender.rows[0].status !== status) {
//       await pool.query(
//         `INSERT INTO sender_history (sender_id, action, user_email, created_at) 
//          VALUES ($1, $2, $3, NOW())`,
//         [id, `Statut modifié : ${oldSender.rows[0].status} → ${status}`, 'admin@arolisender.io']
//       );
//     }
    
//     // Ajouter une entrée pour la modification générale
//     await pool.query(
//       `INSERT INTO sender_history (sender_id, action, user_email, created_at) 
//        VALUES ($1, $2, $3, NOW())`,
//       [id, `Sender modifié : ${oldSender.rows[0].name} → ${senderName}`, 'admin@arolisender.io']
//     );
    
//     console.log('Sender mis à jour avec succès:', result.rows[0]);
//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error('Erreur lors de la mise à jour:', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // Récupérer l'historique d'un sender
// app.get('/api/senders/:id/history', async (req, res) => {
//   const { id } = req.params;
//   try {
//     const result = await pool.query(
//       `SELECT action, user_email as user, TO_CHAR(created_at, 'DD mon. YYYY – HH24:MI') as date 
//        FROM sender_history 
//        WHERE sender_id = $1 
//        ORDER BY created_at DESC 
//        LIMIT 20`,
//       [id]
//     );
//     res.json(result.rows);
//   } catch (err) {
//     console.error('Erreur lors de la récupération de l\'historique:', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // Suppression douce d'un sender
// app.delete('/api/senders/:id', async (req, res) => {
//   const { id } = req.params;
//   try {
//     // Vérifier si le sender existe
//     const sender = await pool.query('SELECT * FROM senders WHERE id = $1', [id]);
    
//     if (sender.rows.length === 0) {
//       return res.status(404).json({ error: 'Sender non trouvé' });
//     }
    
//     // Soft delete - ajouter une colonne deleted_at si elle n'existe pas
//     // Sinon, on peut simplement ajouter une entrée dans l'historique
//     await pool.query(
//       `INSERT INTO sender_history (sender_id, action, user_email, created_at) 
//        VALUES ($1, $2, $3, NOW())`,
//       [id, `Sender supprimé : ${sender.rows[0].name}`, 'admin@arolisender.io']
//     );
    
//     // Option 1: Marquer comme supprimé (si vous avez une colonne deleted_at)
//     // await pool.query(`UPDATE senders SET deleted_at = NOW() WHERE id = $1`, [id]);
    
//     // Option 2: Supprimer réellement (si vous voulez une vraie suppression)
//     await pool.query('DELETE FROM senders WHERE id = $1', [id]);
    
//     console.log(`Sender ${id} supprimé avec succès`);
//     res.json({ success: true, message: 'Sender supprimé avec succès' });
//   } catch (err) {
//     console.error('Erreur lors de la suppression:', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // Créer la table d'historique si elle n'existe pas
// const createHistoryTable = async () => {
//   try {
//     await pool.query(`
//       CREATE TABLE IF NOT EXISTS sender_history (
//         id SERIAL PRIMARY KEY,
//         sender_id INTEGER REFERENCES senders(id) ON DELETE CASCADE,
//         action TEXT NOT NULL,
//         user_email VARCHAR(255),
//         created_at TIMESTAMP DEFAULT NOW()
//       )
//     `);
//     console.log('Table sender_history vérifiée/créée');
//   } catch (err) {
//     console.error('Erreur lors de la création de sender_history:', err);
//   }
// };

// // ============ ENDPOINTS D'AUTHENTIFICATION ============

// // Endpoint de connexion
// app.post('/api/auth/login', async (req, res) => {
//   const { email, password } = req.body;
  
//   console.log('Tentative de connexion:', { email });
  
//   try {
//     // Rechercher l'utilisateur par email
//     const result = await pool.query(
//       'SELECT id, email, password_hash, first_name, last_name, role FROM users WHERE email = $1',
//       [email]
//     );
    
//     if (result.rows.length === 0) {
//       console.log('Utilisateur non trouvé:', email);
//       return res.status(401).json({ 
//         success: false, 
//         message: 'Email ou mot de passe incorrect' 
//       });
//     }
    
//     const user = result.rows[0];
//     console.log('Utilisateur trouvé:', { id: user.id, email: user.email });
    
//     // Vérifier le mot de passe
//     const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
//     if (!isValidPassword) {
//       console.log('Mot de passe incorrect pour:', email);
//       return res.status(401).json({ 
//         success: false, 
//         message: 'Email ou mot de passe incorrect' 
//       });
//     }
    
//     // Générer le token JWT
//     const token = jwt.sign(
//       { id: user.id, email: user.email, role: user.role },
//       JWT_SECRET,
//       { expiresIn: '24h' }
//     );
    
//     console.log('Connexion réussie pour:', email);
    
//     res.json({
//       success: true,
//       token,
//       user: {
//         id: user.id,
//         email: user.email,
//         firstName: user.first_name,
//         lastName: user.last_name,
//         role: user.role
//       }
//     });
//   } catch (err) {
//     console.error('Erreur lors de la connexion:', err);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Erreur serveur lors de la connexion' 
//     });
//   }
// });

// // Vérifier le token (optionnel)
// app.get('/api/auth/verify', async (req, res) => {
//   const token = req.headers.authorization?.split(' ')[1];
  
//   if (!token) {
//     return res.status(401).json({ valid: false });
//   }
  
//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);
//     res.json({ valid: true, user: decoded });
//   } catch (err) {
//     res.status(401).json({ valid: false });
//   }
// });

// // Mot de passe oublié
// app.post('/api/auth/forgot-password', async (req, res) => {
//   const { email } = req.body;
  
//   try {
//     const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    
//     if (result.rows.length === 0) {
//       // Pour des raisons de sécurité, on ne révèle pas que l'email n'existe pas
//       return res.json({ 
//         success: true, 
//         message: 'Si cet email existe, un lien de réinitialisation a été envoyé' 
//       });
//     }
    
//     // Générer un token de réinitialisation
//     const resetToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
    
//     // Stocker le token en base
//     await pool.query(
//       'UPDATE users SET reset_token = $1, reset_token_expires = NOW() + INTERVAL \'1 hour\' WHERE email = $2',
//       [resetToken, email]
//     );
    
//     console.log(`Lien de réinitialisation pour ${email}: http://localhost:5173/reset-password?token=${resetToken}`);
    
//     res.json({ 
//       success: true, 
//       message: 'Si cet email existe, un lien de réinitialisation a été envoyé' 
//     });
//   } catch (err) {
//     console.error('Erreur:', err);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Erreur serveur' 
//     });
//   }
// });

// // Réinitialisation du mot de passe
// app.post('/api/auth/reset-password', async (req, res) => {
//   const { token, newPassword } = req.body;
  
//   try {
//     // Vérifier le token
//     const decoded = jwt.verify(token, JWT_SECRET);
//     const email = decoded.email;
    
//     // Vérifier si le token existe en base
//     const result = await pool.query(
//       'SELECT id FROM users WHERE email = $1 AND reset_token = $2 AND reset_token_expires > NOW()',
//       [email, token]
//     );
    
//     if (result.rows.length === 0) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Token invalide ou expiré' 
//       });
//     }
    
//     // Hasher le nouveau mot de passe
//     const hashedPassword = await bcrypt.hash(newPassword, 10);
    
//     // Mettre à jour le mot de passe
//     await pool.query(
//       'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE email = $2',
//       [hashedPassword, email]
//     );
    
//     res.json({ 
//       success: true, 
//       message: 'Mot de passe réinitialisé avec succès' 
//     });
//   } catch (err) {
//     console.error('Erreur:', err);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Erreur serveur' 
//     });
//   }
// });


// // ============ ENDPOINTS DE GESTION DES UTILISATEURS ============

// // Récupérer tous les utilisateurs
// app.get('/api/users', async (req, res) => {
//   try {
//     const result = await pool.query(`
//       SELECT id, email, first_name, last_name, role, status, phone, address, department, created_at, last_login 
//       FROM users 
//       ORDER BY created_at DESC
//     `);
    
//     // Transformer les données pour correspondre au format attendu par le frontend
//     const users = result.rows.map(user => ({
//       id: user.id,
//       email: user.email,
//       firstName: user.first_name,
//       lastName: user.last_name,
//       role: user.role,
//       status: user.status,
//       phone: user.phone,
//       address: user.address,
//       department: user.department,
//       createdAt: user.created_at,
//       lastLogin: user.last_login
//     }));
    
//     res.json(users);
//   } catch (err) {
//     console.error('Erreur lors de la récupération des utilisateurs:', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // Récupérer un utilisateur par ID
// app.get('/api/users/:id', async (req, res) => {
//   const { id } = req.params;
//   try {
//     const result = await pool.query(`
//       SELECT id, email, first_name, last_name, role, status, phone, address, department, created_at, last_login 
//       FROM users 
//       WHERE id = $1
//     `, [id]);
    
//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'Utilisateur non trouvé' });
//     }
    
//     const user = result.rows[0];
//     res.json({
//       id: user.id,
//       email: user.email,
//       firstName: user.first_name,
//       lastName: user.last_name,
//       role: user.role,
//       status: user.status,
//       phone: user.phone,
//       address: user.address,
//       department: user.department,
//       createdAt: user.created_at,
//       lastLogin: user.last_login
//     });
//   } catch (err) {
//     console.error('Erreur lors de la récupération de l\'utilisateur:', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // Créer un nouvel utilisateur
// app.post('/api/users', async (req, res) => {
//   const { firstName, lastName, email, password, role, phone, department } = req.body;
  
//   // Validation
//   if (!firstName || !lastName || !email || !password) {
//     return res.status(400).json({ error: 'Les champs requis sont manquants' });
//   }
  
//   try {
//     // Vérifier si l'email existe déjà
//     const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
//     if (existingUser.rows.length > 0) {
//       return res.status(400).json({ error: 'Cet email est déjà utilisé' });
//     }
    
//     // Hasher le mot de passe
//     const bcrypt = await import('bcryptjs');
//     const hashedPassword = await bcrypt.hash(password, 10);
    
//     const result = await pool.query(`
//       INSERT INTO users (email, password_hash, first_name, last_name, role, status, phone, department, created_at)
//       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
//       RETURNING id, email, first_name, last_name, role, status, phone, department
//     `, [email, hashedPassword, firstName, lastName, role || 'user', 'active', phone || null, department || null]);
    
//     const newUser = result.rows[0];
//     res.status(201).json({
//       id: newUser.id,
//       email: newUser.email,
//       firstName: newUser.first_name,
//       lastName: newUser.last_name,
//       role: newUser.role,
//       status: newUser.status,
//       phone: newUser.phone,
//       department: newUser.department
//     });
//   } catch (err) {
//     console.error('Erreur lors de la création de l\'utilisateur:', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // Mettre à jour un utilisateur
// app.put('/api/users/:id', async (req, res) => {
//   const { id } = req.params;
//   const { firstName, lastName, email, phone, address, department, role, status } = req.body;
  
//   try {
//     // Vérifier si l'utilisateur existe
//     const userExists = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
//     if (userExists.rows.length === 0) {
//       return res.status(404).json({ error: 'Utilisateur non trouvé' });
//     }
    
//     // Vérifier si l'email n'est pas déjà utilisé par un autre utilisateur
//     if (email) {
//       const emailExists = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, id]);
//       if (emailExists.rows.length > 0) {
//         return res.status(400).json({ error: 'Cet email est déjà utilisé' });
//       }
//     }
    
//     const result = await pool.query(`
//       UPDATE users 
//       SET 
//         first_name = COALESCE($1, first_name),
//         last_name = COALESCE($2, last_name),
//         email = COALESCE($3, email),
//         phone = COALESCE($4, phone),
//         address = COALESCE($5, address),
//         department = COALESCE($6, department),
//         role = COALESCE($7, role),
//         status = COALESCE($8, status),
//         updated_at = NOW()
//       WHERE id = $9
//       RETURNING id, email, first_name, last_name, role, status, phone, address, department
//     `, [firstName, lastName, email, phone, address, department, role, status, id]);
    
//     const updatedUser = result.rows[0];
//     res.json({
//       id: updatedUser.id,
//       email: updatedUser.email,
//       firstName: updatedUser.first_name,
//       lastName: updatedUser.last_name,
//       role: updatedUser.role,
//       status: updatedUser.status,
//       phone: updatedUser.phone,
//       address: updatedUser.address,
//       department: updatedUser.department
//     });
//   } catch (err) {
//     console.error('Erreur lors de la mise à jour de l\'utilisateur:', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // Supprimer un utilisateur (soft delete)
// app.delete('/api/users/:id', async (req, res) => {
//   const { id } = req.params;
  
//   try {
//     const result = await pool.query(`
//       UPDATE users 
//       SET status = 'inactive', deleted_at = NOW()
//       WHERE id = $1 
//       RETURNING id
//     `, [id]);
    
//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'Utilisateur non trouvé' });
//     }
    
//     res.json({ success: true, message: 'Utilisateur désactivé avec succès' });
//   } catch (err) {
//     console.error('Erreur lors de la suppression de l\'utilisateur:', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // Mettre à jour le statut d'un utilisateur (activer/désactiver)
// app.patch('/api/users/:id/status', async (req, res) => {
//   const { id } = req.params;
//   const { status } = req.body;
  
//   if (!['active', 'inactive', 'suspended'].includes(status)) {
//     return res.status(400).json({ error: 'Statut invalide' });
//   }
  
//   try {
//     const result = await pool.query(`
//       UPDATE users 
//       SET status = $1, updated_at = NOW()
//       WHERE id = $2
//       RETURNING id, status
//     `, [status, id]);
    
//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'Utilisateur non trouvé' });
//     }
    
//     res.json({ success: true, status: result.rows[0].status });
//   } catch (err) {
//     console.error('Erreur lors de la mise à jour du statut:', err);
//     res.status(500).json({ error: err.message });
//   }
// });


// // ============ ENDPOINTS DE GESTION DES NOTIFICATIONS ============
// // Créer la table des notifications si elle n'existe pas
// const createNotificationsTable = async () => {
//   try {
//     await pool.query(`
//       CREATE TABLE IF NOT EXISTS notifications (
//         id SERIAL PRIMARY KEY,
//         user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
//         title VARCHAR(255) NOT NULL,
//         message TEXT NOT NULL,
//         type VARCHAR(50) DEFAULT 'info',
//         read BOOLEAN DEFAULT FALSE,
//         sender_id INTEGER REFERENCES senders(id) ON DELETE CASCADE,
//         created_at TIMESTAMP DEFAULT NOW()
//       )
//     `);
//     console.log('Table notifications vérifiée/créée');
//   } catch (err) {
//     console.error('Erreur lors de la création de la table notifications:', err);
//   }
// };

// // Appeler la création de la table au démarrage
// createNotificationsTable();

// // Récupérer le nombre de notifications non lues pour un utilisateur
// app.get('/api/notifications/unread/count', async (req, res) => {
//   try {
//     // Pour l'instant, on utilise un ID utilisateur fixe (à remplacer par l'ID de l'utilisateur connecté)
//     // Dans une vraie application, vous récupéreriez l'ID depuis le token JWT
//     const userId = req.user?.id || 1; // Temporaire: utiliser l'ID de l'utilisateur connecté
    
//     const result = await pool.query(
//       'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND read = false',
//       [userId]
//     );
    
//     res.json({ count: parseInt(result.rows[0].count) });
//   } catch (err) {
//     console.error('Erreur lors du comptage des notifications:', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // Récupérer toutes les notifications d'un utilisateur
// app.get('/api/notifications', async (req, res) => {
//   try {
//     const userId = req.user?.id || 1; // Temporaire
    
//     const result = await pool.query(`
//       SELECT n.*, s.name as sender_name 
//       FROM notifications n
//       LEFT JOIN senders s ON n.sender_id = s.id
//       WHERE n.user_id = $1 
//       ORDER BY n.created_at DESC
//     `, [userId]);
    
//     res.json(result.rows);
//   } catch (err) {
//     console.error('Erreur lors de la récupération des notifications:', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // Marquer une notification comme lue
// app.put('/api/notifications/:id/read', async (req, res) => {
//   const { id } = req.params;
//   try {
//     await pool.query(
//       'UPDATE notifications SET read = true WHERE id = $1',
//       [id]
//     );
//     res.json({ success: true });
//   } catch (err) {
//     console.error('Erreur lors du marquage de la notification:', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // Marquer toutes les notifications comme lues
// app.put('/api/notifications/read-all', async (req, res) => {
//   try {
//     const userId = req.user?.id || 1;
//     await pool.query(
//       'UPDATE notifications SET read = true WHERE user_id = $1',
//       [userId]
//     );
//     res.json({ success: true });
//   } catch (err) {
//     console.error('Erreur lors du marquage de toutes les notifications:', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // Supprimer une notification
// app.delete('/api/notifications/:id', async (req, res) => {
//   const { id } = req.params;
//   try {
//     await pool.query('DELETE FROM notifications WHERE id = $1', [id]);
//     res.json({ success: true });
//   } catch (err) {
//     console.error('Erreur lors de la suppression de la notification:', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // Supprimer toutes les notifications d'un utilisateur
// app.delete('/api/notifications', async (req, res) => {
//   try {
//     const userId = req.user?.id || 1;
//     await pool.query('DELETE FROM notifications WHERE user_id = $1', [userId]);
//     res.json({ success: true });
//   } catch (err) {
//     console.error('Erreur lors de la suppression des notifications:', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // Créer une notification (utile pour les événements système)
// async function createNotification(userId, title, message, type = 'info', senderId = null) {
//   try {
//     const result = await pool.query(`
//       INSERT INTO notifications (user_id, title, message, type, sender_id, created_at)
//       VALUES ($1, $2, $3, $4, $5, NOW())
//       RETURNING *
//     `, [userId, title, message, type, senderId]);
//     return result.rows[0];
//   } catch (err) {
//     console.error('Erreur lors de la création de la notification:', err);
//     return null;
//   }
// }

// // Exemple: Créer une notification lors de la création d'un sender
// // À ajouter dans votre endpoint POST /api/senders
// // Après avoir créé le sender, décommentez ce code:
// /*
// // Créer une notification pour l'administrateur
// await createNotification(
//   1, // ID de l'administrateur
//   'Nouveau sender créé',
//   `Le sender "${name}" a été créé avec succès`,
//   'success',
//   result.rows[0].id
// );
// */

// // Exemple: Créer une notification lors du changement de statut
// // À ajouter dans votre endpoint PUT /api/senders/:id
// /*
// // Créer une notification pour l'utilisateur concerné
// await createNotification(
//   1, // ID de l'utilisateur
//   `Statut du sender modifié`,
//   `Le sender "${name}" est passé du statut "${oldStatus}" à "${newStatus}"`,
//   oldStatus !== newStatus ? 'warning' : 'info',
//   id
// );*/

// // Appeler la création de la table au démarrage
// createHistoryTable();

// app.listen(3000, () => console.log('🚀 API connectée à Postgres sur http://localhost:3000'));

