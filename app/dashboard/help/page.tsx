import Link from 'next/link';
import { ArrowRight, Bell, BookOpen, CalendarDays, CircleHelp, ShieldCheck, Users } from 'lucide-react';

const helpLinks = [
  {
    title: 'Manage your profile',
    description: 'Update your display name, academic details, interests, and profile visibility.',
    href: '/dashboard/profile',
    icon: ShieldCheck,
  },
  {
    title: 'Clubs and memberships',
    description: 'Explore approved clubs, follow the join-request process, and respond to invitations.',
    href: '/dashboard/clubs',
    icon: Users,
  },
  {
    title: 'Events and registrations',
    description: 'Browse published events and manage your own registrations.',
    href: '/dashboard/events',
    icon: CalendarDays,
  },
  {
    title: 'Notifications',
    description: 'Review club, event, and governance updates associated with your account.',
    href: '/dashboard/notifications',
    icon: Bell,
  },
];

const faqs = [
  {
    question: 'Why can’t I access a club room?',
    answer: 'General rooms are available only for approved clubs and eligible confirmed campus-email accounts. Members and Core Team rooms require the matching active membership tier.',
  },
  {
    question: 'Does an institute email mean Koinelio is officially approved?',
    answer: 'No. Email confirmation verifies access to a mailbox, not enrolment or institutional endorsement. Koinelio remains an independent pilot unless the institute formally authorizes it.',
  },
  {
    question: 'What if a page reports a database or configuration error?',
    answer: 'The page may need a database migration or an Auth/Storage setting that has not yet been configured. Do not repeatedly submit sensitive data; record the visible error and report it to the project maintainer through the project repository.',
  },
  {
    question: 'Should I enter my institute or LDAP password?',
    answer: 'Never. Koinelio must use its own Supabase account password and must not collect your institute/LDAP credentials.',
  },
];

export default function HelpPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-8 rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--app-surface-muted)] text-[var(--app-text)]">
            <CircleHelp size={24} />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand-emerald)]">Help centre</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--app-text)] sm:text-3xl">How can we help?</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--app-muted)]">
              Quick guides for using Koinelio’s current campus-pilot features.
            </p>
          </div>
        </div>
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-300/50 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          <ShieldCheck size={18} className="mt-1 shrink-0" />
          <p><strong>Independent pilot:</strong> Koinelio is not an officially endorsed IIT Bhilai service. Never enter institute/LDAP credentials or upload sensitive documents.</p>
        </div>
      </header>

      <section aria-labelledby="help-shortcuts">
        <h2 id="help-shortcuts" className="mb-4 text-lg font-bold text-[var(--app-text)]">Quick links</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {helpLinks.map(({ title, description, href, icon: Icon }) => (
            <Link key={href} href={href} className="group flex gap-4 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-purple)]">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--app-surface-muted)] text-[var(--app-text)]"><Icon size={19} /></span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2 font-semibold text-[var(--app-text)]">{title}<ArrowRight size={16} className="shrink-0 transition-transform group-hover:translate-x-0.5" /></span>
                <span className="mt-1 block text-sm leading-6 text-[var(--app-muted)]">{description}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="help-faq" className="mt-10">
        <h2 id="help-faq" className="mb-4 text-lg font-bold text-[var(--app-text)]">Frequently asked questions</h2>
        <div className="divide-y divide-[var(--app-border)] overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)]">
          {faqs.map((faq) => (
            <details key={faq.question} className="group p-5">
              <summary className="cursor-pointer list-none font-semibold text-[var(--app-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-purple)]">
                <span className="flex items-center justify-between gap-4">{faq.question}<span aria-hidden="true" className="text-xl text-[var(--app-muted)] transition-transform group-open:rotate-45">+</span></span>
              </summary>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--app-muted)]">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <p className="mt-6 flex items-start gap-2 text-xs leading-5 text-[var(--app-muted)]">
        <BookOpen size={15} className="mt-0.5 shrink-0" />
        For technical issues, share only the visible error message and affected page in the project’s GitHub issue tracker. Do not post passwords, access tokens, private email contents, or personal records.
      </p>
    </main>
  );
}
