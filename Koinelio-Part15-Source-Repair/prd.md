# Koinelio Product Requirements Document (PRD)

> Product definition for the current campus pilot. Updated: 7 November 2026. Requirements describe intended product behavior; they do not claim that staging or production validation is complete.

## 1. Product summary

**Koinelio** is a campus community platform intended to bring student identities, campus conversations, clubs, events, alumni connections, and student opportunities into one coherent place.

Working tagline: **One campus. Every connection.**

Current pilot context is IIT Bhilai. Koinelio is an independent project and must not be presented as an official institute platform without written authorization.

## 2. Problem statement

Campus information and community activity can be fragmented across messaging groups, informal social channels, club pages, event notices, alumni networks, and personal contacts. Students may struggle to discover relevant communities and events, understand how to join, find peers with shared interests, or follow opportunities. Club leaders need clear membership and communication workflows; campus moderators need controlled reporting and review tools.

Koinelio aims to make those interactions easier to discover and govern without replacing the institute's official systems.

## 3. Goals

1. Give confirmed campus-email users a coherent campus identity/profile.
2. Make campus posts, projects, questions, achievements and opportunities discoverable.
3. Provide a structured way to discover clubs, request membership, receive invitations and understand roles.
4. Give approved clubs distinct communication spaces with role-based access.
5. Help users discover published events and manage registrations.
6. Support alumni discovery and profile-based connections.
7. Provide recruitment, elections, reporting and moderation workflows with clear authorization boundaries.
8. Preserve privacy and make database enforcement authoritative.

## 4. Non-goals and boundaries

- Koinelio is not an official IIT Bhilai information system, student information system, LMS, ERP, attendance portal or LDAP replacement.
- Do not collect institute/LDAP passwords.
- A confirmed institute-domain email is not proof of current enrolment, affiliation, or formal endorsement.
- No public launch or institute-wide rollout is implied by a successful local build.
- No payment processing, job-board guarantees, placement guarantees, or official academic-record verification are in the current stated scope.
- Do not fabricate campus content, activity, user counts, club approval, testimonials or institutional endorsements.
- The current pilot is institution-scoped; a fully generalized multi-institution platform requires a separate product/security design.

## 5. Users and roles

### Student / campus account

Can create an account through the confirmed campus-email flow, manage permitted profile fields, browse visible posts/clubs/events, create allowed posts, request club membership, participate in accessible rooms, register for events, and use other features permitted by RLS.

### Alumni directory participant

Can opt into the alumni-facing directory category where eligible and share profile information according to privacy settings. Directory category is not a trusted campus permission role.

### Club Coordinator / Core Member

Receives only database-approved club-scoped permissions. Coordinators manage membership and club workflows; Core Members have the room/workspace permissions defined by policy. Neither UI state nor self-edited metadata can grant these privileges.

### Campus leadership / institutional administrator

Trusted institution roles such as administrator, president, General Secretaries, and moderator are assigned through protected workflows. Role-specific approvals and administrative actions are enforced by database functions/RLS.

### Moderator

Can view and resolve reports within the role boundary. Report decisions must use validated RPCs.

## 6. Functional requirements

### 6.1 Authentication and identity

- Sign up with `@iitbhilai.ac.in` email only.
- Require email confirmation before sign-in/use.
- Provide sign-in, email callback, forgot-password and reset-password flows.
- Public sign-up cannot assign privileged roles.
- Missing profile or failed profile trigger must result in an explicit recoverable state, not a blank dashboard.

### 6.2 Profiles and directory

- Users can edit permitted personal, academic, skills, interests and visibility fields.
- Users can upload supported avatars within the configured limit.
- People search/directory respects profile privacy and campus visibility.
- Alumni directory category remains separate from trusted role/authorization fields.

### 6.3 Campus feed

- Create supported post types: discussion, question, project, achievement, opportunity, and privileged announcement.
- Support text and approved image/GIF/video media.
- Support likes, comments, saves, reporting, and moderation states where implemented.
- Visibility rules (public/campus/club) and moderation status are enforced by database policy.
- Only authorized roles can create official announcements.

### 6.4 Media and storage

