const path = require('path');

// Simulate what the server will do
const simulatedDirname = path.join(process.cwd(), 'server');
console.log('Simulating server directory:', simulatedDirname);

// Old path
const oldPublicPath = path.join(simulatedDirname, '..', 'public');
console.log('\n1. Old public path:', oldPublicPath);

// New path  
const newPublicPath = path.join(simulatedDirname, '..', 'client', 'public');
console.log('2. New public path:', newPublicPath);

// Check if paths exist
const fs = require('fs');
console.log('\n3. Path existence check:');
console.log('   Old path exists?', fs.existsSync(oldPublicPath) ? 'âœ… Yes' : 'âŒ No');
console.log('   New path exists?', fs.existsSync(newPublicPath) ? 'âœ… Yes' : 'âŒ No');

if (fs.existsSync(newPublicPath)) {
    console.log('\n4. Files in new public directory:');
    const files = fs.readdirSync(newPublicPath);
    files.forEach(file => {
        const filePath = path.join(newPublicPath, file);
        const isDir = fs.statSync(filePath).isDirectory();
        console.log(`   ${isDir ? 'í³' : 'í³„'} ${file}`);
    });
    
    // Check for HTML files
    const htmlFiles = files.filter(f => f.endsWith('.html'));
    console.log('\n5. HTML files found:', htmlFiles.length);
    htmlFiles.forEach(file => console.log(`   â€¢ ${file}`));
} else {
    console.log('\nâš  WARNING: New path does not exist!');
    console.log('   Current working directory:', process.cwd());
    console.log('   Try checking your folder structure.');
}
