const Database = require('better-sqlite3');
const db = new Database('pokemon_overlay.db', { verbose: console.log });

// Crear tablas si no existen
const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    apiKey TEXT PRIMARY KEY,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    orientation TEXT DEFAULT 'horizontal'
  );
`;

const createPokemonTable = `
  CREATE TABLE IF NOT EXISTS pokemon (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    apiKey TEXT,
    slot INTEGER,
    name TEXT,
    species TEXT,
    spriteUrl TEXT,
    isDead INTEGER DEFAULT 0,
    FOREIGN KEY(apiKey) REFERENCES users(apiKey) ON DELETE CASCADE,
    UNIQUE(apiKey, slot)
  );
`;

db.exec(createUsersTable);
db.exec(createPokemonTable);

module.exports = db;
