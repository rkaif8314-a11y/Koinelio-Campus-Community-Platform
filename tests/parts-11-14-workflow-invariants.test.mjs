import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const [eventSql, clubSql, eventDetail, eventList, messagesPage, recruitmentPage, electionsPage, moderationPage] = await Promise.all([
  readFile(new URL('supabase/migrations/20261015184841_koinelio_secure_rls_and_auth_profiles.sql', root), 'utf8'),
  readFile(new URL('supabase/migrations/20261016090000_iit_bhilai_access_and_club_governance.sql', root), 'utf8'),
  readFile(new URL('app/dashboard/events/[id]/page.tsx', root), 'utf8'),
  readFile(new URL('app/dashboard/events/page.tsx', root), 'utf8'),
  readFile(new URL('app/dashboard/messages/page.tsx', root), 'utf8'),
  readFile(new URL('app/dashboard/recruitment/page.tsx', root), 'utf8'),
  readFile(new URL('app/dashboard/elections/page.tsx', root), 'utf8'),
  readFile(new URL('app/dashboard/moderation/page.tsx', root), 'utf8'),
]);

function policy(sql, name) {
  const start = sql.indexOf(`create policy "${name}"`);
  assert.notEqual(start, -1, `Expected policy ${name}`);
  const end = sql.indexOf(';', start);
  assert.notEqual(end, -1, `Expected policy ${name} to terminate`);
  return sql.slice(start, end + 1);
}

