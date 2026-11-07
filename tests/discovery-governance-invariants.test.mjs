import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const [profileSql, clubSql, electionSql, moderationSql, discoverPage, clubsPage, electionsPage, moderationPage] = await Promise.all([
  readFile(new URL('supabase/migrations/20261015184841_koinelio_secure_rls_and_auth_profiles.sql', root), 'utf8'),
  readFile(new URL('supabase/migrations/20261016090000_iit_bhilai_access_and_club_governance.sql', root), 'utf8'),
  readFile(new URL('supabase/migrations/20261016160000_koinelio_campus_elections.sql', root), 'utf8'),
  readFile(new URL('supabase/migrations/20261016140000_koinelio_post_reports_and_moderation.sql', root), 'utf8'),
  readFile(new URL('app/dashboard/discover/page.tsx', root), 'utf8'),
  readFile(new URL('app/dashboard/clubs/page.tsx', root), 'utf8'),
  readFile(new URL('app/dashboard/elections/page.tsx', root), 'utf8'),
  readFile(new URL('app/dashboard/moderation/page.tsx', root), 'utf8'),
]);

function functionBody(sql, qualifiedName) {
  const start = sql.indexOf(`create or replace function ${qualifiedName}(`);
  assert.notEqual(start, -1, `Expected ${qualifiedName} to exist`);
  const end = sql.indexOf('$function$;', start);
  assert.notEqual(end, -1, `Expected ${qualifiedName} to close its function body`);
  return sql.slice(start, end + '$function$;'.length);
}

test('discovery relies on privacy-scoped profile RLS and queries only approved clubs and published events', () => {
  const policyStart = profileSql.indexOf('create policy "Profiles visible by privacy and campus"');
  assert.notEqual(policyStart, -1);
  const policy = profileSql.slice(policyStart, profileSql.indexOf(';', policyStart) + 1);
  assert.match(policy, /id = \(select auth\.uid\(\)\)/);
  assert.match(policy, /profile_visibility = 'public'/);
  assert.match(policy, /profile_visibility = 'campus'[\s\S]*institution_id is not null[\s\S]*current_user_institution_id/);
  assert.doesNotMatch(policy, /profile_visibility\s*=\s*'private'/);
  assert.match(discoverPage, /\.eq\('approval_status',\s*'approved'\)/);
  assert.match(discoverPage, /\.eq\('status',\s*'published'\)/);
  assert.match(discoverPage, /\.neq\('id',\s*authData\.user\.id\)/);
});

test('discovery exposes retry feedback after a directory load failure', () => {
  assert.match(discoverPage, /role="alert"/);
  assert.match(discoverPage, /onClick=\{\(\) => void loadDirectory\(\)\}/);
  assert.match(discoverPage, /aria-live="polite"/);
});

test('club governance UI checks both role-query and platform-admin RPC errors', () => {
  assert.match(clubsPage, /supabase\.rpc\('is_platform_admin'\)/);
  assert.match(clubsPage, /if \(userRoleResult\.error\) throw userRoleResult\.error/);
  assert.match(clubsPage, /if \(platformAdminResult\.error\) throw platformAdminResult\.error/);
  assert.match(clubsPage, /const leadership = isPlatformAdmin \|\| roles\.some/);
});

test('club room RLS keeps General, Members, and Core Team access separate', () => {
  const definition = functionBody(clubSql, 'private.can_access_club_room');
  assert.match(definition, /private\.is_iit_bhilai_email_verified\(\(select auth\.uid\(\)\)\)/);
  assert.match(definition, /room\.room_type = 'general'/);
  assert.match(definition, /room\.room_type = 'members'/);
  assert.match(definition, /cm\.role in \('member', 'core_member', 'coordinator'\)/);
  assert.match(definition, /room\.room_type = 'core'/);
  assert.match(definition, /cm\.role in \('core_member', 'coordinator'\)/);
  assert.match(clubSql, /create policy "Read messages in accessible club rooms"[\s\S]*?using \(private\.can_access_club_room\(room_id\)\)/i);
  assert.match(clubSql, /create policy "Send messages in accessible club rooms"[\s\S]*?sender_id = \(select auth\.uid\(\)\)[\s\S]*?private\.can_access_club_room\(room_id\)/i);
});

