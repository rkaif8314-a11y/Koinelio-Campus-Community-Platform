/**
 * Koinelio institution seed configuration.
 *
 * Public facts are summarized from the official/officially linked sources below.
 * The demo community data (profiles, activity, counts, registrations) is synthetic
 * and must never be presented as official IIT Bhilai content.
 *
 * To prepare another institution demo, edit this configuration and the matching
 * source records in docs/IIT_BHILAI_RESEARCH.md. A future multi-institution release
 * should move this data to institution-managed database records with verified admin roles.
 */
export const INSTITUTION_PROFILE = {
  name: 'Indian Institute of Technology Bhilai',
  shortName: 'IIT Bhilai',
  location: 'Kutelabhata, Bhilai, Chhattisgarh, India',
  established: 2016,
  officialWebsite: 'https://www.iitbhilai.ac.in/',
  overview:
    'IIT Bhilai was established in 2016 by the Ministry of Education and is based at its permanent campus in Kutelabhata, Bhilai, Chhattisgarh.',
  verifiedAsOf: '16 October 2026',
  demoDisclaimer:
    'Koinelio is an independent student-built prototype, not operated, endorsed, or approved by IIT Bhilai. Institutional facts link to public sources. Demo profiles, posts, memberships, counts, registrations, and sample activities are fictional.',
} as const;

export const INSTITUTIONAL_SOURCES = [
  {
    label: 'Official institute website',
    category: 'Institute',
    url: 'https://www.iitbhilai.ac.in/',
    note: 'Primary official source for institute news, announcements, academics, and public notices.',
  },
  {
    label: 'About IIT Bhilai',
    category: 'Institute',
    url: 'https://www.iitbhilai.ac.in/index.php?pid=admin_aboutiitbh',
    note: 'Establishment year, location, and high-level academic offering.',
  },
  {
    label: 'Academic departments',
    category: 'Academics',
    url: 'https://www.iitbhilai.ac.in/?pid=nav_department',
    note: 'Official department, discipline, and centre listings.',
  },
  {
    label: 'Programmes and degrees',
    category: 'Academics',
    url: 'https://www.iitbhilai.ac.in/index.php?pid=nav_academic',
    note: 'Current programme availability by degree type; re-check before publishing updates.',
  },
  {
    label: 'Academic calendar',
    category: 'Academics',
    url: 'https://www.iitbhilai.ac.in/index.php?pid=aca_calendar',
    note: 'Senate-approved semester schedule, registration and examination dates.',
  },
  {
    label: 'Students and campus life',
    category: 'Student life',
    url: 'https://www.iitbhilai.ac.in/index.php?pid=pro_student',
    note: 'Council of Student Affairs (CoSA), student activities, and campus-life resources.',
  },
  {
    label: 'Campus and buildings',
    category: 'Campus',
    url: 'https://www.iitbhilai.ac.in/index.php?pid=aca_ourcampus',
    note: 'Published information about campus zones and facilities.',
  },
  {
    label: 'Institute facilities',
    category: 'Campus',
    url: 'https://www.iitbhilai.ac.in/index.php?pid=institute_facility',
    note: 'Public descriptions of labs, IT infrastructure, health centre, hostels and sports facilities.',
  },
  {
    label: 'Cultural Council',
    category: 'Clubs and societies',
    url: 'https://culturals.iitbhilai.ac.in/',
    note: 'Publicly listed cultural clubs, societies, council information, and event calendar.',
  },
  {
    label: 'Polaris — Council of Student Affairs',
    category: 'Clubs and societies',
    url: 'https://polaris.iitbhilai.ac.in/views/cosa.php',
    note: 'Student council, club activities, and recurring campus events.',
  },
  {
    label: 'Student brochure 2025–26',
    category: 'Clubs and societies',
    url: 'https://polaris.iitbhilai.ac.in/public/pdfs/Brochure_25-26.pdf',
    note: 'Published 2025–26 descriptions of Sci-Tech and Cultural Council clubs/societies.',
  },
  {
    label: 'Sports and Yoga',
    category: 'Student life',
    url: 'https://sportsandyoga.iitbhilai.ac.in/',
    note: 'Officially linked sports and wellness resource.',
  },
  {
    label: 'Institute scholarships and awards',
    category: 'Student support',
    url: 'https://www.iitbhilai.ac.in/index.php?pid=institute_awards',
    note: 'Official eligibility and benefit information; always verify current rules on the source page.',
  },
  {
    label: 'Placement report 2024–25',
    category: 'Careers',
    url: 'https://www.iitbhilai.ac.in/index.php?pid=PlacementReport2024_2025',
    note: 'Historical placement report for the 2024–25 session, not a promise of future outcomes.',
  },
  {
    label: 'Annual reports',
    category: 'Reports',
    url: 'https://www.iitbhilai.ac.in/index.php?pid=annual_report',
    note: 'Official annual reports and audited annual accounts.',
  },
  {
    label: '6th Convocation 2026',
    category: 'Official event',
    url: 'https://www.iitbhilai.ac.in/index.php?pid=convocation',
    note: 'Official listing for 24 October 2026; consult the current official schedule for final timings and instructions.',
  },
  {
    label: 'Convocation programme schedule',
    category: 'Official event',
    url: 'https://www.iitbhilai.ac.in/index.php?pid=convocation_schedule',
    note: 'Official day-by-day programme and venue information for the 2026 convocation.',
  },
  {
    label: 'Sampark — Campus stories, August 2026',
    category: 'News',
    url: "https://sac.iitbhilai.ac.in/Files/Sampark_Aug%2726.html",
    note: 'Public campus stories including student-affairs orientation and campus activities.',
  },
] as const;

