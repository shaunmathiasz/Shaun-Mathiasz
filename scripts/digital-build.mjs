import { spawnSync } from 'node:child_process';
// Only isolated Vercel Preview may attempt the additive service migration.
// Production builds never mutate a database; Production migration is a separate approval gate.
if(process.env.VERCEL==='1' && process.env.VERCEL_ENV==='preview'){
 const migration=spawnSync(process.execPath,['scripts/digital-migrate.mjs'],{stdio:'inherit',env:process.env});
 if(migration.status!==0)console.warn('DIGITAL_PREVIEW_SETUP_PENDING: additive migration not confirmed. Preview UI will build; commercial enquiries must not be considered ready until schema access is resolved.');
}
const build=spawnSync('next',['build','--webpack'],{stdio:'inherit',env:process.env});
process.exit(build.status??1);
