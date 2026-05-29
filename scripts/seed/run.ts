#!/usr/bin/env ts-node
/**
 * Gestão Fretamento Pro — Seed Runner
 *
 * Executa o seed completo do banco de dados para desenvolvimento e staging.
 * Uso: pnpm --filter @gestao-fretamento-pro/database exec ts-node ../../scripts/seed/run.ts
 *      ou simplesmente: pnpm db:seed (se configurado no package.json do database)
 */

import { execSync } from 'node:child_process';
import * as path from 'node:path';

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

function run(command: string, cwd: string = PROJECT_ROOT): void {
  console.log(`\n► ${command}`);
  execSync(command, { cwd, stdio: 'inherit' });
}

async function main(): Promise<void> {
  const env = process.env['NODE_ENV'] ?? 'development';

  console.log('==================================================');
  console.log('  GFP — Seed Runner');
  console.log(`  Environment: ${env}`);
  console.log('==================================================');

  if (env === 'production') {
    console.error('❌  Cannot run seed in production environment!');
    process.exit(1);
  }

  try {
    run(
      'pnpm --filter @gestao-fretamento-pro/database exec ts-node seed/index.ts',
      PROJECT_ROOT,
    );

    console.log('\n✅  Seed complete!');
    console.log(
      '    1 tenant, 2 branches, 20 vehicles, 30 drivers, 5 clients, 15 routes, 100 trips, 50 fuel records, 20 occurrences',
    );
  } catch (error) {
    console.error('\n❌  Seed failed:', error);
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