export const INSTITUTE_DEPARTMENTS = [
  'Bioscience and Biomedical Engineering',
  'Chemistry',
  'Computer Science and Engineering',
  'Electrical Engineering',
  'Electronics and Communication Engineering',
  'Liberal Arts',
  'Materials Science and Metallurgical Engineering',
  'Mathematics',
  'Mechanical Engineering',
  'Mechatronics',
  'Physics',
] as const;

export const INSTITUTE_DISCIPLINES_AND_CENTRES = [
  {
    name: 'Data Science and Artificial Intelligence',
    type: 'Discipline',
    sourceUrl: 'https://www.iitbhilai.ac.in/?pid=nav_department',
  },
  {
    name: 'Centre for Culture, Language and Traditions',
    type: 'Centre',
    sourceUrl: 'https://www.iitbhilai.ac.in/?pid=nav_department',
  },
] as const;

export const INSTITUTE_PROGRAMMES = [
  {
    level: 'B.Tech',
    programmes: [
      'Computer Science and Engineering',
      'Data Science and Artificial Intelligence',
      'Electrical Engineering',
      'Electronics and Communication Engineering',
      'Mechanical Engineering',
      'Materials Science and Metallurgical Engineering',
      'Mechatronics Engineering',
    ],
  },
  {
    level: 'M.Tech',
    programmes: [
      'Bioengineering',
      'Biomedical Devices',
      'Computer Science and Engineering',
      'Data Science and Artificial Intelligence',
      'Electronics and Communication Engineering',
      'Microelectronics and VLSI',
      'Control and Instrumentation',
      'Electric Vehicle Technology',
      'Power Systems and Power Electronics',
      'Materials Science and Metallurgical Engineering',
      'Design and Manufacturing',
      'Thermal and Fluids Engineering',
      'Mechatronics Engineering',
    ],
  },
  {
    level: 'M.Sc',
    programmes: ['Physics', 'Chemistry', 'Mathematics and Computing'],
  },
  {
    level: 'Ph.D.',
    programmes: ['Doctoral research across institute departments and eligible disciplines'],
  },
] as const;

export const CAMPUS_FACILITIES = [
  {
    name: 'Central Library and Data Centre',
    description: 'A core academic resource listed in the institute’s campus information.',
    category: 'Learning',
    sourceUrl: 'https://www.iitbhilai.ac.in/index.php?pid=aca_ourcampus',
  },
  {
    name: 'Central Instrumentation Facility',
    description: 'A shared facility listed in the academic-zone infrastructure.',
    category: 'Research',
    sourceUrl: 'https://www.iitbhilai.ac.in/index.php?pid=aca_ourcampus',
  },
  {
    name: 'Central Prototyping Facility',
    description: 'Hands-on prototyping and making infrastructure for practical work.',
    category: 'Making',
    sourceUrl: 'https://www.iitbhilai.ac.in/index.php?pid=aca_ourcampus',
  },
  {
    name: 'Laboratories and DIY Lab',
    description: 'The institute describes teaching and practical facilities including an electrical lab, FPGA lab, physics lab and DIY lab.',
    category: 'Learning',
    sourceUrl: 'https://www.iitbhilai.ac.in/index.php?pid=institute_facility',
  },
  {
    name: 'IT Infrastructure Services (ITIS / Nucleus)',
    description: 'Campus network and IT services supporting academic, administrative and research work.',
    category: 'Digital',
    sourceUrl: 'https://www.iitbhilai.ac.in/index.php?pid=institute_facility',
  },
  {
    name: 'Health Centre',
    description: 'The institute lists an on-campus health centre and emergency support arrangements.',
    category: 'Wellbeing',
    sourceUrl: 'https://www.iitbhilai.ac.in/index.php?pid=institute_facility',
  },
  {
    name: 'Sports and fitness',
    description: 'The official facilities page lists grounds/courts for outdoor games, indoor games in hostels and a gymnasium.',
    category: 'Wellbeing',
    sourceUrl: 'https://www.iitbhilai.ac.in/index.php?pid=institute_facility',
  },
  {
    name: 'Halls of residence',
    description: 'Hostel names, availability and facilities change; consult the current official student/hostel information.',
    category: 'Residential',
    sourceUrl: 'https://www.iitbhilai.ac.in/index.php?pid=pro_student',
  },
] as const;

