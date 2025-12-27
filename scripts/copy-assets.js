/**
 * Copy assets script - Copies static assets to dist during package build
 * 
 * This script copies src/assets to dist/assets during prepublishOnly.
 * These assets (fonts, etc.) are then included in the published package
 * and copied to user projects during their build process.
 */

const fs = require('fs');
const path = require('path');

/**
 * Recursively copy a directory
 */
function copyDirectory(src, dest) {
  // Check if source exists
  if (!fs.existsSync(src)) {
    console.log(`⚠️  Source directory not found: ${src}`);
    return;
  }
  
  // Create destination directory
  fs.mkdirSync(dest, { recursive: true });
  
  // Read all entries in source directory
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  // Copy each entry
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively copy subdirectories
      copyDirectory(srcPath, destPath);
    } else {
      // Copy files
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('📁 Copying static assets...');

// Copy assets from src to dist
const srcAssets = path.join(__dirname, '../src/assets');
const distAssets = path.join(__dirname, '../dist/assets');

copyDirectory(srcAssets, distAssets);

console.log('✓ Assets copied to dist/assets');

