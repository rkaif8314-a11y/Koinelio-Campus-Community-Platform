import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const read = (relativePath) => readFile(path.join(process.cwd(), relativePath), 'utf8');

async function exists(relativePath) {
  try {
    await access(path.join(process.cwd(), relativePath));
    return true;
  } catch {
    return false;
  }
}

async function listSourceFiles(directory) {
  const entries = await import('node:fs/promises').then(({ readdir }) => readdir(path.join(process.cwd(), directory), { withFileTypes: true }));
  const files = [];
  for (const entry of entries) {
    const relativePath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listSourceFiles(relativePath));
    else if (/\.(?:tsx?|jsx?)$/.test(entry.name)) files.push(relativePath);
  }
  return files;
}

test('root layout mounts only the active theme provider, not the retired demo provider', async () => {
  const rootLayout = await read('app/layout.tsx');
  assert.match(rootLayout, /ThemeProvider/);
  assert.doesNotMatch(rootLayout, /AppProvider|app-context|demo-data/);
  assert.equal(await exists('lib/app-context.tsx'), false);
  assert.equal(await exists('lib/demo-data.ts'), false);
});

test('no live app or component source imports the retired synthetic demo modules', async () => {
  const files = [
    ...await listSourceFiles('app'),
    ...await listSourceFiles('components'),
    ...await listSourceFiles('lib'),
  ];
  const offenders = [];
  for (const file of files) {
    const source = await read(file);
    if (/from\s+['\"][^'\"]*(?:demo-data|app-context)/.test(source)) offenders.push(file);
  }
  assert.deepEqual(offenders, []);
});

test('Campus Guide clearly identifies itself as unofficial, read-only public-source content', async () => {
  const page = await read('app/dashboard/campus/page.tsx');
  const config = await read('lib/institution-config.ts');
  assert.match(page, /Important: independent campus guide/);
  assert.match(page, /Explore campus communities/);
  assert.doesNotMatch(page, /interactive demo|demo workspace|demo interactions|demo\/local state/i);
  assert.match(config, /pilotDisclaimer:/);
  assert.match(config, /not operated, endorsed, or approved by IIT Bhilai/);
});

test('Campus Guide uses the configured event date and does not mislabel past listings as upcoming', async () => {
  const page = await read('app/dashboard/campus/page.tsx');
  const config = await read('lib/institution-config.ts');
  assert.match(config, /OFFICIAL_EVENT_LISTINGS/);
  assert.match(config, /24 October 2026/);
  assert.match(config, /past as of 7 November 2026/);
  assert.match(page, /title="Public event listings and recurring activities"/);
  assert.match(page, /\{event\.date\}/);
  assert.doesNotMatch(page, /title="Official upcoming events"|OFFICIAL_UPCOMING_EVENTS|>Oct<.*>24</);
});

test('legacy profile edit URL redirects to the canonical own-profile editor', async () => {
  const route = await read('app/dashboard/profile/[id]/edit/page.tsx');
  assert.match(route, /redirect\(['"]\/dashboard\/profile['"]\)/);
});

test('event detail is Supabase-backed and scopes registration reads and writes to the signed-in account', async () => {
  const route = await read('app/dashboard/events/[id]/page.tsx');
  assert.match(route, /\.from\(['"]events['"]\)/);
  assert.match(route, /\.from\(['"]event_registrations['"]\)/);
  assert.match(route, /\.eq\(['"]user_id['"],\s*authData\.user\.id\)/);
  assert.doesNotMatch(route, /lib\/demo-data|useApp\(|getEventById/);
});

test('environment examples contain only public Supabase client settings and env files are ignored', async () => {
  const example = await read('.env.example');
  const gitignore = await read('.gitignore');
  assert.match(example, /NEXT_PUBLIC_SUPABASE_URL=/);
  assert.match(example, /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=/);
  assert.doesNotMatch(example, /^SUPABASE_SERVICE_ROLE_KEY=/m);
  assert.match(gitignore, /^\.env\*$/m);
});

test('CI runs frozen install, tests, type-check, lint, and production build', async () => {
  const workflow = await read('.github/workflows/ci.yml');
  assert.match(workflow, /pnpm install --frozen-lockfile/);
  assert.match(workflow, /pnpm test/);
  assert.match(workflow, /pnpm type-check/);
  assert.match(workflow, /pnpm lint/);
  assert.match(workflow, /pnpm build/);
});
