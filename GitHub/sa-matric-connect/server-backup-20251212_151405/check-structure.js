// check-structure.js
const path = require('path');
const fs = require('fs');

console.log('🔍 Checking project structure...\n');

// Check current directory
const serverDir = __dirname;
console.log('📁 Server directory:', serverDir);

// Check parent directory
const parentDir = path.join(serverDir, '..');
console.log('📁 Parent directory:', parentDir);

// Check for public folder
const publicDir = path.join(parentDir, 'public');
console.log('📂 Public folder exists:', fs.existsSync(publicDir));

if (fs.existsSync(publicDir)) {
    console.log('📂 Public folder contents:');
    const files = fs.readdirSync(publicDir);
    files.forEach(file => {
        const filePath = path.join(publicDir, file);
        const isDir = fs.statSync(filePath).isDirectory();
        console.log(`   ${isDir ? '📁' : '📄'} ${file}`);
    });
}

// Check for index.html
const indexPath = path.join(publicDir, 'index.html');
console.log('\n📄 index.html exists:', fs.existsSync(indexPath));

// Check for homepage.html
const homePath = path.join(publicDir, 'homepage.html');
console.log('📄 homepage.html exists:', fs.existsSync(homePath));