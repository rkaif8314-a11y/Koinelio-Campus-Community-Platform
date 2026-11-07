import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const electionSql = await readFile(new URL('../supabase/migrations/20261016160000_koinelio_campus_elections.sql', import.meta.url), 'utf8');
const governanceSql = await readFile(new URL('../supabase/migrations/20261015184841_koinelio_secure_rls_and_auth_profiles.sql', import.meta.url), 'utf8');

test('elections keep voter participation separate from anonymous ballots', () => {
  assert.match(electionSql, /private\.campus_election_voters/);
  assert.match(electionSql, /private\.campus_election_ballots/);
  assert.match(electionSql, /revoke all on table private\.campus_election_ballots from public, anon, authenticated/i);
  assert.match(electionSql, /primary key \(election_id, voter_id\)/);
  assert.doesNotMatch(electionSql, /campus_election_ballots\s*\([\s\S]{0,250}voter_id/i);
});

test('vote RPC validates election window, candidate membership, and repeat votes', () => {
  assert.match(electionSql, /now\(\) < v_election\.voting_opens_at/);
  assert.match(electionSql, /now\(\) >= v_election\.voting_closes_at/);
  assert.match(electionSql, /where id = p_candidate_row_id and election_id = p_election_id/);
  assert.match(electionSql, /insert into private\.campus_election_voters\(election_id,voter_id\)/);
  assert.match(electionSql, /already voted in this election/);
});

test('election result publication is restricted and only published results can be read', () => {
  assert.match(electionSql, /Only an authorised campus administrator can publish results/);
  assert.match(electionSql, /e\.status = 'published'/);
  assert.match(electionSql, /grant execute on function public\.get_campus_election_results\(uuid\) to authenticated/i);
});

test('recruitment database policies restrict applications and interviews to participants and club managers', () => {
  assert.match(governanceSql, /Applicants and club managers read applications/);
  assert.match(governanceSql, /Apply to open recruitment drives/);
  assert.match(governanceSql, /Applicants and organizers read interviews/);
  assert.match(governanceSql, /Club managers schedule interviews/);
});

const clubGovernanceSql = await readFile(
  new URL('../supabase/migrations/20261016090000_iit_bhilai_access_and_club_governance.sql', import.meta.url),
  'utf8',
);

function functionDefinition(name) {
  const start = clubGovernanceSql.indexOf(`create or replace function public.${name}(`);
  assert.notEqual(start, -1, `Expected function ${name} to exist in the governance migration`);
  const end = clubGovernanceSql.indexOf('$function$;', start);
  assert.notEqual(end, -1, `Expected function ${name} to have a closed function body`);
  return clubGovernanceSql.slice(start, end + '$function$;'.length);
}

test('campus leadership grants use a restricted SECURITY DEFINER decision workflow', () => {
  const definition = functionDefinition('decide_institution_role_request');
  assert.match(definition, /security definer\s+set search_path to ''/i);
  assert.match(definition, /auth\.uid\(\)\) is null/);
  assert.match(definition, /requested_role = 'institution_admin'/);
  assert.match(definition, /Only a platform administrator may appoint campus leadership/);
  assert.match(definition, /private\.has_institution_role\(v_request\.institution_id, array\[v_required_council_role\]\)/);
  assert.match(clubGovernanceSql, /revoke all on function public\.decide_institution_role_request\(uuid, text\) from public, anon/i);
  assert.match(clubGovernanceSql, /grant execute on function public\.decide_institution_role_request\(uuid, text\) to authenticated/i);
});

test('club invitations are restricted to approved-club managers and cannot self-invite', () => {
  const definition = functionDefinition('invite_club_member');
  assert.match(definition, /security definer\s+set search_path to ''/i);
  assert.match(definition, /p_invitee_id = \(select auth\.uid\(\)\)/);
  assert.match(definition, /p_invited_role not in \('member', 'core_member'\)/);
  assert.match(definition, /private\.can_manage_club\(p_club_id\)/);
  assert.match(definition, /club\.approval_status = 'approved'/);
  assert.match(definition, /private\.is_iit_bhilai_email_verified\(p_invitee_id\)/);
  assert.match(clubGovernanceSql, /revoke all on function public\.invite_club_member\(uuid, uuid, text, text\) from public, anon/i);
});

test('club invitations can only be accepted or declined by their intended account', () => {
  const definition = functionDefinition('respond_to_club_invitation');
  assert.match(definition, /invitation\.invitee_id = \(select auth\.uid\(\)\)/);
  assert.match(definition, /invitation\.status = 'pending'/);
  assert.match(definition, /private\.is_iit_bhilai_email_verified\(\(select auth\.uid\(\)\)\)/);
  assert.match(definition, /set status = 'accepted', responded_at = now\(\)/);
});

test('Core Member promotion requires an approved club, a manager and an active general member', () => {
  const definition = functionDefinition('promote_club_core_member');
  assert.match(definition, /private\.can_manage_club\(p_club_id\)/);
  assert.match(definition, /club\.approval_status = 'approved'/);
  assert.match(definition, /set role = 'core_member'/);
  assert.match(definition, /status = 'active'/);
  assert.match(definition, /role = 'member'/);
  assert.match(definition, /if v_rows <> 1 then/);
  assert.match(clubGovernanceSql, /grant execute on function public\.promote_club_core_member\(uuid, uuid\) to authenticated/i);
});

test('club room RLS separates general, member, and Core Team access', () => {
  const start = clubGovernanceSql.indexOf('create or replace function private.can_access_club_room(');
  assert.notEqual(start, -1, 'Expected centralized club-room access function');
  const end = clubGovernanceSql.indexOf('$function$;', start);
  assert.notEqual(end, -1, 'Expected club-room access function to close');
  const definition = clubGovernanceSql.slice(start, end);

  assert.match(definition, /security definer\s+set search_path to ''/i);
  assert.match(definition, /private\.is_iit_bhilai_email_verified\(\(select auth\.uid\(\)\)\)/);
  assert.match(definition, /club\.approval_status = 'approved'/);
  assert.match(definition, /room\.room_type = 'general'/);
  assert.match(definition, /room\.room_type = 'members'/);
  assert.match(definition, /cm\.role in \('member', 'core_member', 'coordinator'\)/);
  assert.match(definition, /room\.room_type = 'core'/);
  assert.match(definition, /cm\.role in \('core_member', 'coordinator'\)/);
  assert.match(clubGovernanceSql, /create policy "Read messages in accessible club rooms"[\s\S]*?using \(private\.can_access_club_room\(room_id\)\)/i);
  assert.match(clubGovernanceSql, /create policy "Send messages in accessible club rooms"[\s\S]*?sender_id = \(select auth\.uid\(\)\)[\s\S]*?private\.can_access_club_room\(room_id\)/i);
});
