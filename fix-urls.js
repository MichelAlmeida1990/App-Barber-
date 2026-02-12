const fs = require('fs');
const path = require('path');

const API_URL_PATTERN = /http:\/\/(localhost|127\.0\.0\.1):8000/g;
const REPLACEMENT = "process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'";

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Substituir URLs hardcoded
    content = content.replace(
      /'http:\/\/(localhost|127\.0\.0\.1):8000(\/[^']*)'/g,
      `\`\${${REPLACEMENT}}$2\``
    );
    
    content = content.replace(
      /"http:\/\/(localhost|127\.0\.0\.1):8000(\/[^"]*)"/g,
      `\`\${${REPLACEMENT}}$2\``
    );
    
    content = content.replace(
      /`http:\/\/(localhost|127\.0\.0\.1):8000(\/[^`]*)`/g,
      `\`\${${REPLACEMENT}}$2\``
    );
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.next')) {
      walkDir(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Executar
const frontendSrc = path.join(__dirname, 'frontend', 'src');
const files = walkDir(frontendSrc);
let fixedCount = 0;

files.forEach(file => {
  if (fixFile(file)) {
    fixedCount++;
  }
});

console.log(`\n✅ Fixed ${fixedCount} files`);



