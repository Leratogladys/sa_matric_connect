const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'sa_matric_connect',
  password: 'Lerato@7',
  port: 5432,
});

 //Testing the connection 
 pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection error:', err);

  } else {
    console.log('✅ Database connected successfully at:, res.rows[0].now');
  }
 });

 module.exports = pool;