import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const electionSql = await readFile(new URL('../supabase/migrations/20261016160000_koinelio_campus_elections.sql', import.meta.url), 'utf8');
const governanceSql = await readFile(new URL('../supabase/migrations/20261016090000_iit_bhilai_access_and_club_governance.sql', import.meta.url), 'utf8');

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
  assert.match(governanceSql, /Applicants and club managers read interviews/);
  assert.match(governanceSql, /Club managers schedule interviews/);
});
