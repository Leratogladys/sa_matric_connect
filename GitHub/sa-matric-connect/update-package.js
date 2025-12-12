const fs = require('fs');
const packagePath = './package.json';

try {
    const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Ensure scripts section exists
    if (!packageData.scripts) {
        packageData.scripts = {};
    }
    
    // Update scripts
    packageData.scripts = {
        "start": "node server/server.js",
        "dev": "nodemon server/server.js",
        "test": "echo \"Error: no test specified\" && exit 1",
        ...packageData.scripts  // Keep existing scripts
    };
    
    // Ensure main entry point is correct
    packageData.main = "server/server.js";
    
    // Write updated package.json
    fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2));
    console.log('✅ Updated package.json with correct scripts');
    
} catch (error) {
    console.error('Error updating package.json:', error.message);
}
