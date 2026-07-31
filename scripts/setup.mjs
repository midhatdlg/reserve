#!/usr/bin/env node
/**
 * Hosted-Supabase setup: ensure .env.local exists with required shape,
 * fill RSVP_SESSION_SECRET if missing, then run the env check.
 *
 * Does not start Docker / local Supabase. For that use: npm run setup:local
 */
import { randomBytes } from 'node:crypto';
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { parseEnvFile, stripQuotes } from './parse-env.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = resolve(root, '.env.local');
const examplePath = resolve(root, '.env.example');

if (!existsSync(envPath)) {
  if (!existsSync(examplePath)) {
    console.error('Missing .env.example — cannot scaffold .env.local');
    process.exit(1);
  }
  copyFileSync(examplePath, envPath);
  console.log('Created .env.local from .env.example');
  console.log('Paste your team Supabase keys into .env.local, then re-run `npm run setup`.');
  process.exit(1);
}

const env = parseEnvFile(envPath);
const secret = stripQuotes(env.RSVP_SESSION_SECRET ?? '');
let wrote = false;

if (secret.length < 32) {
  const next = `dev-${randomBytes(24).toString('hex')}`;
  let text = readFileSync(envPath, 'utf8');
  if (/^RSVP_SESSION_SECRET=/m.test(text)) {
    text = text.replace(/^RSVP_SESSION_SECRET=.*$/m, `RSVP_SESSION_SECRET=${next}`);
  } else {
    if (!text.endsWith('\n')) text += '\n';
    text += `RSVP_SESSION_SECRET=${next}\n`;
  }
  if (!/^NEXT_PUBLIC_APP_URL=/m.test(text)) {
    text += `NEXT_PUBLIC_APP_URL=http://localhost:3000\n`;
  }
  writeFileSync(envPath, text, 'utf8');
  console.log('Added RSVP_SESSION_SECRET to .env.local');
  wrote = true;
}

const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
];
const missing = required.filter((key) => !stripQuotes(env[key] ?? ''));

if (missing.length) {
  console.error('');
  console.error('.env.local is missing Supabase keys:');
  for (const key of missing) console.error(`  - ${key}`);
  console.error('');
  console.error('Get them from the team (Supabase project → Settings → API),');
  console.error('paste into .env.local, then re-run `npm run setup`.');
  process.exit(1);
}

if (wrote) console.log('');

const check = spawnSync(process.execPath, [resolve(root, 'scripts/check-env.mjs')], {
  cwd: root,
  stdio: 'inherit',
});
process.exit(check.status ?? 1);
