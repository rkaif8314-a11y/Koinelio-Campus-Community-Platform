import { INSTITUTION_PROFILE } from '@/lib/institution-config';

// ============================================================
// KOINELIO — DEMO DATA
// IIT Bhilai source-backed prototype context with synthetic interactive demo records.
// Public institutional facts live in lib/institution-config.ts and link to sources.
// Every person, Koinelio membership, activity count, interaction, and sample event is fictional.
// ============================================================

export type UserRole = 'student' | 'club_leader' | 'faculty' | 'admin' | 'alumni';
export type VerificationStatus = 'unverified' | 'pending' | 'verified';
export type DemoDataStatus = 'public-source' | 'historical-source' | 'demo-only';

export interface User {
  id: string;
  demoOnly?: boolean;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  institution: string;
  department: string;
  bio: string;
  graduationYear?: number;
  skills: string[];
  interests: string[];
  verificationStatus: VerificationStatus;
  clubMemberships: string[]; // club ids
  clubLeaderOf: string[];    // club ids
  joinedAt: string;
  isPublic: boolean;
  course?: string;
  designation?: string; // for faculty
  linkedIn?: string;
  github?: string;
  website?: string;
}

export interface Club {
  id: string;
  demoOnly?: boolean;
  dataStatus?: DemoDataStatus;
  sourceUrl?: string;
  sourceYear?: string;
  name: string;
  category: string;
  description: string;
  objectives: string;
  logo: string;
  coverImage: string;
  institution: string;
  memberCount: number;
  founded?: string;
  verificationStatus: VerificationStatus;
  isPublic: boolean;
  tags: string[];
  leadership: ClubLeadershipRole[];
  socialLinks: Record<string, string>;
}

export interface ClubLeadershipRole {
  userId: string;
  role: string;
  since: string;
  until?: string;
  verificationStatus: VerificationStatus;
}