- Profile avatars use `profile-avatars`.
- Campus post media uses private `campus-post-media` and object paths in `posts.media_url`.
- File type, size, owner-path, verified-account and parent-post visibility rules must remain consistent between UI and Storage policies.
- Signed URL creation must respect RLS and must not turn the private bucket public.

### 6.5 Discovery

- Search and filters should expose relevant profiles, clubs and published events.
- Results must use actual permitted database records; no fake search results in live mode.
- Empty/loading/error states must be clear.

### 6.6 Clubs and governance

- Club proposals begin pending until authorized review.
- Membership requests are reviewed by permitted club/institution roles.
- Invitations must be accepted by the intended user; an invitation alone does not activate membership.
- Core Member promotion is a separate approved action.
- Governance requests must be handled by the required trusted institution/council role.

### 6.7 Rooms and messaging

- Approved clubs have General, Members, and Core Team room categories.
- General access is limited to confirmed campus accounts for the approved club.
- Members access is limited to active members, Core Members and coordinator.
- Core Team access is limited to active Core Members and coordinator.
- Message reads/writes must satisfy database policies, not just UI filters.

### 6.8 Events and notifications

- Users discover published events and see accurate event details.
- Users can register/cancel according to event status and their registration state. Production acceptance additionally requires database-side atomic enforcement of capacity and start-time closure; client-only checks do not satisfy this requirement.
- Organizers manage event data through role-authorized paths.
- Notifications reflect workflow updates and support read/unread behavior.
- Event detail reads the persisted Supabase event and the signed-in user's own registration. The former demo-context mismatch has been removed; end-to-end staging verification remains required.

### 6.9 Recruitment

- Clubs can publish/close recruitment drives through authorized paths.
- Applicants submit one application per drive with configured answers.
- Applicants and club managers have different read permissions.
- Review statuses and interview scheduling are role/participant-bound.

### 6.10 Elections

- Authorized campus roles create and manage election windows.
- Nominations and voting are time-window constrained.
- One person can vote once; candidates cannot vote in their own election if the database function says so.
- Voter participation tracking is separate from anonymous ballots.
- Only published results can be read through the intended results RPC.

### 6.11 Reporting and moderation

- Confirmed campus users can report visible posts for valid reasons.
- A user cannot report their own post or repeatedly report the same post.
- Only authorized moderators/administrators resolve reports.
- Use the database RPCs; no direct client-side privileged moderation update.

## 7. Non-functional requirements

- Security: RLS-first data access, least-privilege RPC grants, strict separation of public and private Storage.
- Privacy: visibility controls respected; no collection of institute credentials; directory opt-in respected.
- Accessibility: WCAG 2.2 AA target for contrast, focus, labels, touch targets, keyboard interactions and dynamic status.
- Responsive: usable mobile, tablet and desktop layouts.
- Reliability: actionable loading/error/empty states; no blank screens on auth/data failures.
- Maintainability: shared tokens/components; strict TypeScript; small, reviewable changes.
- Performance: sensible query limits, avoid unnecessary re-fetches, use optimized image strategy where suitable.
- Auditability: database role changes and moderation/election decisions are enforced at trusted database boundaries.

## 8. Core success/acceptance scenarios

- A confirmed campus-email account can sign in and reaches a valid profile-backed dashboard; if profile creation is missing, a recoverable setup/error route appears.
- A user can update their own allowed profile fields but cannot change protected role/tenant/verification fields.
- Private media is not accessible to users who cannot view its parent post.
- A normal student cannot publish an official announcement or perform moderator/administrator actions.
- A membership invitation does not activate membership until the invitee accepts.
- A normal member cannot access Members/Core Team rooms outside their membership role.
- Event listing/detail/registration uses consistent live records and database permissions.
- A user can submit one report for another visible post; only an authorized moderator/admin can resolve it.
- A voter cannot vote twice and the published result reveals tallies, not voter-to-candidate mapping.

## 9. Current release status

The repository contains UI and database implementation for the listed product areas. The README explicitly states that production hardening is incomplete: migrations have not been validated on staging/applied to live Supabase; RLS/Storage and multi-account workflows require staging verification; and written institutional authorization is required before describing Koinelio as official.

A successful local build is necessary but not sufficient for production release.
