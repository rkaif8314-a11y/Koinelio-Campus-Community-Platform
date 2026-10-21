# IIT Bhilai demo research and content provenance

**Reviewed:** 16 October 2026  
**Purpose:** Populate the Koinelio interactive demonstration with publicly available institute information while keeping fictional demo interactions separate from facts.  
**Important:** Koinelio is an independent, unofficial student-built prototype. IIT Bhilai has not approved, adopted, or endorsed this software. Do not use institute logos, staff/student identities, institutional email addresses, or wording that implies sponsorship without permission.

## Data labels

- **Public-source fact:** A statement paraphrased from a listed public source. The source link appears next to the item in the app.
- **Historical information:** Content from a prior-year brochure or report. The year is shown, and current activity should be reconfirmed.
- **Demo scenario:** Fictional student profiles, posts, club counts, event dates, registrations, comments, likes, and sample interactions used solely to demonstrate product flows. They are not IIT Bhilai announcements or actual members.
- **To verify before rollout:** Current club rosters, leaders, coordinators, room locations, event dates, eligibility, schedules, placement statistics, contact points, and any policy/benefit criteria.

## Public-source inventory

| Topic | Source | Use in demo |
|---|---|---|
| Institute overview, establishment and location | [About IIT Bhilai](https://www.iitbhilai.ac.in/index.php?pid=admin_aboutiitbh) | Overview, institute location |
| Departments | [Academic departments](https://www.iitbhilai.ac.in/?pid=nav_department) | Department list, separate discipline/centre labels |
| Degree programmes | [Academics](https://www.iitbhilai.ac.in/index.php?pid=nav_academic) | B.Tech, M.Tech, M.Sc and Ph.D. programme categories |
| Academic dates | [Academic Calendar](https://www.iitbhilai.ac.in/index.php?pid=aca_calendar) | Link to official term, registration and exam dates; do not copy dates without checking the target session |
| Student life / CoSA | [Students](https://www.iitbhilai.ac.in/index.php?pid=students) | Student affairs background and campus-life links |
| Campus infrastructure | [Our Campus](https://www.iitbhilai.ac.in/index.php?pid=aca_ourcampus) | Campus zones, library/data centre, Central Instrumentation Facility and Central Prototyping Facility |
| Laboratory, IT, health, hostels and sport facilities | [Institute Facilities](https://www.iitbhilai.ac.in/index.php?pid=institute_facility) | Public summary of facilities; specific availability must be checked with the institute |
| Cultural clubs/societies | [Cultural Council](https://culturals.iitbhilai.ac.in/) | Public names of DesignX, Drishya, Quizzotica, TPS, Swara, Beathackers, Renaissance, FPS and GOALS |
| Sci-Tech/cultural public brochure | [Student brochure 2025–26](https://polaris.iitbhilai.ac.in/public/pdfs/Brochure_25-26.pdf) | Public descriptions/names including Ingenuity, DSAI Club and BIB; treat as academic-year-specific |
| Open source/robotics historic listing | [Student brochure 2024–25](https://polaris.iitbhilai.ac.in/public/pdfs/Brochure_24-25.pdf) | OpenLake and Epsilon are labelled historical and require confirmation before implying they are currently active |
| Student council and recurring events | [Polaris / CoSA](https://polaris.iitbhilai.ac.in/views/cosa.php) | Public overview of Anveshan, Prayatna, Ciao and Cultscape; no next dates inferred |
| Student sports and wellbeing | [Sports and Yoga](https://sportsandyoga.iitbhilai.ac.in/) | Officially linked sports/wellbeing resource |
| Scholarship categories | [Institute Scholarships](https://www.iitbhilai.ac.in/index.php?pid=institute_awards), [Donor awards](https://www.iitbhilai.ac.in/index.php?pid=donor_award) | Link students to current eligibility rules, not hardcoded promises |
| Historical placements | [Placement report 2024–25](https://www.iitbhilai.ac.in/index.php?pid=PlacementReport2024_2025) | Historical report snapshot only; do not describe as 2025–26 or 2026–27 data |
| 2026 convocation | [Official event page](https://www.iitbhilai.ac.in/index.php?pid=convocation), [programme schedule](https://www.iitbhilai.ac.in/index.php?pid=convocation_schedule) | Publicly listed for 24 October 2026; users should check official timing/access changes |
| Campus stories | [Sampark, August 2026](https://sac.iitbhilai.ac.in/Files/Sampark_Aug%2726.html) | Recent student-affairs/campus context |

## Implementation notes

- Structured public-source records live in `lib/institution-config.ts`, so another institutional demo can later use the same layout with its own verified configuration.
- The campus guide is a read-only source summary at this stage; its links go to the public source pages.
- Existing dashboard interactions are demo/local state. Signing in or joining an event in the demo does **not** communicate with IIT Bhilai or create an official registration.
- The current production database is not yet the source of truth for every dashboard screen. Do not call the prototype a live IIT Bhilai service.
- Future multi-institution content editing should require an approved institution record, verified institution admin, role-scoped access, audit history, and a publication/review state. Each institution should only be able to edit its own content.
- Before any public launch or institutional pilot, contact the institute through official channels, ask permission, confirm current club rosters/events, and have the institution review its branded content.
