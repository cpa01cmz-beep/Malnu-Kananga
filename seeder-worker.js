/**
 * Database Seeder Worker
 * This script seeds the D1 database with initial data for development and production
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Only allow POST requests to /seed
    if (request.method !== 'POST' || url.pathname !== '/seed') {
      return new Response('Use POST /seed to seed the database', { status: 400 });
    }

    try {
      // Create necessary tables
      await createTables(env.DB);
      
      // Seed initial data
      await seedInitialData(env.DB);
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Database seeded successfully',
        timestamp: new Date().toISOString()
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
      
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};

async function createTables(db) {
  // Users table
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // Chat messages table for RAG system
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      response TEXT NOT NULL,
      embedding BLOB,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `).run();

  // File metadata table for RAG
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      embedding BLOB,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `).run();

  // Sessions table for authentication
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `).run();
}

async function seedInitialData(db) {
  // Check if data already exists
  const userCount = await db.prepare('SELECT COUNT(*) as count FROM users').first();
  
  if (userCount.count > 0) {
    return; // Don't seed if data already exists
  }

  // Create a default admin user
  await db.prepare(`
    INSERT INTO users (email, name, role) VALUES 
    ('admin@malnukananga.sch.id', 'Default Admin', 'admin')
  `).run();

  // Create a default test user
  await db.prepare(`
    INSERT INTO users (email, name, role) VALUES 
    ('test@malnukananga.sch.id', 'Test User', 'user')
  `).run();

  // Add some sample chat messages for testing RAG
  await db.prepare(`
    INSERT INTO chat_messages (user_id, message, response) VALUES 
    (2, 'Apa itu Malnu Kananga?', 'Malnu Kananga adalah sistem edukasi berbasis AI yang membantu proses pembelajaran.'),
    (2, 'Bagaimana cara menggunakan fitur chat?', 'Anda bisa langsung ketik pertanyaan pada kolom chat dan sistem akan merespons dengan jawaban yang relevan.')
  `).run();

  console.log('Database seeded with initial data');
}