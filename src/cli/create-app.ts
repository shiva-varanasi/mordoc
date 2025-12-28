/**
 * Create App command - Scaffolds a new Mordoc project
 * Usage: createApp(projectName, options)
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export interface CreateAppOptions {
  template?: string; // Template to use (default: 'default')
  skipInstall?: boolean; // Skip npm install
  skipGit?: boolean; // Skip git init (default: false, means git is initialized)
}

/**
 * Create a new Mordoc documentation project
 */
export async function createApp(
  projectName: string,
  options: CreateAppOptions = {}
): Promise<void> {
  const startTime = Date.now();

  try {
    // Validate project name
    validateProjectName(projectName);

    // Determine project directory
    const projectDir = path.resolve(process.cwd(), projectName);

    // Check if directory already exists
    if (fs.existsSync(projectDir)) {
      console.error(`❌ Error: Directory "${projectName}" already exists`);
      process.exit(1);
    }

    console.log(`\n📦 Creating new Mordoc project: ${projectName}\n`);

    // Create project directory
    console.log('Creating project directory...');
    fs.mkdirSync(projectDir, { recursive: true });

    // Copy template files
    console.log('Copying template files...');
    const templateName = options.template || 'default';
    await copyTemplate(projectDir, templateName);

    // Create .gitignore file (npm excludes it from published packages)
    createGitignore(projectDir);

    // Update package.json with project name
    console.log('Configuring package.json...');
    updatePackageJson(projectDir, projectName);

    // Initialize git repository (unless --skip-git)
    if (options.skipGit !== true) {
      console.log('Initializing git repository...');
      initGitRepo(projectDir);
    }

    // Install dependencies (unless --skip-install)
    if (!options.skipInstall) {
      console.log('Installing dependencies...');
      installDependencies(projectDir);
    }

    // Calculate time
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    // Show success message
    showSuccessMessage(projectName, options.skipInstall || false, duration);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Failed to create project:');
    console.error((error as Error).message);
    process.exit(1);
  }
}

/**
 * Validate project name
 */
function validateProjectName(name: string): void {
  if (!name || name.trim() === '') {
    throw new Error('Project name cannot be empty');
  }

  // Check for invalid characters
  if (!/^[a-zA-Z0-9-_]+$/.test(name)) {
    throw new Error(
      'Project name can only contain letters, numbers, hyphens, and underscores'
    );
  }

  // Check for reserved names
  const reservedNames = ['node_modules', 'dist', 'build', 'public', 'src'];
  if (reservedNames.includes(name.toLowerCase())) {
    throw new Error(`"${name}" is a reserved name and cannot be used`);
  }
}

/**
 * Copy template files to project directory
 */
async function copyTemplate(projectDir: string, templateName: string): Promise<void> {
  // Get template directory
  const templateDir = path.join(__dirname, '../../templates', templateName);

  if (!fs.existsSync(templateDir)) {
    throw new Error(`Template "${templateName}" not found`);
  }

  // Copy all files from template
  copyDirectory(templateDir, projectDir);
}

/**
 * Recursively copy directory
 */
function copyDirectory(src: string, dest: string): void {
  // Create destination directory
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Read source directory
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // Recursively copy subdirectory
      copyDirectory(srcPath, destPath);
    } else {
      // Copy file
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Create .gitignore file in project directory
 */
function createGitignore(projectDir: string): void {
  const gitignoreContent = `# Dependencies
node_modules/

# Build output
dist/

# Logs
*.log

# Environment
.env
.env.local

# IDE
.vscode/
.idea/
*.sublime-workspace

# OS
.DS_Store
Thumbs.db

# Mordoc cache
.mordoc-cache/
`;

  const gitignorePath = path.join(projectDir, '.gitignore');
  fs.writeFileSync(gitignorePath, gitignoreContent, 'utf8');
}

/**
 * Update package.json with project name
 */
function updatePackageJson(projectDir: string, projectName: string): void {
  const packageJsonPath = path.join(projectDir, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    throw new Error('package.json not found in template');
  }

  // Read package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Update name
  packageJson.name = projectName;

  // Write back
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');
}

/**
 * Initialize git repository
 */
function initGitRepo(projectDir: string): void {
  try {
    execSync('git init', {
      cwd: projectDir,
      stdio: 'ignore',
    });
  } catch (error) {
    console.warn('Warning: Failed to initialize git repository');
    console.warn('You can initialize it manually later with: git init');
  }
}

/**
 * Install npm dependencies
 */
function installDependencies(projectDir: string): void {
  try {
    console.log('\n  Installing packages. This might take a moment...\n');

    execSync('npm install', {
      cwd: projectDir,
      stdio: 'inherit', // Show npm output
    });

    console.log('');
  } catch (error) {
    console.warn('\nWarning: Failed to install dependencies');
    console.warn('You can install them manually later with: npm install\n');
  }
}

/**
 * Show success message with next steps
 */
function showSuccessMessage(projectName: string, skipInstall: boolean, duration: string): void {
  console.log(`\n✨ Success! Created ${projectName} in ${duration}s\n`);
  console.log('Your documentation project is ready!\n');
  console.log('Get started with:\n');
  console.log(`  cd ${projectName}`);

  if (skipInstall) {
    console.log('  npm install');
  }

  console.log('  npm run build');
  console.log('  npm run dev\n');

  console.log('Project structure:\n');
  console.log('  content/        # Your markdown files');
  console.log('  config/         # Configuration files');
  console.log('  public/         # Static assets');
  console.log('  dist/           # Generated site (after build)\n');

  console.log('Next steps:\n');
  console.log('  1. Edit content in content/en/');
  console.log('  2. Customize navigation in config/sidenav.yaml');
  console.log('  3. Run npm run build to generate your site');
  console.log('  4. Run npm run dev to preview locally\n');

  console.log('Happy documenting! 📚\n');
}

// Execute if run directly (not imported)
if (require.main === module) {
  const args = process.argv.slice(2);
  const projectName = args[0];
  
  if (!projectName) {
    console.error('Please specify a project name:');
    console.error('  node dist/cli/create-app.js my-docs');
    process.exit(1);
  }
  
  const options: CreateAppOptions = {};
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--skip-install') {
      options.skipInstall = true;
    } else if (arg === '--skip-git') {
      options.skipGit = true;
    }
  }
  
  createApp(projectName, options);
}