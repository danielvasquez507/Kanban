const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// Load .env natively (Zero Dependencies)
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  });
}
const MASTER_PWD = process.env.MASTER_PWD || '3.3.3.';


const SESSION_DURATION = 20 * 60 * 1000; // 20 minutes

const parseCookies = (req) => {
  const list = {};
  const rc = req.headers.cookie;
  if (rc) {
    rc.split(';').forEach((cookie) => {
      const parts = cookie.split('=');
      list[parts.shift().trim()] = decodeURI(parts.join('='));
    });
  }
  return list;
};

const requireAuth = (req, res, next) => {
  const cookies = parseCookies(req);
  const token = cookies.auth_token;
  if (!token) return res.status(401).json({error: 'Unauthorized'});
  
  const session = db.prepare('SELECT created_at FROM sessions WHERE token = ?').get(token);
  if (!session) return res.status(401).json({error: 'Unauthorized'});
  
  if (Date.now() - session.created_at > SESSION_DURATION) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    return res.status(401).json({error: 'Session expired'});
  }
  db.prepare('UPDATE sessions SET created_at = ? WHERE token = ?').run(Date.now(), token);
  next();
};

// Security Middleware (Ligero)
app.use(helmet({ contentSecurityPolicy: false }));

// Simple In-Memory Rate Limiter (Protección DDoS básica sin consumir recursos)
const requestCounts = new Map();
setInterval(() => requestCounts.clear(), 60000); // Limpiar cada minuto
app.use((req, res, next) => {
  const ip = req.ip;
  const count = (requestCounts.get(ip) || 0) + 1;
  requestCounts.set(ip, count);
  if (count > 200) { // Max 200 requests per minute per IP
    return res.status(429).json({ error: 'Demasiadas peticiones. Por favor, espera.' });
  }
  next();
});

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite Database
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const db = new Database(path.join(dataDir, 'data.sqlite'));
db.pragma('foreign_keys = ON');

// Schema Definition
const initDb = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS environments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT '🌱',
      is_active INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS columns (
      id TEXT PRIMARY KEY,
      env_id TEXT NOT NULL REFERENCES environments(id) ON DELETE CASCADE,
      num INTEGER NOT NULL CHECK (num BETWEEN 1 AND 8),
      name TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT '📁',
      color TEXT NOT NULL,
      UNIQUE (env_id, color)
    );

    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      column_id TEXT NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      detail TEXT NOT NULL DEFAULT '',
      action TEXT NOT NULL DEFAULT '',
      time_h INTEGER NOT NULL DEFAULT 0 CHECK (time_h >= 0),
      cert TEXT NOT NULL DEFAULT '—',
      platform TEXT NOT NULL DEFAULT '',
      impact TEXT NOT NULL DEFAULT '' CHECK (impact IN ('','Bajo','Medio','Alto','Muy alto')),
      url TEXT NOT NULL DEFAULT '',
      state INTEGER NOT NULL DEFAULT 0 CHECK (state IN (0,1,2)),
      comments TEXT NOT NULL DEFAULT '[]',
      activity TEXT NOT NULL DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_items_column ON items(column_id);

    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      env_name TEXT,
      message TEXT NOT NULL,
      cls TEXT NOT NULL DEFAULT 'rs',
      detail TEXT NOT NULL DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS quotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      author TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      created_at INTEGER NOT NULL
    );
  `);

  // Auto-migrations: Agregar columnas si faltan en DBs antiguas (como la de producción)
  const addColumn = (table, col, def) => {
    try { db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`); } catch (e) {}
  };
  addColumn('environments', 'is_active', 'INTEGER DEFAULT 0');
  addColumn('items', 'action', "TEXT NOT NULL DEFAULT ''");
  addColumn('items', 'time_h', "INTEGER NOT NULL DEFAULT 0 CHECK (time_h >= 0)");
  addColumn('items', 'cert', "TEXT NOT NULL DEFAULT '—'");
  addColumn('items', 'platform', "TEXT NOT NULL DEFAULT ''");
  addColumn('items', 'impact', "TEXT NOT NULL DEFAULT '' CHECK (impact IN ('','Bajo','Medio','Alto','Muy alto'))");
  addColumn('items', 'url', "TEXT NOT NULL DEFAULT ''");
  addColumn('items', 'state', "INTEGER NOT NULL DEFAULT 0 CHECK (state IN (0,1,2))");
  addColumn('items', 'comments', "TEXT NOT NULL DEFAULT '[]'");
  addColumn('items', 'activity', "TEXT NOT NULL DEFAULT '[]'");
  addColumn('items', 'created_at', "DATETIME DEFAULT CURRENT_TIMESTAMP");
};

