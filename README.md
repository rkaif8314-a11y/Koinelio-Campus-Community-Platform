# Koinelio

**One campus. Every connection.**

Koinelio is a campus-community web app prototype for exploring how students, clubs, faculty, administrators, and alumni might connect in one place. This repository contains a frontend demo, not a production service.

> **Demo notice:** The people, institutions, clubs, events, posts, and account details shown in the interface are fictional sample data. The prototype is not affiliated with or endorsed by any university. Do not use real personal information in the demo.

## What is included

- Public landing page and demo sign-in/sign-up flows
- Role-oriented dashboards for students, faculty, alumni, club leaders, and administrators
- Club discovery and membership-request flows
- Event discovery and simulated registration
- Campus feed with demo post interactions
- Profiles, privacy settings, notifications, and moderation screens
- Local demo state saved in the browser

Some screens are intentionally demonstrations. Authentication, institutional verification, messaging, moderation enforcement, and persistence are **not production implementations**.

## Stack

- Next.js App Router
- React and TypeScript
- Tailwind CSS v4
- Lucide React icons
- React Context and browser local storage for demo state
- pnpm for package management

## Run locally

Requirements: a current Node.js LTS release and pnpm.

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Useful checks:

```bash
pnpm lint
pnpm build
```

## Project structure

```text
app/          routes and page layouts
components/   shared UI components
lib/          context and fictional demo data
public/       static assets
```

## Before using real campus data

A production deployment would need server-side authentication, access control, database-backed persistence, privacy and retention policies, abuse reporting and moderation workflows, and security review. Obtain authorization before using any institution's name, logo, official events, or real member information.