export const PUBLIC_STUDENT_COMMUNITIES = [
  {
    name: 'Ingenuity — Competitive Programming Club',
    category: 'Sci-Tech',
    description: 'A coding and problem-solving community described in the 2025–26 student brochure.',
    sourceUrl: 'https://polaris.iitbhilai.ac.in/public/pdfs/Brochure_25-26.pdf',
    sourceYear: '2025–26',
  },
  {
    name: 'DSAI Club — Data Science and Artificial Intelligence',
    category: 'Sci-Tech',
    description: 'A student community around data science, AI/ML, hands-on projects and peer learning.',
    sourceUrl: 'https://polaris.iitbhilai.ac.in/public/pdfs/Brochure_25-26.pdf',
    sourceYear: '2025–26',
  },
  {
    name: 'BIB — Blockchain Innovation Base',
    category: 'Sci-Tech',
    description: 'A student community exploring blockchain/Web3 and decentralised technology through projects and workshops.',
    sourceUrl: 'https://polaris.iitbhilai.ac.in/public/pdfs/Brochure_25-26.pdf',
    sourceYear: '2025–26',
  },
  {
    name: 'Space Exploration Society',
    category: 'Sci-Tech',
    description: 'Astronomy, aeronautics, telescope observations, aeromodelling and related projects.',
    sourceUrl: 'https://polaris.iitbhilai.ac.in/public/pdfs/Brochure_25-26.pdf',
    sourceYear: '2025–26',
  },
  {
    name: 'OpenLake — Open Source Community',
    category: 'Sci-Tech',
    description: 'A public student-brochure listing describes an open-source community for collaborative projects.',
    sourceUrl: 'https://polaris.iitbhilai.ac.in/public/pdfs/Brochure_24-25.pdf',
    sourceYear: '2024–25; re-confirm current status',
  },
  {
    name: 'Epsilon — Robotics Club',
    category: 'Sci-Tech',
    description: 'A public student-brochure listing describes a robotics club. Confirm current leadership and activity directly.',
    sourceUrl: 'https://polaris.iitbhilai.ac.in/public/pdfs/Brochure_24-25.pdf',
    sourceYear: '2024–25; re-confirm current status',
  },
  {
    name: 'DesignX',
    category: 'Cultural',
    description: 'Design club listed by the IIT Bhilai Cultural Council.',
    sourceUrl: 'https://culturals.iitbhilai.ac.in/',
    sourceYear: 'Public Cultural Council listing',
  },
  {
    name: 'Drishya',
    category: 'Cultural',
    description: 'Dramatics/theatre club listed by the IIT Bhilai Cultural Council.',
    sourceUrl: 'https://culturals.iitbhilai.ac.in/',
    sourceYear: 'Public Cultural Council listing',
  },
  {
    name: 'Quizzotica',
    category: 'Cultural',
    description: 'Quiz club listed by the IIT Bhilai Cultural Council.',
    sourceUrl: 'https://culturals.iitbhilai.ac.in/',
    sourceYear: 'Public Cultural Council listing',
  },
  {
    name: 'TPS — Photography',
    category: 'Cultural',
    description: 'Photography community listed by the IIT Bhilai Cultural Council.',
    sourceUrl: 'https://culturals.iitbhilai.ac.in/',
    sourceYear: 'Public Cultural Council listing',
  },
  {
    name: 'Swara',
    category: 'Cultural',
    description: 'Music club listed by the IIT Bhilai Cultural Council.',
    sourceUrl: 'https://culturals.iitbhilai.ac.in/',
    sourceYear: 'Public Cultural Council listing',
  },
  {
    name: 'Beathackers',
    category: 'Cultural',
    description: 'Dance club listed by the IIT Bhilai Cultural Council.',
    sourceUrl: 'https://culturals.iitbhilai.ac.in/',
    sourceYear: 'Public Cultural Council listing',
  },
  {
    name: 'Renaissance',
    category: 'Cultural',
    description: 'Art club listed by the IIT Bhilai Cultural Council.',
    sourceUrl: 'https://culturals.iitbhilai.ac.in/',
    sourceYear: 'Public Cultural Council listing',
  },
  {
    name: 'FPS — Film Production Society',
    category: 'Cultural society',
    description: 'A society listed by the IIT Bhilai Cultural Council.',
    sourceUrl: 'https://culturals.iitbhilai.ac.in/',
    sourceYear: 'Public Cultural Council listing',
  },
  {
    name: 'GOALS — General Oratory and Literary Society',
    category: 'Cultural society',
    description: 'A society listed by the IIT Bhilai Cultural Council.',
    sourceUrl: 'https://culturals.iitbhilai.ac.in/',
    sourceYear: 'Public Cultural Council listing',
  },
] as const;