test('event detail reads a persisted Supabase event and never falls back to demo records', () => {
  assert.match(eventDetail, /\.from\('events'\)/);
  assert.match(eventDetail, /\.eq\('id', eventId\)/);
  assert.doesNotMatch(eventDetail, /lib\/demo-data|useApp\(|getEventById/);
  assert.match(eventDetail, /\.from\('event_registrations'\)/);
});

test('event registration UI scopes inserts and cancellations to the authenticated user', () => {
  assert.match(eventDetail, /setUserId\(authData\.user\.id\)/);
  assert.match(eventDetail, /user_id: userId/);
  assert.match(eventDetail, /\.eq\('event_id', event\.id\)[\s\S]*?\.eq\('user_id', userId\)/);
  assert.match(eventDetail, /status: 'registered'/);
  assert.match(eventDetail, /event\.status === 'published'/);
});

test('event reads are tenant-scoped and hidden club events require an approved club', () => {
  const readPolicy = policy(eventSql, 'Read published events in scope or own drafts');
  assert.match(readPolicy, /created_by = \(select auth\.uid\(\)\)/);
  assert.match(readPolicy, /status = 'published'/);
  assert.match(readPolicy, /institution_id = \(select public\.current_user_institution_id\(\)\)/);
  assert.match(readPolicy, /approval_status = 'approved'/);
});

test('event registrations can only be inserted by the current user for published events', () => {
  const insertPolicy = policy(eventSql, 'Register yourself for published events');
  assert.match(insertPolicy, /user_id = \(select auth\.uid\(\)\)/);
  assert.match(insertPolicy, /status = 'registered'/);
  assert.match(insertPolicy, /e\.status = 'published'/);
  const deletePolicy = policy(eventSql, 'Unregister yourself or organizer removes registration');
  assert.match(deletePolicy, /user_id = \(select auth\.uid\(\)\)/);
});

test('event publishing remains restricted by the database trigger', () => {
  assert.match(clubSql, /create or replace function public\.guard_event_publication\([\s\S]*?private\.can_manage_club\(new\.club_id\)/);
  assert.match(clubSql, /private\.has_institution_role\([\s\S]*?array\['institution_admin', 'president', 'technical_gs', 'cultural_gs'\]/);
  assert.match(clubSql, /create trigger events_guard_publication/);
});

test('club messaging enforces bounded message content and room-scoped read/write RLS', () => {
  assert.match(clubSql, /char_length\(btrim\(content\)\) between 1 and 5000/);
  const readPolicy = policy(clubSql, 'Read messages in accessible club rooms');
  const sendPolicy = policy(clubSql, 'Send messages in accessible club rooms');
  assert.match(readPolicy, /private\.can_access_club_room\(room_id\)/);
  assert.match(sendPolicy, /sender_id = \(select auth\.uid\(\)\)/);
  assert.match(sendPolicy, /private\.can_access_club_room\(room_id\)/);
  assert.match(messagesPage, /maxLength=\{5000\}/);
});

test('recruitment applications and interviews remain restricted to applicants and club managers', () => {
  const applyPolicy = policy(eventSql, 'Apply to open recruitment drives');
  const reviewPolicy = policy(eventSql, 'Applicants and club managers read applications');
  const interviewReadPolicy = policy(eventSql, 'Applicants and organizers read interviews');
  const interviewInsertPolicy = policy(eventSql, 'Club managers schedule interviews');
  assert.match(applyPolicy, /applicant_id = \(select auth\.uid\(\)\)/);
  assert.match(applyPolicy, /d\.status = 'open'/);
  assert.match(applyPolicy, /c\.approval_status = 'approved'/);
  assert.match(reviewPolicy, /applicant_id = \(select auth\.uid\(\)\)/);
  assert.match(interviewReadPolicy, /a\.applicant_id = \(select auth\.uid\(\)\)/);
  assert.match(interviewInsertPolicy, /created_by = \(select auth\.uid\(\)\)/);
  assert.match(interviewInsertPolicy, /public\.can_manage_club\(d\.club_id\)/);
  assert.match(recruitmentPage, /Enter a valid HTTPS meeting link/);
  assert.match(recruitmentPage, /Choose a future interview date and time/);
});

test('recruitment UI exposes management controls only for database-recognized manager roles', () => {
  assert.match(recruitmentPage, /supabase\.rpc\('is_platform_admin'\)/);
  assert.match(recruitmentPage, /role === 'club_coordinator'/);
  assert.match(recruitmentPage, /role === 'institution_admin'/);
  assert.match(recruitmentPage, /role === 'president'/);
});

test('election creation validates the four windows before calling the database RPC', () => {
  assert.match(electionsPage, /windowTimes\[0\] < windowTimes\[1\] && windowTimes\[1\] <= windowTimes\[2\] && windowTimes\[2\] < windowTimes\[3\]/);
  assert.match(electionsPage, /supabase\.rpc\('create_campus_election'/);
  assert.match(electionsPage, /supabase\.rpc\('cast_campus_election_vote'/);
});

test('moderation decisions use the restricted resolution RPC and a labelled confirmation dialog', () => {
  assert.match(moderationPage, /supabase\.rpc\('resolve_post_report'/);
  assert.match(moderationPage, /role="dialog" aria-modal="true"/);
  assert.match(moderationPage, /aria-labelledby="resolution-title"/);
  assert.doesNotMatch(moderationPage, /\.from\('posts'\)\s*\.update/);
});

test('event registration history cannot be reinserted or deleted through attendee controls after attendance or organizer closure', () => {
  assert.match(eventDetail, /const canRegister = event\?\.status === 'published' && !isPast && registration === null/);
  assert.match(eventDetail, /hasAttended \?\s*\(/);
  assert.match(eventDetail, /registration\?\.status === 'no_show'/);
  assert.match(eventDetail, /isRegistered && registration\?\.status === 'registered'/);
  assert.match(eventList, /registrationByEvent = useMemo\(/);
  assert.match(eventList, /registration && registration\.status !== 'registered'/);
  assert.match(eventList, /registration\?\.status === 'attended'/);
  assert.match(eventList, /registration\?\.status === 'cancelled'/);
  assert.match(eventList, /registration\?\.status === 'no_show'/);
});

test('event list prevents new registrations after an event starts and preserves existing attendance states', () => {
  assert.match(eventList, /registrationOpen = event\.status === 'published' && \(eventStart === null \|\| \(Number\.isFinite\(eventStart\) && eventStart > Date\.now\(\)\)\)/);
  assert.match(eventList, /Registration closed/);
  assert.match(eventList, /registration\?\.status === 'attended'/);
  assert.match(eventList, /registration\?\.status === 'no_show'/);
});

test('recruitment hides apply controls after the deadline and rejects credential-bearing or non-HTTPS meeting URLs', () => {
  assert.match(recruitmentPage, /deadlinePassed = Boolean\(drive\.deadline && new Date\(drive\.deadline\)\.getTime\(\) <= Date\.now\(\)\)/);
  assert.match(recruitmentPage, /The application deadline has passed/);
  assert.match(recruitmentPage, /meetingUrl\.protocol !== 'https:'/);
  assert.match(recruitmentPage, /meetingUrl\.username \|\| meetingUrl\.password/);
  assert.match(recruitmentPage, /Enter a valid HTTPS meeting link/);
});

test('destructive dialogs expose an accessible description, initial focus, and Escape dismissal', () => {
  assert.match(moderationPage, /aria-describedby="resolution-description"/);
  assert.match(moderationPage, /<textarea id="resolution-note" autoFocus/);
  assert.match(moderationPage, /event\.key === 'Escape'/);
  assert.match(eventDetail, /aria-describedby="cancel-registration-description"/);
  assert.match(eventDetail, /autoFocus onClick=\{\(\) => setShowCancel\(false\)\}/);
  assert.match(recruitmentPage, /role="dialog" aria-modal="true" aria-labelledby="interview-dialog-title"/);
  assert.match(recruitmentPage, /event\.key === 'Escape'/);
});
