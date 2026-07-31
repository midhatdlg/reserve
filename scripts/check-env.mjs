#!/usr/bin/env node
/**
 * Validates .env.local for the hosted Supabase + Google Auth workflow.
 */
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseEnvFile,
  projectRefFromSupabaseUrl,
  stripQuotes,
} from './parse-env.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = resolve(root, '.env.local');

if (!existsSync(envPath)) {
  console.error('Missing .env.local');
  console.error('  cp .env.example .env.local');
  console.error('  Then paste the team Supabase keys (see README).');
  process.exit(1);
}

const env = parseEnvFile(envPath);
const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
];

const missing = required.filter((key) => !stripQuotes(env[key] ?? ''));
const secret = stripQuotes(env.RSVP_SESSION_SECRET ?? '');
const secretOk = secret.length >= 32;
const url = stripQuotes(env.NEXT_PUBLIC_SUPABASE_URL ?? '');
const isLocal = /localhost|127\.0\.0\.1/.test(url);
const projectRef = projectRefFromSupabaseUrl(url);

let failed = false;

if (missing.length) {
  failed = true;
  console.error('Missing required vars in .env.local:');
  for (const key of missing) console.error(`  - ${key}`);
} else {
  console.log('Required Supabase vars: ok');
}

if (!secretOk) {
  failed = true;
  console.error(
    'RSVP_SESSION_SECRET missing or shorter than 32 characters.',
    'Run `npm run setup` to add one.'
  );
} else {
  console.log('RSVP_SESSION_SECRET: ok');
}

if (isLocal) {
  console.log('Supabase target: local (' + url + ')');
  console.log(
    'Google OAuth for local: set SUPABASE_AUTH_EXTERNAL_GOOGLE_* in supabase/.env (see README).'
  );
} else if (projectRef) {
  console.log(`Supabase target: hosted (${projectRef})`);
  console.log('');
  console.log('Google Auth checklist (one-time, project owner):');
  console.log('  Google Cloud → OAuth Web client → Authorized redirect URI:');
  console.log(`    https://${projectRef}.supabase.co/auth/v1/callback`);
  console.log('  Supabase Dashboard → Authentication → Providers → Google → enabled');
  console.log('  Supabase Dashboard → Authentication → URL configuration → allow:');
  console.log('    http://localhost:3000/**');
  console.log('    http://localhost:3000/callback');
  console.log('');
  console.log('Then: npm run dev → /login → Continue with Google');
} else {
  console.log('Supabase URL looks non-standard:', url);
}

if (failed) process.exit(1);
console.log('');
console.log('Env looks ready. Start with: npm run dev');