test('platform admins receive election controls while the database remains the authority', () => {
  assert.match(electionsPage, /supabase\.rpc\('is_platform_admin'\)/);
  assert.match(electionsPage, /platformAdminResult\.data === true/);
  assert.match(electionsPage, /setInterval\(\(\) => setCurrentTime\(Date\.now\(\)\), 30_000\)/);
  const create = functionBody(electionSql, 'public.create_campus_election');
  const publish = functionBody(electionSql, 'public.publish_campus_election_results');
  assert.match(create, /public\.is_platform_admin\(\) or public\.has_institution_role/);
  assert.match(publish, /public\.is_platform_admin\(\) or public\.has_institution_role/);
});

test('election ballots are private and never store voter identity', () => {
  assert.match(electionSql, /create table if not exists private\.campus_election_voters[\s\S]*voter_id uuid/);
  const ballotStart = electionSql.indexOf('create table if not exists private.campus_election_ballots');
  const ballotEnd = electionSql.indexOf('\n);', ballotStart);
  assert.notEqual(ballotStart, -1);
  const ballotDefinition = electionSql.slice(ballotStart, ballotEnd);
  assert.match(ballotDefinition, /candidate_id uuid/);
  assert.doesNotMatch(ballotDefinition, /voter_id|user_id|profile_id/i);
  assert.match(electionSql, /revoke all on table private\.campus_election_ballots from public, anon, authenticated/i);
  assert.match(electionSql, /insert into private\.campus_election_voters\(election_id,voter_id\)/);
  assert.match(electionSql, /insert into private\.campus_election_ballots\(election_id,candidate_id\)/);
});

test('election voting and result access validate account, window, candidate, uniqueness, and publication', () => {
  const vote = functionBody(electionSql, 'public.cast_campus_election_vote');
  const results = functionBody(electionSql, 'public.get_campus_election_results');
  assert.match(vote, /private\.is_iit_bhilai_email_verified\(auth\.uid\(\)\)/);
  assert.match(vote, /now\(\) < v_election\.voting_opens_at/);
  assert.match(vote, /now\(\) >= v_election\.voting_closes_at/);
  assert.match(vote, /candidate is not part of this election/i);
  assert.match(vote, /already voted in this election/i);
  assert.match(results, /e\.status = 'published'/);
  assert.match(results, /private\.campus_election_ballots/);
  assert.match(electionSql, /revoke all on function public\.cast_campus_election_vote\(uuid,uuid\) from public, anon/i);
  assert.match(electionSql, /grant execute on function public\.cast_campus_election_vote\(uuid,uuid\) to authenticated/i);
});

test('post reports cannot self-report; moderation resolution requires a moderator/admin and an open report', () => {
  const submit = functionBody(moderationSql, 'public.submit_post_report');
  const resolve = functionBody(moderationSql, 'public.resolve_post_report');
  assert.match(submit, /private\.is_iit_bhilai_email_verified\(auth\.uid\(\)\)/);
  assert.match(submit, /public\.can_view_post\(p\.id\)/);
  assert.match(submit, /v_author_id = auth\.uid\(\)/);
  assert.match(submit, /unique_violation/);
  assert.match(resolve, /array\['institution_admin', 'moderator'\]/);
  assert.match(resolve, /public\.is_platform_admin\(\)/);
  assert.match(resolve, /v_report\.status <> 'open'/);
  assert.match(resolve, /set moderation_status = 'hidden'/);
  assert.match(moderationPage, /bg-\[var\(--k-danger\)\][^"]*text-\[var\(--k-on-danger\)\]/);
  assert.match(moderationSql, /revoke all on function public\.resolve_post_report\(uuid, text, text\) from public, anon/i);
  assert.match(moderationSql, /grant execute on function public\.resolve_post_report\(uuid, text, text\) to authenticated/i);
});
