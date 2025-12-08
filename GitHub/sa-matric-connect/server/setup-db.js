const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'sa_matric_connect',
  password: 'Lerato@7',
  port: 5432,
});

async function setup() {
  try {
    console.log('Ì¥ß Setting up database...');
    
    // Create users table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('‚úÖ Database setup complete!');
    
  } catch (error) {
    console.error('‚ùå Setup error:', error.message);
  } finally {
    await pool.end();
  }
}

setup();
