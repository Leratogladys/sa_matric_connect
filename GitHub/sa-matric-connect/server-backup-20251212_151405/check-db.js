const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'sa_matric_connect',
  password: 'Lerato@7',
  port: 5432,
});

async function checkTable() {
  try {
    console.log('Ì¥ç Checking users table structure...');
    
    // Get table structure
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    console.log('\nÌ≥ä Users table columns:');
    result.rows.forEach(col => {
      console.log(`   ‚Ä¢ ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
    });
    
    // Get sample data
    const sample = await pool.query('SELECT * FROM users LIMIT 1');
    console.log('\nÌ≥ã Sample user data:');
    if (sample.rows.length > 0) {
      console.log(JSON.stringify(sample.rows[0], null, 2));
    } else {
      console.log('No users found in table');
    }
    
  } catch (error) {
    console.error('‚ùå Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTable();
