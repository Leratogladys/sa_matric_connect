const DatabaseChecker = {
    // API endpoints configuration
    endpoints: {
        health: '/api/health',
        database: '/api/health/database',
        table: (tableName) => `/api/health/table/${tableName}`,
        tableStructure: (tableName) => `/api/health/table/${tableName}/structure`
    },
@returns {Promise<boolean>} True if server is responsive
 async checkServer() {
        try {
            const response = await fetch(this.endpoints.health, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            return response.ok;
        } catch (error) {
            console.error('Server check failed:', error);
            return false;
        }
    },
 @returns {Promise<Object>} Connection status
 async checkDatabase() {
        try {
            const response = await fetch(this.endpoints.database);
            
            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }
            
            const data = await response.json();
            
            // Display results in console
            console.group('Ì≥ä Database Connection Check');
            console.log('Status:', data.connected ? '‚úÖ Connected' : '‚ùå Disconnected');
            
            if (data.connected) {
                console.log('Database:', data.database_name || 'N/A');
                console.log('Timestamp:', data.timestamp || new Date().toISOString());
                console.log('Tables:', data.table_count || 'N/A');
            } else {
                console.log('Error:', data.error || 'Unknown error');
            }
            console.groupEnd();
            
            return {
                success: true,
                connected: data.connected || false,
                data: data
            };
            
        } catch (error) {
            console.error('‚ùå Database check failed:', error.message);
            return {
                success: false,
                connected: false,
                error: error.message
            };
        }
    },

@param {string} tableName - Name of the table
@returns {Promise<Object>} Table existence status
 async checkTable(tableName) {
        try {
            const response = await fetch(this.endpoints.table(tableName));
            
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            
            const data = await response.json();
            
            console.group(`Ì≥ã Table Check: ${tableName}`);
            console.log('Exists:', data.exists ? '‚úÖ Yes' : '‚ùå No');
            
            if (data.exists && data.columns) {
                console.log('Columns:', data.columns.length);
                data.columns.forEach(col => {
                    console.log(`  ‚Ä¢ ${col.name} (${col.type})`);
                });
            }
            console.groupEnd();
            
            return {
                success: true,
                exists: data.exists || false,
                table: tableName,
                data: data
            };
            
        } catch (error) {
            console.error(`‚ùå Table check failed for "${tableName}":`, error);
            return {
                success: false,
                exists: false,
                table: tableName,
                error: error.message
            };
        }
    },
 @param {string[]} tables - Array of table names to check
async runComprehensiveCheck(tables = ['users', 'sessions']) {
        console.log('Ì¥ç Running Comprehensive Database Check');
        console.log('=' .repeat(50));
        
        // Check server
        const serverOk = await this.checkServer();
        if (!serverOk) {
            console.error('‚ùå Server is not responding');
            return false;
        }
        console.log('‚úÖ Server is running');
        
        // Check database
        const dbResult = await this.checkDatabase();
        if (!dbResult.connected) {
            console.error('‚ùå Database is not accessible');
            return false;
        }
        
        // Check tables
        console.log('\nÌ≥ã Checking tables:');
        for (const table of tables) {
            await this.checkTable(table);
        }
        
        console.log('=' .repeat(50));
        console.log('‚úÖ Comprehensive check completed');
        return true;
    }
};

// Auto-run check if this script is loaded in a browser environment
if (typeof window !== 'undefined') {
    // Make available globally
    window.DatabaseChecker = DatabaseChecker;
    
    // Optional: Auto-run on page load (commented out by default)
    // document.addEventListener('DOMContentLoaded', () => {
    //     console.log('Database checker loaded. Use DatabaseChecker.runComprehensiveCheck() to test.');
    // });
    
    console.log('‚úÖ DatabaseChecker loaded. Available methods:');
    console.log('  ‚Ä¢ DatabaseChecker.checkDatabase()');
    console.log('  ‚Ä¢ DatabaseChecker.checkTable("users")');
    console.log('  ‚Ä¢ DatabaseChecker.runComprehensiveCheck()');
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DatabaseChecker;
}
