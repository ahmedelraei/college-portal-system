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
    '    npm run migration:generate --name=MyMigration\n' +
    '    pnpm run migration:generate --name=MyMigration\n'
  );
  process.exit(1);
}

console.log(`Generating migration: ${name}`);

// Use TypeORM CLI through ts-node for more reliable execution
const command = `npx typeorm-ts-node-commonjs migration:generate -d ./src/lib/configs/db/data-source.ts ./src/migrations/${name}`;

console.log('Executing command:', command);

// Execute the command directly as a string for better compatibility
const result = spawnSync(command, [], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, NODE_ENV: 'development' }
});

if (result.error) {
  console.error('Error executing command:', result.error);
}

console.log('Command completed with status:', result.status);
process.exit(result.status);
