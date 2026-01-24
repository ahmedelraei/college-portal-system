const { spawnSync } = require('child_process');

// Try to get the migration name from different sources
// 1. From npm_config_name environment variable (npm standard)
// 2. From command line arguments (for pnpm and other package managers)
let name = process.env.npm_config_name;

// If not found in environment, try to parse from command line arguments
if (!name) {
  const args = process.argv.slice(2);
  for (const arg of args) {
    // Check for --name=MigrationName format
    if (arg.startsWith('--name=')) {
      name = arg.substring('--name='.length);
      break;
    }
    // Check for --name MigrationName format
    if (arg === '--name' && args.indexOf(arg) < args.length - 1) {
      name = args[args.indexOf(arg) + 1];
      break;
    }
  }
}

if (!name) {
  console.error(
    '\n  ✖ Missing migration name. Usage:\n' +
    '    npm run migration:create --name=MyMigration\n' +
    '    pnpm run migration:create --name=MyMigration\n'
  );
  process.exit(1);
}

console.log(`Creating migration: ${name}`);

const args = [
  'run', 'typeorm', '--',
    'migration:create',
    `./src/migrations/${name}`
];

// Detect which package manager is being used
const packageManager = process.env.npm_config_user_agent && process.env.npm_config_user_agent.startsWith('pnpm')
  ? 'pnpm'
  : 'npm';

const result = spawnSync(packageManager, args, { stdio: 'inherit', shell: true });
process.exit(result.status);
