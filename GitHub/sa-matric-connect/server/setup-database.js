const { pool } = require('./database');

async function setupDatabase() {
    try {
        console.log('Ì∫Ä Setting up database tables...');
        
        // Create applications table
        await pool.query(\`
            CREATE TABLE IF NOT EXISTS applications (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                university_name VARCHAR(255) NOT NULL,
                course_name VARCHAR(255),
                application_date DATE DEFAULT CURRENT_DATE,
                status VARCHAR(50) DEFAULT 'pending',
                type VARCHAR(50) DEFAULT 'university',
                deadline DATE,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        \`);
        console.log('‚úÖ Created applications table');
        
        // Create user_activity table
        await pool.query(\`
            CREATE TABLE IF NOT EXISTS user_activity (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                action VARCHAR(255) NOT NULL,
                status VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        \`);
        console.log('‚úÖ Created user_activity table');
        
        // Create deadlines table
        await pool.query(\`
            CREATE TABLE IF NOT EXISTS deadlines (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                deadline DATE NOT NULL,
                type VARCHAR(50) NOT NULL,
                university_name VARCHAR(255),
                bursary_name VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        \`);
        console.log('‚úÖ Created deadlines table');
        
        // Insert sample deadlines
        const sampleDeadlines = [
            ['University Applications Close', 'Most universities close applications', '2024-02-01', 'university', 'All Universities', null],
            ['NSFAS Bursary Deadline', 'National Student Financial Aid Scheme', '2024-01-31', 'bursary', null, 'NSFAS'],
            ['Funza Lushaka Bursary', 'Teaching bursary applications close', '2024-02-15', 'bursary', null, 'Funza Lushaka'],
            ['University of Pretoria', 'Specific UP application deadline', '2024-01-30', 'university', 'University of Pretoria', null],
            ['Wits University', 'Wits application closing date', '2024-01-31', 'university', 'University of Witwatersrand', null]
        ];
        
        for (const deadline of sampleDeadlines) {
            await pool.query(
                \`INSERT INTO deadlines (title, description, deadline, type, university_name, bursary_name)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 ON CONFLICT DO NOTHING\`,
                deadline
            );
        }
        console.log('‚úÖ Inserted sample deadlines');
        
        console.log('Ìæâ Database setup complete!');
        
    } catch (error) {
        console.error('‚ùå Database setup error:', error);
    } finally {
        pool.end();
    }
}

setupDatabase();
