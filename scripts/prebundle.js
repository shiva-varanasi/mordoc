/**
 * Pre-bundle script - Bundles client application during package build
 * 
 * This script runs during prepublishOnly to create a production-ready
 * browser bundle from the React client app. The pre-bundled file is then
 * copied to user projects at runtime, avoiding the need to bundle from
 * source files during user builds.
 */

const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

async function prebundle() {
  console.log('📦 Pre-bundling client application...');
  
  // Ensure output directory exists
  const bundleDir = path.join(__dirname, '../dist/bundles');
  if (!fs.existsSync(bundleDir)) {
    fs.mkdirSync(bundleDir, { recursive: true });
  }

  try {
    // Bundle client app for production
    const result = await esbuild.build({
      entryPoints: [path.join(__dirname, '../src/client/main.tsx')],
      bundle: true,
      outfile: path.join(bundleDir, 'client.js'),
      platform: 'browser',
      target: ['es2020'],
      format: 'iife',
      minify: true,
      sourcemap: false, // No sourcemaps for production bundle
      jsx: 'automatic',
      jsxImportSource: 'react',
      define: {
        'process.env.NODE_ENV': '"production"',
      },
      loader: {
        '.tsx': 'tsx',
        '.ts': 'ts',
        '.jsx': 'jsx',
        '.js': 'js',
      },
      logLevel: 'info',
      metafile: true,
    });

    // Log bundle size
    if (result.metafile) {
      const outputs = Object.values(result.metafile.outputs);
      if (outputs.length > 0) {
        const totalSize = outputs.reduce((sum, output) => sum + output.bytes, 0);
        const sizeInKB = (totalSize / 1024).toFixed(2);
        console.log(`✓ Client bundle created: ${sizeInKB} KB`);
        console.log(`  Location: dist/bundles/client.js`);
      }
    }
  } catch (error) {
    console.error('❌ Pre-bundle failed:', error.message);
    process.exit(1);
  }
}

// Run the prebundle process
prebundle().catch((err) => {
  console.error('❌ Unexpected error during pre-bundling:', err);
  process.exit(1);
});

