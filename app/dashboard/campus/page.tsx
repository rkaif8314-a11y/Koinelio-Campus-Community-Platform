import Link from 'next/link';
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  FlaskConical,
  GraduationCap,
  HeartPulse,
  MapPin,
  ShieldAlert,
  Sparkles,
  Trophy,
  Users,
  Wifi,
} from 'lucide-react';
import {
  CAMPUS_FACILITIES,
  INSTITUTE_DEPARTMENTS,
  INSTITUTE_DISCIPLINES_AND_CENTRES,
  INSTITUTE_PLACEMENT_SNAPSHOT,
  INSTITUTE_PROGRAMMES,
  INSTITUTE_SCHOLARSHIP_CATEGORIES,
  INSTITUTIONAL_SOURCES,
  INSTITUTION_PROFILE,
  OFFICIAL_UPCOMING_EVENTS,
  PUBLIC_STUDENT_COMMUNITIES,
  RECURRING_CAMPUS_EVENTS,
} from '@/lib/institution-config';

function ExternalLinkLabel({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-sm font-semibold text-[#5146E5] hover:text-[#3730A3] hover:underline"
    >
      {children}
      <ExternalLink size={13} aria-hidden="true" />
    </a>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5 max-w-3xl">
      <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#5146E5]">{eyebrow}</p>
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#182230]">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[#667085]">{description}</p>
    </div>
  );
}

export default function CampusGuidePage() {
  const academicSources = INSTITUTIONAL_SOURCES.filter((source) =>
    ['Academics'].includes(source.category)
  );
  const studentSources = INSTITUTIONAL_SOURCES.filter((source) =>
    ['Clubs and societies', 'Student life'].includes(source.category)
  );
  const supportSources = INSTITUTIONAL_SOURCES.filter((source) =>
    ['Student support', 'Careers', 'Reports'].includes(source.category)
  );

  return (
    <div className="mx-auto max-w-7xl space-y-9 px-4 py-6 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#191B4D] via-[#3430A3] to-[#0F766E] p-6 text-white shadow-lg sm:p-9">
        <div className="absolute -right-12 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div className="relative">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold">
            <Sparkles size={14} aria-hidden="true" />
            Public-source campus guide
          </div>
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">{INSTITUTION_PROFILE.shortName} Campus Guide</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/85 sm:text-base">
            {INSTITUTION_PROFILE.overview}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-white/85">
            <span className="inline-flex items-center gap-2"><MapPin size={15} />{INSTITUTION_PROFILE.location}</span>
            <span className="inline-flex items-center gap-2"><CheckCircle2 size={15} />Research checked {INSTITUTION_PROFILE.verifiedAsOf}</span>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={INSTITUTION_PROFILE.officialWebsite} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#191B4D] hover:bg-indigo-50">
              Official IIT Bhilai website <ArrowUpRight size={16} />
            </a>
            <Link href="/dashboard/discover" className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15">
              Explore the interactive demo <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-amber-300 bg-amber-50 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <ShieldAlert size={22} className="mt-0.5 shrink-0 text-amber-800" aria-hidden="true" />
          <div>
            <h2 className="font-bold text-amber-950">Important: unofficial demo workspace</h2>
            <p className="mt-1 text-sm leading-6 text-amber-900">{INSTITUTION_PROFILE.demoDisclaimer}</p>
            <p className="mt-2 text-xs leading-5 text-amber-800">
              Koinelio demo interactions stay within the prototype. They do not register you for official events, contact the institute, or represent an institutional announcement.
            </p>
          </div>
        </div>
      </section>

      <section>
        <SectionHeading
          eyebrow="Academics"
          title="Departments and programmes"
          description="This section summarises the publicly listed academic structure. Always consult the institute website for programme-specific eligibility, curriculum, admissions, and current changes."
        />
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF0FD] text-[#5146E5]"><BookOpen size={20} /></div>
              <div><h3 className="font-bold text-[#182230]">Academic departments</h3><p className="text-xs text-[#667085]">{INSTITUTE_DEPARTMENTS.length} department entries</p></div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {INSTITUTE_DEPARTMENTS.map((department) => (
                <div key={department} className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-2.5 text-sm font-medium leading-5 text-[#344054]">{department}</div>
              ))}
            </div>
            <div className="mt-3 space-y-2">
              {INSTITUTE_DISCIPLINES_AND_CENTRES.map((item) => (
                <div key={item.name} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#F7F8FC] px-3 py-2.5">
                  <div><span className="mr-2 rounded-full bg-[#E6F6F4] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#0F766E]">{item.type}</span><span className="text-sm font-semibold text-[#182230]">{item.name}</span></div>
                  <ExternalLinkLabel href={item.sourceUrl}>Source</ExternalLinkLabel>
                </div>
              ))}
            </div>
            <div className="mt-4"><ExternalLinkLabel href="https://www.iitbhilai.ac.in/?pid=nav_department">Verify department list</ExternalLinkLabel></div>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F6F4] text-[#0F766E]"><GraduationCap size={21} /></div>
              <div><h3 className="font-bold text-[#182230]">Degree programmes</h3><p className="text-xs text-[#667085]">Grouped from public academic listings</p></div>
            </div>
            <div className="space-y-3">
              {INSTITUTE_PROGRAMMES.map((group) => (
                <div key={group.level} className="rounded-xl border border-[#E5E7EB] p-3">
                  <div className="mb-2 flex items-center justify-between"><h4 className="text-sm font-bold text-[#182230]">{group.level}</h4><span className="rounded-full bg-[#EEF0FD] px-2 py-0.5 text-xs font-bold text-[#5146E5]">{group.programmes.length}</span></div>
                  <div className="flex flex-wrap gap-1.5">
                    {group.programmes.map((programme) => <span key={programme} className="rounded-lg bg-[#F8FAFC] px-2.5 py-1.5 text-xs leading-4 text-[#475467]">{programme}</span>)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4"><ExternalLinkLabel href="https://www.iitbhilai.ac.in/index.php?pid=nav_academic">Verify programmes</ExternalLinkLabel></div>
          </div>
        </div>
      </section>

      <section>
        <SectionHeading
          eyebrow="Student life"
          title="Published clubs and communities"
          description="Club names and descriptions below come from public Cultural Council pages and institute student brochures. Listings and leadership can change; older brochure entries are explicitly marked for re-confirmation."
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {PUBLIC_STUDENT_COMMUNITIES.map((club, index) => (
            <article key={club.name} className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start gap-3">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${index % 3 === 0 ? 'bg-[#EEF0FD] text-[#5146E5]' : index % 3 === 1 ? 'bg-[#E6F6F4] text-[#0F766E]' : 'bg-[#FEF3C7] text-[#B7791F]'}`}>
                  {club.category === 'Cultural' || club.category === 'Cultural society' ? <Sparkles size={20} /> : <Users size={20} />}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#667085]">{club.category}</span>
                  <h3 className="mt-1 font-bold leading-5 text-[#182230]">{club.name}</h3>
                </div>
              </div>
              <p className="mt-3 min-h-[4.5rem] text-sm leading-6 text-[#667085]">{club.description}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#E5E7EB] pt-3">
                <span className="text-[11px] text-[#667085]">{club.sourceYear}</span>
                <ExternalLinkLabel href={club.sourceUrl}>Public source</ExternalLinkLabel>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <SectionHeading
          eyebrow="Campus facilities"
          title="Spaces for learning, research and wellbeing"
          description="These are concise summaries of facilities described in official campus pages. Opening hours, capacity, access rules and availability are not inferred here."
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {CAMPUS_FACILITIES.map((facility, index) => {
            const Icon = index === 0 ? BookOpen : index === 1 || index === 2 || index === 3 ? FlaskConical : index === 4 ? Wifi : index === 5 ? HeartPulse : index === 6 ? Trophy : BuildingIcon;
            return (
              <article key={facility.name} className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${index % 2 === 0 ? 'bg-[#EEF0FD] text-[#5146E5]' : 'bg-[#E6F6F4] text-[#0F766E]'}`}><Icon size={20} /></div>
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#667085]">{facility.category}</span>
                <h3 className="mt-1 font-bold leading-5 text-[#182230]">{facility.name}</h3>
                <p className="mt-2 text-sm leading-6 text-[#667085]">{facility.description}</p>
                <div className="mt-3"><ExternalLinkLabel href={facility.sourceUrl}>Official details</ExternalLinkLabel></div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <SectionHeading
            eyebrow="Calendar"
            title="Official listing and recurring activities"
            description="Only the convocation below has a specific future date confirmed in an official listing at the time of this research. Recurring student events are shown without invented dates."
          />
          {OFFICIAL_UPCOMING_EVENTS.map((event) => (
            <article key={event.title} className="rounded-2xl border border-[#C7D2FE] bg-gradient-to-br from-white to-[#F5F3FF] p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-[#5146E5] text-white">
                  <span className="text-[10px] font-bold uppercase">Oct</span><span className="text-xl font-bold leading-5">24</span>
                </div>
                <div className="min-w-0">
                  <span className="rounded-full bg-[#E6F6F4] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#0F766E]">Official public listing</span>
                  <h3 className="mt-2 text-lg font-bold text-[#182230]">{event.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[#667085]">{event.description}</p>
                  <p className="mt-2 flex items-start gap-2 text-sm font-semibold text-[#344054]"><MapPin size={15} className="mt-0.5 shrink-0" />{event.venue}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-4 border-t border-[#E5E7EB] pt-3">
                <ExternalLinkLabel href={event.sourceUrl}>Official event details</ExternalLinkLabel>
                <ExternalLinkLabel href={event.scheduleUrl}>Programme schedule</ExternalLinkLabel>
              </div>
              <p className="mt-3 text-xs leading-5 text-[#667085]">{event.status}</p>
            </article>
          ))}
          <h3 className="mb-3 mt-5 font-bold text-[#182230]">Recurring campus activities</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {RECURRING_CAMPUS_EVENTS.map((event) => (
              <article key={event.name} className="rounded-xl border border-[#E5E7EB] bg-white p-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#5146E5]">{event.category}</span>
                <h4 className="mt-1 font-bold text-[#182230]">{event.name}</h4>
                <p className="mt-1 text-xs leading-5 text-[#667085]">{event.description}</p>
                <div className="mt-2"><ExternalLinkLabel href={event.sourceUrl}>Public listing</ExternalLinkLabel></div>
              </article>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FEF3C7] text-[#B7791F]"><Trophy size={20} /></div>
              <div><h3 className="font-bold text-[#182230]">Placement snapshot</h3><p className="text-xs text-[#667085]">Published report · {INSTITUTE_PLACEMENT_SNAPSHOT.reportYear}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Placed', String(INSTITUTE_PLACEMENT_SNAPSHOT.totalPlaced)],
                ['Registered', String(INSTITUTE_PLACEMENT_SNAPSHOT.registeredStudents)],
                ['Placement rate', INSTITUTE_PLACEMENT_SNAPSHOT.placementPercentage],
                ['Offers', String(INSTITUTE_PLACEMENT_SNAPSHOT.totalOffers)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-[#F8FAFC] p-3">
                  <p className="text-xs text-[#667085]">{label}</p><p className="mt-1 text-xl font-bold text-[#182230]">{value}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs leading-5 text-[#667085]">{INSTITUTE_PLACEMENT_SNAPSHOT.note}</p>
            <div className="mt-3"><ExternalLinkLabel href={INSTITUTE_PLACEMENT_SNAPSHOT.sourceUrl}>Read official report</ExternalLinkLabel></div>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F6F4] text-[#0F766E]"><GraduationCap size={20} /></div>
              <div><h3 className="font-bold text-[#182230]">Scholarships and awards</h3><p className="text-xs text-[#667085]">Always check current eligibility</p></div>
            </div>
            <div className="space-y-3">
              {INSTITUTE_SCHOLARSHIP_CATEGORIES.map((item) => (
                <div key={item.name} className="border-b border-[#E5E7EB] pb-3 last:border-0 last:pb-0">
                  <h4 className="text-sm font-semibold text-[#182230]">{item.name}</h4>
                  <p className="mt-0.5 text-xs leading-5 text-[#667085]">{item.audience}</p>
                  <ExternalLinkLabel href={item.sourceUrl}>Eligibility and details</ExternalLinkLabel>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <SectionHeading
          eyebrow="Source directory"
          title="Open the original public pages"
          description="Use these links to verify a fact before you share it. This guide is a convenience layer, not a replacement for official notices."
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {INSTITUTIONAL_SOURCES.map((source) => (
            <a key={source.label} href={source.url} target="_blank" rel="noreferrer" className="group rounded-xl border border-[#E5E7EB] bg-white p-4 transition hover:border-[#C7D2FE] hover:shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div><span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#5146E5]">{source.category}</span><h3 className="mt-1 font-bold text-[#182230] group-hover:text-[#5146E5]">{source.label}</h3></div>
                <ExternalLink size={16} className="mt-1 shrink-0 text-[#667085]" />
              </div>
              <p className="mt-2 text-sm leading-5 text-[#667085]">{source.note}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF0FD] text-[#5146E5]"><CalendarDays size={21} /></div>
          <div>
            <h2 className="font-bold text-[#182230]">How this becomes an institution-managed space</h2>
            <p className="mt-1 text-sm leading-6 text-[#667085]">
              The current guide uses an editable source configuration file so the demo can be corrected without hunting through page components. Before a real pilot, the next step is institution-scoped publishing: verified campus administrators manage their own profile, official links, notices, clubs and events; reviewers can approve changes; and an audit trail records what changed. The current guide itself is read-only and the remaining dashboard activity is demo/local state.
            </p>
            <p className="mt-3 text-xs leading-5 text-[#667085]">Source data file: <code className="rounded bg-[#F1F5F9] px-1.5 py-0.5">lib/institution-config.ts</code> · Research log: <code className="rounded bg-[#F1F5F9] px-1.5 py-0.5">docs/IIT_BHILAI_RESEARCH.md</code></p>
          </div>
        </div>
      </section>
    </div>
  );
}

import { Building2 as BuildingIcon } from 'lucide-react';