initDb();

// ---------------------------------------------------------
// API ENDPOINTS
// ---------------------------------------------------------

// Proteger todas las rutas /api excepto login
app.use('/api', (req, res, next) => {
  if (req.path === '/login' || req.path === '/logout') return next();
  requireAuth(req, res, next);
});

app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === MASTER_PWD) {
    const token = crypto.randomBytes(32).toString('hex');
    db.prepare('INSERT INTO sessions (token, created_at) VALUES (?, ?)').run(token, Date.now());
    res.cookie('auth_token', token, { httpOnly: true, maxAge: SESSION_DURATION, sameSite: 'strict' });
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Contraseña incorrecta' });
  }
});

app.post('/api/logout', (req, res) => {
  const token = parseCookies(req).auth_token;
  if (token) db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  res.clearCookie('auth_token');
  res.json({ success: true });
});

app.get('/api/check-session', (req, res) => {
  res.json({ success: true });
});

const generateId = () => crypto.randomUUID();

// GET /api/state -> {activeEnv, envs: [...columns, items]}
app.get('/api/state', (req, res) => {
  try {
    const environments = db.prepare('SELECT * FROM environments').all();
    const columns = db.prepare('SELECT * FROM columns ORDER BY num ASC').all();
    const items = db.prepare('SELECT * FROM items').all();

    const activeEnvObj = environments.find(e => e.is_active === 1);
    const activeEnvId = activeEnvObj ? activeEnvObj.id : null;

    const envs = environments.map(env => {
      const envCols = columns.filter(c => c.env_id === env.id);
      const envColIds = envCols.map(c => c.id);
      const envItems = items.filter(i => envColIds.includes(i.column_id)).map(i => {
        let parsedComments = [], parsedActivity = [];
        try { parsedComments = JSON.parse(i.comments || '[]'); } catch(e){}
        try { parsedActivity = JSON.parse(i.activity || '[]'); } catch(e){}
        return { ...i, col: i.column_id, time: i.time_h, comments: parsedComments, activity: parsedActivity };
      });
      return { ...env, desc: 'PLAN DE ESTUDIO', logs: [], columns: envCols, items: envItems };
    });

    res.json({ activeEnv: activeEnvId, envs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/state/active-env -> {envId}
app.put('/api/state/active-env', (req, res) => {
  const { envId } = req.body;
  if (!envId) return res.status(400).json({ error: 'envId is required' });

  try {
    db.prepare('UPDATE environments SET is_active = 0').run();
    const info = db.prepare('UPDATE environments SET is_active = 1 WHERE id = ?').run(envId);
    if (info.changes === 0) return res.status(404).json({ error: 'Environment not found' });
    res.json({ success: true, activeEnv: envId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/envs
app.post('/api/envs', (req, res) => {
  const { name, icon = '🌱' } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  
  const id = generateId();
  try {
    // If it's the first environment, make it active
    const count = db.prepare('SELECT COUNT(*) as count FROM environments').get().count;
    const isActive = count === 0 ? 1 : 0;

    db.prepare('INSERT INTO environments (id, name, icon, is_active) VALUES (?, ?, ?, ?)')
      .run(id, name, icon, isActive);
    
    res.status(201).json({ id, name, icon, is_active: isActive });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/envs/:id
app.patch('/api/envs/:id', (req, res) => {
  const { id } = req.params;
  const { name, icon } = req.body;
  try {
    const env = db.prepare('SELECT * FROM environments WHERE id = ?').get(id);
    if (!env) return res.status(404).json({ error: 'Not found' });
    
    db.prepare('UPDATE environments SET name = ?, icon = ? WHERE id = ?')
      .run(name || env.name, icon || env.icon, id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/envs/:id
app.delete('/api/envs/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM environments WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/envs/:id/columns
app.post('/api/envs/:id/columns', (req, res) => {
  const env_id = req.params.id;
  const { name, icon = '📁', color } = req.body;
  if (!name || !color) return res.status(400).json({ error: 'Name and color are required' });

  try {
    const cols = db.prepare('SELECT * FROM columns WHERE env_id = ? ORDER BY num ASC').all(env_id);
    if (cols.length >= 8) return res.status(400).json({ error: 'Máximo 8 columnas' });
    
    const isColorUsed = cols.some(c => c.color === color);
    if (isColorUsed) return res.status(409).json({ error: 'Color ya en uso en este entorno' });

    const num = cols.length + 1;
    const id = generateId();

    db.prepare('INSERT INTO columns (id, env_id, num, name, icon, color) VALUES (?, ?, ?, ?, ?, ?)')
      .run(id, env_id, num, name, icon, color);
    
    res.status(201).json({ id, env_id, num, name, icon, color });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/columns/:id
app.patch('/api/columns/:id', (req, res) => {
  const { id } = req.params;
  const { name, icon, color } = req.body;
  try {
    const col = db.prepare('SELECT * FROM columns WHERE id = ?').get(id);
    if (!col) return res.status(404).json({ error: 'Not found' });

    if (color && color !== col.color) {
      const isColorUsed = db.prepare('SELECT 1 FROM columns WHERE env_id = ? AND color = ? AND id != ?').get(col.env_id, color, id);
      if (isColorUsed) return res.status(409).json({ error: 'Color ya en uso en este entorno' });
    }

    db.prepare('UPDATE columns SET name = ?, icon = ?, color = ? WHERE id = ?')
      .run(name || col.name, icon || col.icon, color || col.color, id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/columns/:id
app.delete('/api/columns/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM columns WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/columns/:id/items
app.post('/api/columns/:id/items', (req, res) => {
  const column_id = req.params.id;
  const { title, detail = '', action = '', time = 0, cert = '—', platform = '', impact = '', url = '', state = 0 } = req.body;
  const time_h = time;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const id = generateId();
  try {
    db.prepare(`INSERT INTO items (id, column_id, title, detail, action, time_h, cert, platform, impact, url, state, comments, activity) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(id, column_id, title, detail, action, time_h, cert, platform, impact, url, state, '[]', '[]');
    res.status(201).json({ id, column_id, title, detail, action, time_h, cert, platform, impact, url, state, comments: [], activity: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/items/:id
app.patch('/api/items/:id', (req, res) => {
  const { id } = req.params;
  const { title, detail, action, time, cert, platform, impact, url, col } = req.body;
  const time_h = time;
  const column_id = col || req.body.column_id;
  
  try {
    const item = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    if (!item) return res.status(404).json({ error: 'Not found' });

    db.prepare(`UPDATE items SET 
                title = COALESCE(?, title), 
                detail = COALESCE(?, detail), 
                action = COALESCE(?, action), 
                time_h = COALESCE(?, time_h), 
                cert = COALESCE(?, cert), 
                platform = COALESCE(?, platform),
                impact = COALESCE(?, impact), 
                url = COALESCE(?, url),
                column_id = COALESCE(?, column_id)
                WHERE id = ?`)
      .run(title, detail, action, time_h, cert, platform, impact, url, column_id, id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/items/:id/extras (comments & activity)
app.patch('/api/items/:id/extras', (req, res) => {
  const { id } = req.params;
  const { comments, activity } = req.body;
  try {
    const item = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    
    db.prepare('UPDATE items SET comments = COALESCE(?, comments), activity = COALESCE(?, activity) WHERE id = ?')
      .run(comments, activity, id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/items/:id/state
app.patch('/api/items/:id/state', (req, res) => {
  const { id } = req.params;
  const { state } = req.body;
  if (state === undefined || ![0, 1, 2].includes(Number(state))) return res.status(400).json({ error: 'Invalid state' });

  try {
    db.prepare('UPDATE items SET state = ? WHERE id = ?').run(state, id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/items/:id
app.delete('/api/items/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM items WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/logs?limit=12
app.get('/api/logs', (req, res) => {
  const limit = Number(req.query.limit) || 12;
  try {
    const logs = db.prepare('SELECT * FROM activity_log ORDER BY created_at DESC LIMIT ?').all(limit);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/logs
app.post('/api/logs', (req, res) => {
  const { env_name, message, cls = 'rs', detail = '' } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  try {
    db.prepare('INSERT INTO activity_log (env_name, message, cls, detail) VALUES (?, ?, ?, ?)')
      .run(env_name, message, cls, detail);
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/quotes/random?n=2
app.get('/api/quotes/random', (req, res) => {
  const n = Number(req.query.n) || 2;
  try {
    const quotes = db.prepare('SELECT * FROM quotes ORDER BY RANDOM() LIMIT ?').all(n);
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------
// STATIC FILES & SPA
// ---------------------------------------------------------
// Servir la carpeta actual como publica (donde se supone debe estar el index.html de Kamba)
app.use(express.static(path.join(__dirname)));

// Fallback a index.html (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