export interface Event {
  id: string;
  demoOnly?: boolean;
  dataStatus?: DemoDataStatus;
  sourceUrl?: string;
  title: string;
  description: string;
  coverImage: string;
  category: string;
  date: string;
  endDate?: string;
  time: string;
  venue: string;
  isOnline: boolean;
  onlineLink?: string;
  organizerId: string; // user or club id
  organizerType: 'club' | 'user' | 'institution';
  institution: string;
  registrationDeadline: string;
  capacity?: number;
  registeredCount: number;
  eligibility: string;
  isFeatured: boolean;
  tags: string[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

export interface Post {
  id: string;
  authorId: string;
  authorType: 'user' | 'club';
  content: string;
  image?: string;
  type: 'general' | 'announcement' | 'event' | 'achievement' | 'question' | 'alumni' | 'project';
  isOfficial: boolean;
  likes: string[]; // user ids
  comments: Comment[];
  savedBy: string[]; // user ids
  createdAt: string;
  editedAt?: string;
  clubId?: string;
  eventId?: string;
}

export interface Comment {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
  likes: string[];
}

export interface Notification {
  id: string;
  userId: string;
  type: 'comment' | 'like' | 'club_invite' | 'membership_decision' | 'event_reminder' | 'registration' | 'announcement' | 'verification';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  actorId?: string;
}

export interface MembershipRequest {
  id: string;
  userId: string;
  clubId: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  decidedAt?: string;
  message?: string;
}

// ============================================================
// USERS
// ============================================================

type DemoUserSeed = {
  id: string;
  name: string;
  role: UserRole;
  department: string;
  bio: string;
  course?: string;
  designation?: string;
  graduationYear?: number;
  skills?: string[];
  interests?: string[];
  clubMemberships?: string[];
  clubLeaderOf?: string[];
};

function makeDemoUser(input: DemoUserSeed): User {
  return {
    ...input,
    email: input.id + '.demo@example.com',
    avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=' + input.id,
    institution: INSTITUTION_PROFILE.shortName,
    verificationStatus: 'unverified',
    skills: input.skills ?? [],
    interests: input.interests ?? [],
    clubMemberships: input.clubMemberships ?? [],
    clubLeaderOf: input.clubLeaderOf ?? [],
    joinedAt: '2026-08-01',
    isPublic: true,
    demoOnly: true,
  };
}

// These are fictional personas created only to make the interactive review usable.
// Do not treat them as IIT Bhilai students, faculty, administrators, or alumni.
export const DEMO_USERS: User[] = [
  makeDemoUser({
    id: 'u1', name: 'Aisha Verma', role: 'student', department: 'Electrical Engineering',
    course: 'B.Tech — Electrical Engineering', graduationYear: 2029,
    bio: 'Fictional demo student interested in circuits, embedded systems, peer learning, and open-source projects.',
    skills: ['Python', 'Circuit Analysis', 'Git'], interests: ['Electrical Engineering', 'Open Source', 'AI/ML'],
    clubMemberships: ['c1', 'c4', 'c5'], clubLeaderOf: ['c1'],
  }),
  makeDemoUser({
    id: 'u2', name: 'Arjun Mehta', role: 'student', department: 'Computer Science and Engineering',
    course: 'B.Tech — Computer Science and Engineering', graduationYear: 2028,
    bio: 'Fictional demo student who enjoys algorithms, coding contests, and collaborative software projects.',
    skills: ['C++', 'DSA', 'Python'], interests: ['Competitive Programming', 'Open Source', 'Web Development'],
    clubMemberships: ['c1', 'c2', 'c3', 'c6'], clubLeaderOf: ['c2'],
  }),
  makeDemoUser({
    id: 'u3', name: 'Priya Sahu', role: 'student', department: 'Electronics and Communication Engineering',
    course: 'B.Tech — Electronics and Communication Engineering', graduationYear: 2028,
    bio: 'Fictional demo student exploring electronics, photography, music, and interdepartmental projects.',
    skills: ['Digital Electronics', 'MATLAB', 'Photography'], interests: ['Electronics', 'Design', 'Culture'],
    clubMemberships: ['c7', 'c10', 'c11'],
  }),
  makeDemoUser({
    id: 'u4', name: 'Kabir Rao', role: 'student', department: 'Mechanical Engineering',
    course: 'B.Tech — Mechanical Engineering', graduationYear: 2029,
    bio: 'Fictional demo student interested in prototyping, robotics, manufacturing, and hands-on problem solving.',
    skills: ['CAD', 'Python', 'Prototyping'], interests: ['Robotics', 'Making', 'Design'],
    clubMemberships: ['c2', 'c7', 'c8'],
  }),
  makeDemoUser({
    id: 'u5', name: 'Maya Iyer', role: 'student', department: 'Data Science and Artificial Intelligence',
    course: 'B.Tech — Data Science and Artificial Intelligence', graduationYear: 2028,
    bio: 'Fictional demo student learning machine learning, data analysis, and responsible AI through practical projects.',
    skills: ['Python', 'Pandas', 'Machine Learning'], interests: ['AI/ML', 'Data Science', 'Research'],
    clubMemberships: ['c1', 'c4', 'c5', 'c14'], clubLeaderOf: ['c4'],
  }),
  makeDemoUser({
    id: 'u6', name: 'Dev Patel', role: 'student', department: 'Materials Science and Metallurgical Engineering',
    course: 'B.Tech — Materials Science and Metallurgical Engineering', graduationYear: 2029,
    bio: 'Fictional demo student curious about materials, entrepreneurship, scientific communication, and team projects.',
    skills: ['Data Analysis', 'Materials Lab', 'Presentations'], interests: ['Materials Science', 'Startups', 'Research'],
    clubMemberships: ['c3', 'c9', 'c16'],
  }),
  makeDemoUser({
    id: 'u7', name: 'Sara Khan', role: 'student', department: 'Mechatronics Engineering',
    course: 'B.Tech — Mechatronics Engineering', graduationYear: 2028,
    bio: 'Fictional demo student interested in automation, robotics, creative media, and cross-discipline projects.',
    skills: ['Arduino', 'CAD', 'Python'], interests: ['Robotics', 'Automation', 'Photography'],
    clubMemberships: ['c2', 'c8', 'c10'],
  }),
  makeDemoUser({
    id: 'u8', name: 'Neel Joshi', role: 'student', department: 'Chemistry',
    course: 'M.Sc. — Chemistry', graduationYear: 2027,
    bio: 'Fictional demo postgraduate student interested in research discussions, quizzes, and student mentorship.',
    skills: ['Laboratory Methods', 'LaTeX', 'Data Analysis'], interests: ['Chemistry', 'Research', 'Quizzes'],
    clubMemberships: ['c9', 'c10', 'c15'],
  }),
  makeDemoUser({
    id: 'f1', name: 'Dr. Sample Faculty One', role: 'faculty', department: 'Computer Science and Engineering',
    designation: 'Sample faculty persona', bio: 'Fictional faculty persona for demonstrating research announcements and mentoring workflows. Not a real IIT Bhilai faculty listing.',
    skills: ['Research', 'Teaching', 'Computing'], interests: ['Research Mentoring', 'Open Source'],
  }),
  makeDemoUser({
    id: 'f2', name: 'Dr. Sample Faculty Two', role: 'faculty', department: 'Electrical Engineering',
    designation: 'Sample faculty persona', bio: 'Fictional faculty persona for testing faculty-facing community features. Replace only with verified, consenting information after approval.',
    skills: ['Electrical Engineering', 'Research'], interests: ['Student Projects', 'Research'],
  }),
  makeDemoUser({
    id: 'f3', name: 'Dr. Sample Faculty Three', role: 'faculty', department: 'Materials Science and Metallurgical Engineering',
    designation: 'Sample faculty persona', bio: 'Fictional faculty persona used to demonstrate mentoring and community administration.',
    skills: ['Materials Science', 'Mentoring'], interests: ['Innovation', 'Research'],
  }),
  makeDemoUser({
    id: 'a1', name: 'Demo Campus Admin', role: 'admin', department: 'Student Affairs',
    designation: 'Demo workspace administrator', bio: 'Synthetic administrator persona used to explore the admin-facing demo. This is not an IIT Bhilai official account.',
    skills: ['Community Administration', 'Moderation'], interests: ['Student Wellbeing', 'Community'],
  }),
  makeDemoUser({
    id: 'al1', name: 'Riya Sen', role: 'alumni', department: 'Computer Science and Engineering',
    course: 'Fictional B.Tech alumna persona', graduationYear: 2022,
    bio: 'Fictional alumni persona for demonstrating mentoring and career-conversation flows. Employer and career details are not represented as real.',
    skills: ['Software Engineering', 'Mentoring'], interests: ['Open Source', 'Mentoring'],
  }),
  makeDemoUser({
    id: 'al2', name: 'Vikram Anand', role: 'alumni', department: 'Electrical Engineering',
    course: 'Fictional B.Tech alumni persona', graduationYear: 2021,
    bio: 'Fictional alumni persona for demonstrating peer mentoring and project networking.',
    skills: ['Power Systems', 'Project Planning'], interests: ['Energy', 'Mentoring'],
  }),
  makeDemoUser({
    id: 'al3', name: 'Ira Thomas', role: 'alumni', department: 'Data Science and Artificial Intelligence',
    course: 'Fictional undergraduate alumni persona', graduationYear: 2022,
    bio: 'Fictional alumni persona for demonstrating community stories and student mentoring.',
    skills: ['Data Analysis', 'Communication'], interests: ['AI/ML', 'Mentoring'],
  }),
];

// ============================================================
// CLUBS
// ============================================================

type DemoClubSeed = Pick<Club, 'id' | 'name' | 'category' | 'description' | 'objectives' | 'memberCount' | 'tags'> &
  Partial<Pick<Club, 'leadership' | 'sourceUrl' | 'sourceYear' | 'coverImage'>>;

function makeDemoClub(input: DemoClubSeed): Club {
  const sourceYear = input.sourceYear ?? 'Public Cultural Council listing';
  const historical = sourceYear.includes('2024–25') || sourceYear.includes('2024-25');
  return {
    ...input,
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=' + encodeURIComponent(input.id) + '&backgroundColor=5146E5&radius=12',
    coverImage: input.coverImage ?? 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=400&fit=crop',
    institution: INSTITUTION_PROFILE.shortName,
    verificationStatus: 'unverified',
    isPublic: true,
    founded: undefined,
    leadership: input.leadership ?? [],
    socialLinks: {},
    demoOnly: true,
    dataStatus: historical ? 'historical-source' : 'public-source',
    sourceYear,
  };
}

const demoLeadership = (userId: string, role: string) => [
  { userId, role: 'Demo ' + role, since: '2026-08-01', verificationStatus: 'unverified' as VerificationStatus },
];

// Club names/descriptions below are grounded in public institute-linked pages/brochures.
// Member counts and in-app demo leadership are synthetic. These are not institute-verified Koinelio clubs.
export const DEMO_CLUBS: Club[] = [
  makeDemoClub({
    id: 'c1', name: 'Ingenuity — Competitive Programming Club', category: 'Technology',
    description: 'A student community focused on algorithms, coding contests, workshops, and collaborative problem solving.',
    objectives: 'Support peer learning in algorithms and programming through practice sessions, challenges, and technical workshops.',
    memberCount: 36, tags: ['Competitive Programming', 'Algorithms', 'C++', 'DSA'],
    sourceUrl: 'https://polaris.iitbhilai.ac.in/public/pdfs/Brochure_25-26.pdf', sourceYear: '2025–26 brochure',
    leadership: demoLeadership('u1', 'demo coordinator'),
  }),
  makeDemoClub({
    id: 'c2', name: 'Epsilon — Robotics Club', category: 'Engineering',
    description: 'A robotics community listed in the 2024–25 student brochure. Current activity and leadership should be confirmed.',
    objectives: 'Illustrative goals: build prototypes, learn robotics concepts, and collaborate across hardware and software.',
    memberCount: 28, tags: ['Robotics', 'Electronics', 'Automation', 'Prototyping'],
    sourceUrl: 'https://polaris.iitbhilai.ac.in/public/pdfs/Brochure_24-25.pdf', sourceYear: '2024–25 historical listing — reconfirm',
    leadership: demoLeadership('u2', 'demo coordinator'),
  }),
  makeDemoClub({
    id: 'c3', name: 'BIB — Blockchain Innovation Base', category: 'Technology',
    description: 'A student community described in the 2025–26 brochure around blockchain, Web3, decentralised technology, and project-based learning.',
    objectives: 'Explore blockchain technologies, smart contracts, decentralised applications, and peer learning.',
    memberCount: 22, tags: ['Blockchain', 'Web3', 'Smart Contracts', 'Projects'],
    sourceUrl: 'https://polaris.iitbhilai.ac.in/public/pdfs/Brochure_25-26.pdf', sourceYear: '2025–26 brochure',
    leadership: demoLeadership('u6', 'demo coordinator'),
  }),
  makeDemoClub({
    id: 'c4', name: 'DSAI Club — Data Science and Artificial Intelligence', category: 'Science & Research',
    description: 'The public 2025–26 brochure describes a student community for AI, machine learning, data science projects, research, and peer learning.',
    objectives: 'Explore data-driven problem solving, machine learning fundamentals, collaborative projects, and responsible AI.',
    memberCount: 42, tags: ['AI/ML', 'Data Science', 'Python', 'Research'],
    sourceUrl: 'https://polaris.iitbhilai.ac.in/public/pdfs/Brochure_25-26.pdf', sourceYear: '2025–26 brochure',
    leadership: demoLeadership('u5', 'demo coordinator'),
  }),
  makeDemoClub({
    id: 'c5', name: 'OpenLake — Open Source Community', category: 'Technology',
    description: 'An open-source community appearing in the 2024–25 student brochure. Confirm current activity before treating this as a current club listing.',
    objectives: 'Illustrative goals: collaborate on public repositories, contribute to software projects, and help students learn Git and open-source workflows.',
    memberCount: 31, tags: ['Open Source', 'GitHub', 'Software Development', 'Collaboration'],
    sourceUrl: 'https://polaris.iitbhilai.ac.in/public/pdfs/Brochure_24-25.pdf', sourceYear: '2024–25 historical listing — reconfirm',
    leadership: demoLeadership('u1', 'demo coordinator'),
  }),
  makeDemoClub({
    id: 'c6', name: 'Space Exploration Society', category: 'Science & Research',
    description: 'The 2025–26 brochure describes astronomy, telescope observations, aeromodelling, drones, and aeronautics activities.',
    objectives: 'Encourage astronomy and aeronautics exploration through observation, modelling, workshops, and team projects.',
    memberCount: 24, tags: ['Astronomy', 'Aeronautics', 'Space', 'Drones'],
    sourceUrl: 'https://polaris.iitbhilai.ac.in/public/pdfs/Brochure_25-26.pdf', sourceYear: '2025–26 brochure',
    leadership: demoLeadership('u2', 'demo coordinator'),
  }),
  makeDemoClub({
    id: 'c7', name: 'DesignX', category: 'Arts & Media',
    description: 'Design club listed by the IIT Bhilai Cultural Council.',
    objectives: 'Demo goals: explore visual design, share creative work, and collaborate on student projects.',
    memberCount: 26, tags: ['Design', 'Visual Communication', 'Creative Work'],
    sourceUrl: 'https://culturals.iitbhilai.ac.in/', sourceYear: 'Public Cultural Council listing',
    leadership: demoLeadership('u3', 'demo coordinator'),
  }),
  makeDemoClub({
    id: 'c8', name: 'Drishya — Dramatics Club', category: 'Culture & Arts',
    description: 'Theatre/dramatics club listed by the IIT Bhilai Cultural Council.',
    objectives: 'Demo goals: facilitate theatre practice, stage production, storytelling, and creative collaboration.',
    memberCount: 25, tags: ['Theatre', 'Acting', 'Stagecraft', 'Culture'],
    sourceUrl: 'https://culturals.iitbhilai.ac.in/', sourceYear: 'Public Cultural Council listing',
    leadership: demoLeadership('u7', 'demo coordinator'),
  }),
  makeDemoClub({
    id: 'c9', name: 'Quizzotica', category: 'Culture & Arts',
    description: 'Quiz club listed by the IIT Bhilai Cultural Council.',
    objectives: 'Demo goals: host quiz practice, support knowledge sharing, and help students enjoy friendly intellectual competition.',
    memberCount: 19, tags: ['Quizzes', 'General Knowledge', 'Problem Solving'],
    sourceUrl: 'https://culturals.iitbhilai.ac.in/', sourceYear: 'Public Cultural Council listing',
    leadership: demoLeadership('u8', 'demo coordinator'),
  }),
  makeDemoClub({
    id: 'c10', name: 'TPS — Photography Club', category: 'Arts & Media',
    description: 'Photography community listed by the IIT Bhilai Cultural Council.',
    objectives: 'Demo goals: share photography, visual storytelling, photo walks, and peer feedback.',
    memberCount: 21, tags: ['Photography', 'Visual Storytelling', 'Media'],
    sourceUrl: 'https://culturals.iitbhilai.ac.in/', sourceYear: 'Public Cultural Council listing',
    leadership: demoLeadership('u3', 'demo coordinator'),
  }),
  makeDemoClub({
    id: 'c11', name: 'Swara — Music Club', category: 'Culture & Arts',
    description: 'Music club listed by the IIT Bhilai Cultural Council.',
    objectives: 'Demo goals: encourage musical practice, collaboration, and performances.',
    memberCount: 23, tags: ['Music', 'Singing', 'Instrumental', 'Culture'],
    sourceUrl: 'https://culturals.iitbhilai.ac.in/', sourceYear: 'Public Cultural Council listing',
    leadership: demoLeadership('u3', 'demo coordinator'),
  }),
  makeDemoClub({
    id: 'c12', name: 'Beathackers — Dance Club', category: 'Culture & Arts',
    description: 'Dance club listed by the IIT Bhilai Cultural Council.',
    objectives: 'Demo goals: learn and perform diverse dance styles, practise together, and support campus performances.',
    memberCount: 30, tags: ['Dance', 'Performance', 'Culture'],
    sourceUrl: 'https://culturals.iitbhilai.ac.in/', sourceYear: 'Public Cultural Council listing',
    leadership: demoLeadership('u7', 'demo coordinator'),
  }),
  makeDemoClub({
    id: 'c13', name: 'Renaissance — Art Club', category: 'Arts & Media',
    description: 'Art club listed by the IIT Bhilai Cultural Council.',
    objectives: 'Demo goals: make art, share creative work, and support collaborative art projects.',
    memberCount: 18, tags: ['Art', 'Illustration', 'Creative Practice'],
    sourceUrl: 'https://culturals.iitbhilai.ac.in/', sourceYear: 'Public Cultural Council listing',
  }),
  makeDemoClub({
    id: 'c14', name: 'FPS — Film Production Society', category: 'Arts & Media',
    description: 'Film production society listed by the IIT Bhilai Cultural Council.',
    objectives: 'Demo goals: explore film-making, writing, production, editing, and student storytelling.',
    memberCount: 17, tags: ['Film', 'Video Production', 'Editing', 'Storytelling'],
    sourceUrl: 'https://culturals.iitbhilai.ac.in/', sourceYear: 'Public Cultural Council listing',
  }),
  makeDemoClub({
    id: 'c15', name: 'GOALS — General Oratory and Literary Society', category: 'Debate & Public Speaking',
    description: 'Oratory and literary society listed by the IIT Bhilai Cultural Council.',
    objectives: 'Demo goals: support speaking, writing, literary activities, discussion, and communication skills.',
    memberCount: 20, tags: ['Oratory', 'Writing', 'Literature', 'Communication'],
    sourceUrl: 'https://culturals.iitbhilai.ac.in/', sourceYear: 'Public Cultural Council listing',
  }),
  makeDemoClub({
    id: 'c16', name: 'Electronics Club', category: 'Engineering',
    description: 'An electronics club appears in the 2024–25 student brochure; confirm current activity and leadership.',
    objectives: 'Demo goals: learn practical electronics, test circuits, and collaborate on hardware projects.',
    memberCount: 16, tags: ['Electronics', 'Embedded Systems', 'Hardware'],
    sourceUrl: 'https://polaris.iitbhilai.ac.in/public/pdfs/Brochure_24-25.pdf', sourceYear: '2024–25 historical listing — reconfirm',
  }),
  makeDemoClub({
    id: 'c17', name: 'Motorsports Club', category: 'Engineering',
    description: 'A motorsports club appears in the 2024–25 student brochure; confirm current activity and leadership.',
    objectives: 'Demo goals: explore vehicle engineering, mechanical design, and team-based prototyping.',
    memberCount: 14, tags: ['Motorsports', 'Mechanical Design', 'Engineering'],
    sourceUrl: 'https://polaris.iitbhilai.ac.in/public/pdfs/Brochure_24-25.pdf', sourceYear: '2024–25 historical listing — reconfirm',
  }),
];

// ============================================================
// EVENTS
// ============================================================

type DemoEventSeed = {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  organizerId: string;
  organizerType: Event['organizerType'];
  registrationDeadline: string;
  capacity: number;
  registeredCount: number;
  isFeatured: boolean;
  tags: string[];
};

function makeDemoEvent(input: DemoEventSeed): Event {
  return {
    ...input,
    title: 'Demo · ' + input.title,
    description: 'DEMO ONLY — This is an illustrative event scenario, not an officially scheduled IIT Bhilai event. ' + input.description,
    coverImage: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200&h=600&fit=crop',
    venue: 'Sample venue — not confirmed',
    isOnline: false,
    institution: INSTITUTION_PROFILE.shortName + ' (unofficial prototype)',
    status: 'upcoming',
    eligibility: 'Illustrative demo audience only; not an official IIT Bhilai eligibility rule.',
    demoOnly: true,
    dataStatus: 'demo-only',
  };
}

// The Events tab demonstrates event discovery and in-demo registration.
// Dates, venues, counts, and registrations below are synthetic placeholders, not real notices.
export const DEMO_EVENTS: Event[] = [
  makeDemoEvent({
    id: 'e1', title: 'Beginner Coding Jam', description: 'Bring a laptop, pair with other learners, and work through friendly programming challenges.',
    category: 'Technical', date: '2026-10-25', time: '16:00', organizerId: 'c1', organizerType: 'club',
    registrationDeadline: '2026-10-24', capacity: 80, registeredCount: 27, isFeatured: true,
    tags: ['Coding', 'Beginners', 'Peer Learning'],
  }),
  makeDemoEvent({
    id: 'e2', title: 'Student Design Showcase', description: 'Share interface mockups, posters, photography, and creative work for feedback.',
    category: 'Cultural', date: '2026-11-04', time: '17:00', organizerId: 'c7', organizerType: 'club',
    registrationDeadline: '2026-11-02', capacity: 60, registeredCount: 18, isFeatured: true,
    tags: ['Design', 'Showcase', 'Creative Work'],
  }),
  makeDemoEvent({
    id: 'e3', title: 'Robotics Build Night', description: 'A sample collaborative session for students interested in sensors, motors, and prototyping.',
    category: 'Workshops', date: '2026-10-29', time: '18:00', organizerId: 'c2', organizerType: 'club',
    registrationDeadline: '2026-10-28', capacity: 40, registeredCount: 24, isFeatured: false,
    tags: ['Robotics', 'Hardware', 'Hands On'],
  }),
  makeDemoEvent({
    id: 'e4', title: 'Open Source Contribution Hour', description: 'Explore Git, GitHub issues, documentation, and beginner-friendly pull requests together.',
    category: 'Technical', date: '2026-11-06', time: '16:30', organizerId: 'c5', organizerType: 'club',
    registrationDeadline: '2026-11-05', capacity: 50, registeredCount: 31, isFeatured: true,
    tags: ['Open Source', 'GitHub', 'Collaboration'],
  }),
  makeDemoEvent({
    id: 'e5', title: 'AI and Data Project Meetup', description: 'Discuss practical student project ideas in data analysis, machine learning, and responsible AI.',
    category: 'Seminars', date: '2026-11-12', time: '17:30', organizerId: 'c4', organizerType: 'club',
    registrationDeadline: '2026-11-11', capacity: 70, registeredCount: 45, isFeatured: false,
    tags: ['AI/ML', 'Data Science', 'Projects'],
  }),
  makeDemoEvent({
    id: 'e6', title: 'Campus Sports Mixer', description: 'A demo example of a casual sports sign-up flow spanning indoor and outdoor games.',
    category: 'Sports', date: '2026-11-22', time: '08:00', organizerId: 'a1', organizerType: 'institution',
    registrationDeadline: '2026-11-20', capacity: 150, registeredCount: 62, isFeatured: false,
    tags: ['Sports', 'Teams', 'Wellbeing'],
  }),
  makeDemoEvent({
    id: 'e7', title: 'Student Startup Pitch Circle', description: 'Practise presenting a project or early idea and receive supportive peer feedback.',
    category: 'Competitions', date: '2026-12-05', time: '17:30', organizerId: 'a1', organizerType: 'institution',
    registrationDeadline: '2026-12-03', capacity: 70, registeredCount: 36, isFeatured: true,
    tags: ['Startups', 'Presentations', 'Innovation'],
  }),
  makeDemoEvent({
    id: 'e8', title: 'Alumni Mentoring Conversation', description: 'An illustrative session where students can practise asking alumni about career choices, projects, and internships.',
    category: 'Alumni Reunions', date: '2026-12-19', time: '11:00', organizerId: 'al1', organizerType: 'user',
    registrationDeadline: '2026-12-17', capacity: 50, registeredCount: 20, isFeatured: false,
    tags: ['Alumni', 'Mentoring', 'Careers'],
  }),
  makeDemoEvent({
    id: 'e9', title: 'Photo Walk and Visual Stories', description: 'Explore composition and visual storytelling, then share photographs in a friendly critique.',
    category: 'Cultural', date: '2026-11-01', time: '07:00', organizerId: 'c10', organizerType: 'club',
    registrationDeadline: '2026-10-31', capacity: 35, registeredCount: 22, isFeatured: false,
    tags: ['Photography', 'Creative', 'Campus'],
  }),
  makeDemoEvent({
    id: 'e10', title: 'Student Research Lightning Talks', description: 'Practise short, accessible talks about a project, paper, experiment, or research question.',
    category: 'Seminars', date: '2026-11-28', time: '15:00', organizerId: 'f1', organizerType: 'user',
    registrationDeadline: '2026-11-26', capacity: 60, registeredCount: 29, isFeatured: false,
    tags: ['Research', 'Presentations', 'Learning'],
  }),
];

// ============================================================
// POSTS
// ============================================================

function makeDemoPost(input: {
  id: string;
  authorId: string;
  authorType: Post['authorType'];
  content: string;
  type: Post['type'];
  createdAt: string;
  clubId?: string;
  eventId?: string;
  image?: string;
}): Post {
  return {
    ...input,
    isOfficial: false,
    likes: ['u2', 'u3'],
    comments: [
      {
        id: input.id + '-comment-1',
        authorId: input.authorId === 'u1' ? 'u2' : 'u1',
        content: 'Demo interaction: thanks for sharing this with the community.',
        createdAt: input.createdAt,
        likes: [],
      },
    ],
    savedBy: ['u1'],
  };
}

// All posts and interactions are synthetic demonstrations, not IIT Bhilai announcements.
export const DEMO_POSTS: Post[] = [
  makeDemoPost({
    id: 'p1', authorId: 'a1', authorType: 'user', type: 'announcement',
    content: '👋 Welcome to the Koinelio IIT Bhilai demo workspace. This is an independent prototype, not an IIT Bhilai service. Use Campus Guide to open the original public sources; sample posts, profiles, club rosters and interactions are fictional.',
    createdAt: '2026-10-16T08:00:00Z',
  }),
  makeDemoPost({
    id: 'p2', authorId: 'c1', authorType: 'club', type: 'event', clubId: 'c1', eventId: 'e1',
    content: 'DEMO SCENARIO: Ingenuity’s sample coding jam is here to show how a club could share an activity, invite participants, and manage registrations. This is not an official event notice.',
    createdAt: '2026-10-16T07:15:00Z',
  }),
  makeDemoPost({
    id: 'p3', authorId: 'u1', authorType: 'user', type: 'general',
    content: 'Fictional student post: I’m practising programming alongside my EE coursework. What small Python or embedded-systems project helped you connect theory with something practical?',
    createdAt: '2026-10-15T14:00:00Z',
  }),
  makeDemoPost({
    id: 'p4', authorId: 'u3', authorType: 'user', type: 'event',
    content: 'DEMO SCENARIO: Our sample creative showcase needs volunteers to help organise the gallery, make signboards, and welcome visitors. Use this flow to preview event volunteering; no real event is scheduled.',
    createdAt: '2026-10-15T11:30:00Z',
  }),
  makeDemoPost({
    id: 'p5', authorId: 'u2', authorType: 'user', type: 'achievement',
    content: 'Fictional project showcase: our demo team built a small sensor dashboard and documented the design decisions. The project and result are illustrative, not a report of a real IIT Bhilai team.',
    createdAt: '2026-10-14T13:00:00Z',
  }),
  makeDemoPost({
    id: 'p6', authorId: 'f1', authorType: 'user', type: 'announcement',
    content: 'Demo resource reminder: academic dates, scholarship criteria, admissions and institutional notices should always be checked on IIT Bhilai’s official pages. Koinelio links to public sources but does not replace them.',
    createdAt: '2026-10-14T09:30:00Z',
  }),
  makeDemoPost({
    id: 'p7', authorId: 'u6', authorType: 'user', type: 'question',
    content: 'Fictional student question: who would like to form a cross-department team for a materials, data science, or sustainability project? Share interests and skills in this demo thread.',
    createdAt: '2026-10-13T16:00:00Z',
  }),
  makeDemoPost({
    id: 'p8', authorId: 'al1', authorType: 'user', type: 'alumni',
    content: 'Fictional alumni persona: the best mentoring conversations often start with a specific question. This sample post demonstrates alumni Q&A; it is not a real graduate testimonial.',
    createdAt: '2026-10-13T10:00:00Z',
  }),
  makeDemoPost({
    id: 'p9', authorId: 'u5', authorType: 'user', type: 'question',
    content: 'Discussion prompt for the demo: how do you plan a manageable weekly routine for DSA, coursework, a personal project, and rest?',
    createdAt: '2026-10-12T14:30:00Z',
  }),
  makeDemoPost({
    id: 'p10', authorId: 'u7', authorType: 'user', type: 'project',
    content: 'Fictional portfolio idea: a campus navigation prototype that links places to verified public information and accessibility notes. Project description is illustrative.',
    createdAt: '2026-10-11T11:00:00Z',
  }),
];

// ============================================================
// NOTIFICATIONS
// ============================================================

export const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1', userId: 'u1', type: 'comment',
    title: 'A demo user commented on your post',
    message: 'Demo interaction: thanks for sharing this with the community.',
    isRead: false, createdAt: '2026-10-16T08:15:00Z', actorId: 'u2',
  },
  {
    id: 'n2', userId: 'u1', type: 'like',
    title: 'Your sample post received reactions',
    message: 'The reactions shown here are fictional demo activity.',
    isRead: false, createdAt: '2026-10-16T07:45:00Z', actorId: 'u3',
  },
  {
    id: 'n3', userId: 'u1', type: 'membership_decision',
    title: 'Demo club membership request',
    message: 'A fictional request is awaiting review in this prototype.',
    isRead: false, createdAt: '2026-10-15T09:00:00Z', actorId: 'u4',
    actionUrl: '/dashboard/clubs/c1/dashboard',
  },
  {
    id: 'n4', userId: 'u1', type: 'event_reminder',
    title: 'Reminder: sample coding jam',
    message: 'This is a demo reminder for a fictional event, not an official institute notice.',
    isRead: true, createdAt: '2026-10-15T08:00:00Z', actionUrl: '/dashboard/events/e1',
  },
  {
    id: 'n5', userId: 'u1', type: 'announcement',
    title: 'Koinelio demo workspace notice',
    message: 'This prototype is independent and is not operated or endorsed by IIT Bhilai.',
    isRead: true, createdAt: '2026-10-16T08:00:00Z', actorId: 'a1',
  },
  {
    id: 'n6', userId: 'u1', type: 'verification',
    title: 'Sample profile verification workflow',
    message: 'No demo profile is institution-verified. This notification illustrates a possible future workflow.',
    isRead: true, createdAt: '2026-10-10T10:00:00Z', actionUrl: '/dashboard/profile/u1',
  },
  {
    id: 'n7', userId: 'u1', type: 'registration',
    title: 'Registration confirmed: demo coding jam',
    message: 'This registration exists only in the local demo state.',
    isRead: true, createdAt: '2026-10-12T14:00:00Z', actionUrl: '/dashboard/events/e1',
  },
];

