const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const db = require('./database');
const { createServer } = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // En producción, restringir a la URL del frontend
    methods: ["GET", "POST"]
  }
});

const PORT = 3000;

app.use(cors());
app.use(express.json());

// --- Rate Limiters ---
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Limita a 5 intentos por IP
  message: { success: false, message: 'Demasiados intentos de inicio de sesión, por favor intente de nuevo en 15 minutos' },
  standardHeaders: true,
  legacyHeaders: false,
});

const createKeyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // Limita a 3 keys por IP por hora
  message: { success: false, message: 'Has creado demasiadas keys recientemente. Intenta de nuevo más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public endpoint for creating keys
app.post('/api/keys', createKeyLimiter, (req, res) => {
  const apiKey = crypto.randomUUID();
  try {
    const stmt = db.prepare('INSERT INTO users (apiKey) VALUES (?)');
    stmt.run(apiKey);
    res.json({ success: true, apiKey });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- WebSockets ---
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  socket.on('join_room', (apiKey) => {
    socket.join(apiKey);
    console.log(`Cliente ${socket.id} se unió a la sala: ${apiKey}`);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// --- Admin Routes ---

app.post('/api/admin/login', loginLimiter, (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASS) {
    res.json({ success: true, token: 'admin-token-placeholder' });
  } else {
    res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
  }
});

app.post('/api/admin/keys', (req, res) => {
  // En producción, verificar token de admin aquí
  const apiKey = crypto.randomUUID();
  try {
    const stmt = db.prepare('INSERT INTO users (apiKey) VALUES (?)');
    stmt.run(apiKey);
    res.json({ success: true, apiKey });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/admin/keys', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT users.*, COUNT(pokemon.id) as pokemonCount 
      FROM users 
      LEFT JOIN pokemon ON users.apiKey = pokemon.apiKey 
      GROUP BY users.apiKey 
      ORDER BY users.createdAt DESC
    `);
    const users = stmt.all();
    res.json(users);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/admin/keys/:key', (req, res) => {
  const { key } = req.params;
  try {
    const stmt = db.prepare('DELETE FROM users WHERE apiKey = ?');
    const info = stmt.run(key);

    if (info.changes > 0) {
      return res.json({ success: true });
    } else {
      return res.status(404).json({ success: false, message: 'Key no encontrada' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// --- Settings Routes ---

app.get('/api/settings/:apiKey', (req, res) => {
  const { apiKey } = req.params;
  try {
    const user = db.prepare('SELECT orientation FROM users WHERE apiKey = ?').get(apiKey);
    if (!user) {
      return res.status(404).json({ success: false, message: 'API Key inválida' });
    }
    res.json({ orientation: user.orientation || 'horizontal' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/settings/:apiKey', (req, res) => {
  const { apiKey } = req.params;
  const { orientation } = req.body;

  if (!['horizontal', 'vertical'].includes(orientation)) {
    return res.status(400).json({ success: false, message: 'Orientación inválida' });
  }

  try {
    const stmt = db.prepare('UPDATE users SET orientation = ? WHERE apiKey = ?');
    const info = stmt.run(orientation, apiKey);

    if (info.changes === 0) {
      return res.status(404).json({ success: false, message: 'API Key inválida' });
    }

    io.to(apiKey).emit('settings_updated', { orientation });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- Pokemon Routes ---

app.get('/api/pokemon/:apiKey', (req, res) => {
  const { apiKey } = req.params;
  try {
    const user = db.prepare('SELECT apiKey FROM users WHERE apiKey = ?').get(apiKey);
    if (!user) {
      return res.status(404).json({ success: false, message: 'API Key inválida' });
    }

    const pokemon = db.prepare('SELECT * FROM pokemon WHERE apiKey = ? ORDER BY slot ASC').all(apiKey);
    res.json(pokemon);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/pokemon/:apiKey', (req, res) => {
  const { apiKey } = req.params;
  const { slot, name, species, spriteUrl, isDead } = req.body;

  if (!slot || slot < 1 || slot > 6) {
    return res.status(400).json({ success: false, message: 'Slot inválido (1-6)' });
  }

  try {
    const user = db.prepare('SELECT apiKey FROM users WHERE apiKey = ?').get(apiKey);
    if (!user) {
      return res.status(404).json({ success: false, message: 'API Key inválida' });
    }

    const stmt = db.prepare(`
      INSERT INTO pokemon (apiKey, slot, name, species, spriteUrl, isDead)
      VALUES (@apiKey, @slot, @name, @species, @spriteUrl, @isDead)
      ON CONFLICT(apiKey, slot) DO UPDATE SET
      name = @name,
      species = @species,
      spriteUrl = @spriteUrl,
      isDead = @isDead
    `);

    stmt.run({ apiKey, slot, name, species, spriteUrl, isDead: isDead ? 1 : 0 });

    // Emitir evento de actualización a la sala de la API Key
    io.to(apiKey).emit('pokemon_updated');

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/pokemon/:apiKey/reorder', (req, res) => {
  const { apiKey } = req.params;
  const { items } = req.body; // Expecting [{ id, slot }, ...]

  if (!Array.isArray(items)) {
    return res.status(400).json({ success: false, message: 'Formato inválido' });
  }

  try {
    const user = db.prepare('SELECT apiKey FROM users WHERE apiKey = ?').get(apiKey);
    if (!user) {
      return res.status(404).json({ success: false, message: 'API Key inválida' });
    }

    const updateSlot = db.prepare('UPDATE pokemon SET slot = @slot WHERE id = @id AND apiKey = @apiKey');
    const makeNegative = db.prepare('UPDATE pokemon SET slot = -slot WHERE id = @id AND apiKey = @apiKey');

    const reorderTransaction = db.transaction((items) => {
      // 1. Make slots negative for affected items to avoid UNIQUE constraint violation
      for (const item of items) {
        makeNegative.run({ id: item.id, apiKey });
      }

      // 2. Update to new positive slots
      for (const item of items) {
        updateSlot.run({ slot: item.slot, id: item.id, apiKey });
      }
    });

    reorderTransaction(items);

    io.to(apiKey).emit('pokemon_updated');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/pokemon/:apiKey/:slot', (req, res) => {
  const { apiKey, slot } = req.params;

  try {
    const user = db.prepare('SELECT apiKey FROM users WHERE apiKey = ?').get(apiKey);
    if (!user) {
      return res.status(404).json({ success: false, message: 'API Key inválida' });
    }

    const stmt = db.prepare('DELETE FROM pokemon WHERE apiKey = ? AND slot = ?');
    stmt.run(apiKey, slot);

    io.to(apiKey).emit('pokemon_updated');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
