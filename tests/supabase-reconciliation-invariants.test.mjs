import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL('../' + path, import.meta.url), 'utf8');

const migrations = {
  governance: 'supabase/migrations/20261016090000_iit_bhilai_access_and_club_governance.sql',
  avatars: 'supabase/migrations/20261016100000_profile_avatars_storage.sql',
  tenant: 'supabase/migrations/20261016110000_koinelio_campus_tenant_bootstrap.sql',
  feed: 'supabase/migrations/20261016120000_koinelio_feed_media_and_classification.sql',
  directory: 'supabase/migrations/20261016130000_koinelio_profile_directory_category.sql',
  reports: 'supabase/migrations/20261016140000_koinelio_post_reports_and_moderation.sql',
  elections: 'supabase/migrations/20261016160000_koinelio_campus_elections.sql',
};

test('the seven post-core migrations exist and use explicit transaction boundaries', async () => {
  for (const [name, path] of Object.entries(migrations)) {
    const sql = await read(path);
    assert.match(sql, /^\s*--[\s\S]*?\bbegin;\s*$/im, name + ' migration should start a transaction');
    assert.match(sql, /\bcommit;\s*$/i, name + ' migration should commit its transaction');
  }
});

test('CI type-check command is backed by a package script', async () => {
  const pkg = JSON.parse(await read('package.json'));
  assert.equal(pkg.scripts['type-check'], 'tsc --noEmit');
});

test('governance migration enforces confirmed institute email and keeps bootstrap allowlist private', async () => {
  const sql = await read(migrations.governance);
  assert.match(sql, /new\.email_confirmed_at is not null/i);
  assert.match(sql, /@iitbhilai[\.]ac[\.]in/i);
  assert.match(sql, /create table if not exists private\.bootstrap_admin_emails/i);
  assert.match(sql, /revoke all on table private\.bootstrap_admin_emails from public, anon, authenticated/i);
  assert.match(sql, /set search_path to ''/i);
  assert.match(sql, /create trigger clubs_create_default_rooms/i);
});

test('avatar Storage is public-read by bucket configuration but owner-gated for writes', async () => {
  const sql = await read(migrations.avatars);
  assert.match(sql, /'profile-avatars'[\s\S]{0,120}true[\s\S]{0,80}2097152/i);
  assert.match(sql, /'image\/jpeg'[\s\S]*'image\/png'[\s\S]*'image\/webp'/i);
  for (const operation of ['insert', 'update', 'delete']) {
    assert.match(sql, new RegExp('for ' + operation + ' to authenticated', 'i'));
  }
  assert.match(sql, /storage\.foldername\(name\)\)\[1\] = \(select auth\.uid\(\)\)::text/i);
  assert.match(sql, /private\.is_iit_bhilai_email_verified/i);
});

test('campus feed media stays private and scoped to verified account-owned uploads', async () => {
  const sql = await read(migrations.feed);
  assert.match(sql, /'campus-post-media'[\s\S]{0,120}false[\s\S]{0,80}26214400/i);
  assert.match(sql, /Verified campus members read campus post media/i);
  assert.match(sql, /Verified campus members upload their own post media/i);
  assert.match(sql, /Verified campus members update their own post media/i);
  assert.match(sql, /Verified campus members delete their own post media/i);
  assert.match(sql, /private\.can_view_post\(p\.id\)/i);
  assert.match(sql, /post_type <> 'announcement'[\s\S]*public\.is_platform_admin\(\)/i);
});

test('IIT Bhilai tenant is initialized as pending rather than institutionally verified', async () => {
  const sql = await read(migrations.tenant);
  assert.match(sql, /'iit-bhilai'[\s\S]{0,100}'pending'/i);
  assert.match(sql, /alter column requested_by drop not null/i);
});

test('profile directory category is separate from trusted campus role', async () => {
  const sql = await read(migrations.directory);
  assert.match(sql, /add column if not exists profile_category text not null default 'student'/i);
  assert.match(sql, /profile_category in \('student', 'alumni'\)/i);
  assert.doesNotMatch(sql, /alter column campus_role/i);
});

test('report RPCs reject null decisions and use controlled moderation workflows', async () => {
  const sql = await read(migrations.reports);
  assert.match(sql, /if p_reason is null or p_reason not in/i);
  assert.match(sql, /if p_decision is null or p_decision not in/i);
  assert.match(sql, /public\.can_view_post\(p\.id\)/i);
  assert.match(sql, /revoke all on function public\.submit_post_report\(uuid, text, text\) from public, anon/i);
  assert.match(sql, /revoke all on function public\.resolve_post_report\(uuid, text, text\) from public, anon/i);
});

test('election ballots are separate from voter identity and denied direct client access', async () => {
  const sql = await read(migrations.elections);
  assert.match(sql, /private\.campus_election_voters[\s\S]*primary key \(election_id, voter_id\)/i);
  const ballotTable = sql.match(/create table if not exists private\.campus_election_ballots \(([\s\S]*?)\);/i)?.[1];
  assert.ok(ballotTable, 'private ballot table should be defined');
  assert.doesNotMatch(ballotTable, /voter_id/i);
  assert.match(sql, /revoke all on table private\.campus_election_ballots from public, anon, authenticated/i);
  assert.match(sql, /revoke all on function public\.cast_campus_election_vote\(uuid,uuid\) from public, anon/i);
});