// ============================================================
// MEMBERSHIP REQUESTS
// ============================================================

export const DEMO_MEMBERSHIP_REQUESTS: MembershipRequest[] = [
  {
    id: 'mr1', userId: 'u4', clubId: 'c1', status: 'pending',
    requestedAt: '2026-10-16T09:00:00Z',
    message: 'Demo request: I am interested in algorithms and would like to join this sample community.',
  },
  {
    id: 'mr2', userId: 'u7', clubId: 'c1', status: 'pending',
    requestedAt: '2026-10-15T14:00:00Z',
    message: 'Demo request: I want to learn with people from other departments.',
  },
  {
    id: 'mr3', userId: 'u6', clubId: 'c1', status: 'approved',
    requestedAt: '2026-10-12T10:00:00Z', decidedAt: '2026-10-13T10:00:00Z',
  },
];

// ============================================================
// DEMO SESSION USERS (for switching demo modes)
// ============================================================

export const DEMO_SESSION_USERS = [
  { id: 'u1', label: 'Aisha Verma — Demo Student', role: 'student' as UserRole },
  { id: 'u2', label: 'Arjun Mehta — Demo Student / Club Lead', role: 'student' as UserRole },
  { id: 'f1', label: 'Sample Faculty Persona', role: 'faculty' as UserRole },
  { id: 'a1', label: 'Demo Campus Admin', role: 'admin' as UserRole },
  { id: 'al1', label: 'Riya Sen — Demo Alumni', role: 'alumni' as UserRole },
];

// ============================================================
// HELPERS
// ============================================================

export function getUserById(id: string): User | undefined {
  return DEMO_USERS.find(u => u.id === id);
}

export function getClubById(id: string): Club | undefined {
  return DEMO_CLUBS.find(c => c.id === id);
}

export function getEventById(id: string): Event | undefined {
  return DEMO_EVENTS.find(e => e.id === id);
}

export function getPostById(id: string): Post | undefined {
  return DEMO_POSTS.find(p => p.id === id);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatShortDate(dateStr);
}