export const RECURRING_CAMPUS_EVENTS = [
  {
    name: 'Anveshan',
    category: 'Cultural',
    description: 'The Cultural Council describes this as an annual intra-institute cultural championship. The next date should be taken from an official notice.',
    sourceUrl: 'https://polaris.iitbhilai.ac.in/views/cosa.php',
  },
  {
    name: 'Prayatna',
    category: 'Sports',
    description: 'The Council of Student Affairs describes this as the institute’s annual sports tournament.',
    sourceUrl: 'https://polaris.iitbhilai.ac.in/views/cosa.php',
  },
  {
    name: 'Ciao',
    category: 'Freshers',
    description: 'A cultural showcase associated with introducing new students to campus cultural clubs.',
    sourceUrl: 'https://polaris.iitbhilai.ac.in/views/cosa.php',
  },
  {
    name: 'Cultscape',
    category: 'Cultural',
    description: 'A recurring cultural event described by the Cultural Council; consult current notices for dates.',
    sourceUrl: 'https://culturals.iitbhilai.ac.in/',
  },
] as const;

export const OFFICIAL_UPCOMING_EVENTS = [
  {
    title: '6th Convocation of IIT Bhilai',
    date: '24 October 2026',
    venue: 'Nalanda Hall, IIT Bhilai, Durg–491002',
    description: 'The official institute page lists the 6th Convocation for Saturday, 24 October 2026. Check the programme schedule for the current ceremony timing, access and instructions.',
    sourceUrl: 'https://www.iitbhilai.ac.in/index.php?pid=convocation',
    scheduleUrl: 'https://www.iitbhilai.ac.in/index.php?pid=convocation_schedule',
    status: 'Publicly listed by IIT Bhilai; recheck before attending.',
  },
] as const;

export const INSTITUTE_PLACEMENT_SNAPSHOT = {
  reportYear: '2024–25',
  totalPlaced: 139,
  registeredStudents: 189,
  placementPercentage: '73.54%',
  totalOffers: 152,
  recruiters: 128,
  sourceUrl: 'https://www.iitbhilai.ac.in/index.php?pid=PlacementReport2024_2025',
  note: 'Historical report figures only. They are not current-year statistics or an assurance of future placement outcomes.',
} as const;

export const INSTITUTE_SCHOLARSHIP_CATEGORIES = [
  {
    name: 'Merit-cum-Means Scholarship',
    audience: 'B.Tech students',
    sourceUrl: 'https://www.iitbhilai.ac.in/index.php?pid=institute_awards',
  },
  {
    name: 'Institute Free Studentship Scholarship',
    audience: 'B.Tech students',
    sourceUrl: 'https://www.iitbhilai.ac.in/index.php?pid=institute_awards',
  },
  {
    name: 'Institute SC/ST Scholarship',
    audience: 'Eligible B.Tech students',
    sourceUrl: 'https://www.iitbhilai.ac.in/index.php?pid=institute_awards',
  },
  {
    name: 'Institute Fellowship to Postgraduate Students',
    audience: 'Eligible postgraduate and doctoral students; conditions apply',
    sourceUrl: 'https://www.iitbhilai.ac.in/index.php?pid=institute_awards',
  },
  {
    name: 'Donor scholarships and awards',
    audience: 'Eligibility varies by award and academic year',
    sourceUrl: 'https://www.iitbhilai.ac.in/index.php?pid=donor_award',
  },
] as const;
