/**
 * Dev command - Starts development server
 * Serves the pre-built dist/ folder (MVP: no live reload, manual rebuild)
 * Usage: mordoc dev [options]
 */

import path from 'path';
import fs from 'fs';
import http from 'http';
import sirv from 'sirv';

export interface DevCommandOptions {
  projectRoot?: string;
  port?: number;
  host?: string;
  open?: boolean;
}

/**
 * Execute the dev command
 */
export async function dev(options: DevCommandOptions = {}): Promise<void> {
  try {
    // Get project root
    const projectRoot = options.projectRoot || process.cwd();
    const distDir = path.join(projectRoot, 'dist');

    // Check if dist/ exists
    if (!fs.existsSync(distDir)) {
      console.error('❌ Error: dist/ directory not found');
      console.error('Please run "mordoc build" first to generate the static site.');
      process.exit(1);
    }

    // Server configuration
    const port = options.port || 3000;
    const host = options.host || 'localhost';

    // Create static file server using sirv
    const serve = sirv(distDir, {
      dev: true, // Development mode (no caching)
      single: true, // SPA mode: serve index.html for 404s
      etag: true,
    });

    // Create HTTP server
    const server = http.createServer((req, res) => {
      serve(req, res, () => {
        // Fallback for 404s
        res.statusCode = 404;
        res.end('Not found');
      });
    });

    // Start server
    server.listen(port, host, () => {
      console.log('\n🚀 Mordoc dev server started\n');
      console.log(`  Local:   http://${host}:${port}`);
      console.log(`  Network: http://${getLocalIpAddress()}:${port}`);
      console.log('\n📝 Note: This is serving the pre-built dist/ folder.');
      console.log('   Run "mordoc build" to rebuild after making changes.\n');
      console.log('Press Ctrl+C to stop the server');
    });

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Error: Port ${port} is already in use`);
        console.error(`Try a different port: mordoc dev --port ${port + 1}`);
      } else {
        console.error('❌ Server error:', error.message);
      }
      process.exit(1);
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n\n👋 Shutting down dev server...');
      server.close(() => {
        console.log('✓ Server stopped');
        process.exit(0);
      });
    });

    process.on('SIGTERM', () => {
      server.close(() => {
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('\n❌ Failed to start dev server:');
    console.error((error as Error).message);
    process.exit(1);
  }
}

/**
 * Parse command-line arguments for dev command
 */
export function parseDevArgs(args: string[]): DevCommandOptions {
  const options: DevCommandOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--port':
      case '-p':
        const portValue = parseInt(args[++i], 10);
        if (isNaN(portValue)) {
          console.error('Error: Invalid port number');
          process.exit(1);
        }
        options.port = portValue;
        break;

      case '--host':
      case '-h':
        options.host = args[++i];
        break;

      case '--open':
      case '-o':
        options.open = true;
        break;

      case '--help':
        showDevHelp();
        process.exit(0);
        break;

      default:
        if (arg.startsWith('-')) {
          console.warn(`Warning: Unknown option ${arg}`);
        }
        break;
    }
  }

  return options;
}

/**
 * Show help text for dev command
 */
function showDevHelp(): void {
  console.log(`
mordoc dev - Start development server

Usage:
  mordoc dev [options]

Options:
  -p, --port <number>   Port number (default: 3000)
  -h, --host <host>     Host address (default: localhost)
  -o, --open            Open browser automatically
  --help                Show this help message

Note:
  The dev server serves the pre-built dist/ folder.
  Run "mordoc build" first to generate the site.
  Rebuild manually after making changes.

Examples:
  mordoc dev
  mordoc dev --port 8080
  mordoc dev --host 0.0.0.0
  `);
}

/**
 * Get local IP address for network access
 */
function getLocalIpAddress(): string {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip internal and non-IPv4 addresses
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }

  return 'localhost';
}