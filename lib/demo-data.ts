// ============================================================
// KOINELIO — DEMO DATA
// Fictional data for Northstar University prototype
// ALL DATA IS FICTIONAL AND FOR DEMONSTRATION PURPOSES ONLY
// ============================================================

export type UserRole = 'student' | 'club_leader' | 'faculty' | 'admin' | 'alumni';
export type VerificationStatus = 'unverified' | 'pending' | 'verified';

export interface User {
  id: string;
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
  name: string;
  category: string;
  description: string;
  objectives: string;
  logo: string;
  coverImage: string;
  institution: string;
  memberCount: number;
  founded: string;
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

export const DEMO_USERS: User[] = [
  {
    id: 'u1',
    name: 'Aisha Nwosu',
    email: 'aisha.nwosu@northstar.edu',
    avatar: 'https://i.pravatar.cc/150?img=47',
    role: 'student',
    institution: 'Northstar University',
    department: 'Computer Science',
    course: 'B.Sc. Computer Science',
    bio: 'Third-year CS student passionate about machine learning and open source. Building things that matter.',
    graduationYear: 2027,
    skills: ['Python', 'React', 'Machine Learning', 'Data Analysis'],
    interests: ['AI/ML', 'Open Source', 'Hackathons', 'Photography'],
    verificationStatus: 'verified',
    clubMemberships: ['c1', 'c3', 'c5'],
    clubLeaderOf: ['c1'],
    joinedAt: '2024-09-01',
    isPublic: true,
    github: 'github.com/aishanwosu',
    linkedIn: 'linkedin.com/in/aishanwosu',
  },
  {
    id: 'u2',
    name: 'Marcus Chen',
    email: 'marcus.chen@northstar.edu',
    avatar: 'https://i.pravatar.cc/150?img=11',
    role: 'student',
    institution: 'Northstar University',
    department: 'Electrical Engineering',
    course: 'B.Eng. Electrical Engineering',
    bio: 'Final year EE student. Robotics enthusiast and competitive programmer. Co-founder of RoboNSU.',
    graduationYear: 2026,
    skills: ['C++', 'Embedded Systems', 'ROS', 'Circuit Design'],
    interests: ['Robotics', 'Competitive Programming', 'Electronics', 'Gaming'],
    verificationStatus: 'verified',
    clubMemberships: ['c2', 'c4'],
    clubLeaderOf: ['c2'],
    joinedAt: '2022-09-01',
    isPublic: true,
    github: 'github.com/marcuschen',
  },
  {
    id: 'u3',
    name: 'Priya Sharma',
    email: 'priya.sharma@northstar.edu',
    avatar: 'https://i.pravatar.cc/150?img=44',
    role: 'student',
    institution: 'Northstar University',
    department: 'Business Administration',
    course: 'BBA',
    bio: 'Aspiring entrepreneur. Event management lead at Northstar Cultural Society.',
    graduationYear: 2027,
    skills: ['Event Management', 'Marketing', 'Public Speaking', 'Excel'],
    interests: ['Entrepreneurship', 'Culture', 'Dance', 'Finance'],
    verificationStatus: 'verified',
    clubMemberships: ['c3', 'c5'],
    clubLeaderOf: ['c3'],
    joinedAt: '2024-09-01',
    isPublic: true,
  },
  {
    id: 'u4',
    name: 'Jordan Osei',
    email: 'jordan.osei@northstar.edu',
    avatar: 'https://i.pravatar.cc/150?img=15',
    role: 'student',
    institution: 'Northstar University',
    department: 'Physics',
    course: 'B.Sc. Physics',
    bio: 'Physics nerd by day, jazz musician by night. Part of the NSU Science Club leadership.',
    graduationYear: 2028,
    skills: ['MATLAB', 'LaTeX', 'Piano', 'Research Methods'],
    interests: ['Physics', 'Music', 'Astronomy', 'Chess'],
    verificationStatus: 'pending',
    clubMemberships: ['c4'],
    clubLeaderOf: [],
    joinedAt: '2025-09-01',
    isPublic: true,
  },
  {
    id: 'u5',
    name: 'Sofia Reyes',
    email: 'sofia.reyes@northstar.edu',
    avatar: 'https://i.pravatar.cc/150?img=49',
    role: 'student',
    institution: 'Northstar University',
    department: 'Design and Media Arts',
    course: 'B.Des.',
    bio: 'Designer and visual storyteller. Design Lead at TechSpark NSU. Portfolio: sofiareyes.design',
    graduationYear: 2027,
    skills: ['Figma', 'Adobe Suite', 'UI/UX', 'Illustration'],
    interests: ['Design', 'Photography', 'Art Installations', 'Typography'],
    verificationStatus: 'verified',
    clubMemberships: ['c1', 'c5'],
    clubLeaderOf: [],
    joinedAt: '2024-09-01',
    isPublic: true,
    website: 'sofiareyes.design',
  },
  {
    id: 'u6',
    name: 'Daniel Abramowitz',
    email: 'daniel.abramowitz@northstar.edu',
    avatar: 'https://i.pravatar.cc/150?img=18',
    role: 'student',
    institution: 'Northstar University',
    department: 'Economics',
    course: 'B.Sc. Economics',
    bio: 'Econ student with a passion for fintech and data. Treasurer of NSU Finance Club.',
    graduationYear: 2027,
    skills: ['R', 'Python', 'Financial Modeling', 'Data Visualization'],
    interests: ['Fintech', 'Investing', 'Data', 'Swimming'],
    verificationStatus: 'verified',
    clubMemberships: ['c6'],
    clubLeaderOf: ['c6'],
    joinedAt: '2024-09-01',
    isPublic: true,
  },
  {
    id: 'u7',
    name: 'Zara Okonkwo',
    email: 'zara.okonkwo@northstar.edu',
    avatar: 'https://i.pravatar.cc/150?img=45',
    role: 'student',
    institution: 'Northstar University',
    department: 'Law',
    course: 'LLB',
    bio: 'Law student and debate champion. Co-lead of NSU Debate Society.',
    graduationYear: 2028,
    skills: ['Research', 'Public Speaking', 'Legal Writing', 'Negotiation'],
    interests: ['Law', 'Debate', 'Human Rights', 'Writing'],
    verificationStatus: 'verified',
    clubMemberships: ['c7'],
    clubLeaderOf: ['c7'],
    joinedAt: '2025-09-01',
    isPublic: true,
  },
  {
    id: 'u8',
    name: 'Leo Martinez',
    email: 'leo.martinez@northstar.edu',
    avatar: 'https://i.pravatar.cc/150?img=12',
    role: 'student',
    institution: 'Northstar University',
    department: 'Computer Science',
    course: 'M.Sc. Computer Science',
    bio: 'Graduate student in distributed systems. TA for CS301. Open source contributor.',
    graduationYear: 2026,
    skills: ['Go', 'Kubernetes', 'System Design', 'Teaching'],
    interests: ['Cloud Computing', 'Open Source', 'Mentoring', 'Cycling'],
    verificationStatus: 'verified',
    clubMemberships: ['c1', 'c2'],
    clubLeaderOf: [],
    joinedAt: '2024-09-01',
    isPublic: true,
    github: 'github.com/leomartinez',
  },
  // FACULTY
  {
    id: 'f1',
    name: 'Dr. Eleanor Voss',
    email: 'e.voss@northstar.edu',
    avatar: 'https://i.pravatar.cc/150?img=46',
    role: 'faculty',
    institution: 'Northstar University',
    department: 'Computer Science',
    designation: 'Associate Professor',
    bio: 'AI researcher and faculty adviser for TechSpark NSU. Published in NeurIPS, ICML. Passionate about responsible AI.',
    skills: ['Machine Learning', 'Research', 'Python', 'Teaching'],
    interests: ['AI Ethics', 'Education Technology', 'Research'],
    verificationStatus: 'verified',
    clubMemberships: [],
    clubLeaderOf: [],
    joinedAt: '2020-08-01',
    isPublic: true,
  },
  {
    id: 'f2',
    name: 'Prof. Samuel Adeyemi',
    email: 's.adeyemi@northstar.edu',
    avatar: 'https://i.pravatar.cc/150?img=13',
    role: 'faculty',
    institution: 'Northstar University',
    department: 'Mechanical Engineering',
    designation: 'Professor',
    bio: 'Robotics and automation specialist. Faculty adviser for RoboNSU. 20+ years in academia and industry.',
    skills: ['Robotics', 'Control Systems', 'CAD', 'Research'],
    interests: ['Robotics', 'Industry Collaboration', 'Student Mentoring'],
    verificationStatus: 'verified',
    clubMemberships: [],
    clubLeaderOf: [],
    joinedAt: '2015-08-01',
    isPublic: true,
  },
  {
    id: 'f3',
    name: 'Dr. Amara Patel',
    email: 'a.patel@northstar.edu',
    avatar: 'https://i.pravatar.cc/150?img=48',
    role: 'faculty',
    institution: 'Northstar University',
    department: 'Business Administration',
    designation: 'Assistant Professor',
    bio: 'Entrepreneurship and innovation faculty. Adviser to NSU Finance Club and Cultural Society. Startup mentor.',
    skills: ['Entrepreneurship', 'Finance', 'Strategy', 'Mentoring'],
    interests: ['Innovation', 'Student Startups', 'Finance'],
    verificationStatus: 'verified',
    clubMemberships: [],
    clubLeaderOf: [],
    joinedAt: '2022-08-01',
    isPublic: true,
  },
  // ADMIN
  {
    id: 'a1',
    name: 'James Whitfield',
    email: 'j.whitfield@northstar.edu',
    avatar: 'https://i.pravatar.cc/150?img=14',
    role: 'admin',
    institution: 'Northstar University',
    department: 'Student Affairs',
    designation: 'Dean of Student Affairs',
    bio: 'Overseeing student organizations, campus activities and the Koinelio platform rollout at Northstar University.',
    skills: ['Administration', 'Policy', 'Student Affairs'],
    interests: ['Campus Development', 'Student Wellbeing'],
    verificationStatus: 'verified',
    clubMemberships: [],
    clubLeaderOf: [],
    joinedAt: '2018-01-01',
    isPublic: true,
  },
  // ALUMNI
  {
    id: 'al1',
    name: 'Chioma Eze',
    email: 'chioma.eze@alumni.northstar.edu',
    avatar: 'https://i.pravatar.cc/150?img=43',
    role: 'alumni',
    institution: 'Northstar University',
    department: 'Computer Science',
    bio: "NSU CS '22. Currently Senior Software Engineer at Stripe. Former President of TechSpark NSU. Open to mentoring.",
    graduationYear: 2022,
    skills: ['Distributed Systems', 'Go', 'Team Leadership', 'Fintech'],
    interests: ['Mentoring', 'Women in Tech', 'Fintech', 'Campus Reunions'],
    verificationStatus: 'verified',
    clubMemberships: [],
    clubLeaderOf: [],
    joinedAt: '2022-07-01',
    isPublic: true,
    linkedIn: 'linkedin.com/in/chiomaeze',
  },
  {
    id: 'al2',
    name: 'Kwame Asante',
    email: 'kwame.asante@alumni.northstar.edu',
    avatar: 'https://i.pravatar.cc/150?img=16',
    role: 'alumni',
    institution: 'Northstar University',
    department: 'Electrical Engineering',
    bio: "NSU EE '20. Founder & CTO of VoltaGrid, a clean energy startup. Proud RoboNSU alumnus.",
    graduationYear: 2020,
    skills: ['Power Systems', 'Entrepreneurship', 'Hardware', 'Fundraising'],
    interests: ['Clean Energy', 'Startups', 'Hardware', 'Mentoring'],
    verificationStatus: 'verified',
    clubMemberships: [],
    clubLeaderOf: [],
    joinedAt: '2020-07-01',
    isPublic: true,
    linkedIn: 'linkedin.com/in/kwameasante',
  },
  {
    id: 'al3',
    name: 'Natasha Ivanova',
    email: 'natasha.ivanova@alumni.northstar.edu',
    avatar: 'https://i.pravatar.cc/150?img=41',
    role: 'alumni',
    institution: 'Northstar University',
    department: 'Business Administration',
    bio: "NSU BBA '21. Investment analyst at Goldman Sachs. Former NSU Finance Club President.",
    graduationYear: 2021,
    skills: ['Investment Analysis', 'Financial Modeling', 'Leadership', 'Excel'],
    interests: ['Finance', 'Investing', 'Campus Events', 'Mentoring'],
    verificationStatus: 'verified',
    clubMemberships: [],
    clubLeaderOf: [],
    joinedAt: '2021-07-01',
    isPublic: true,
    linkedIn: 'linkedin.com/in/natashaivanova',
  },
];

// ============================================================
// CLUBS
// ============================================================

export const DEMO_CLUBS: Club[] = [
  {
    id: 'c1',
    name: 'TechSpark NSU',
    category: 'Technology',
    description: 'The flagship technology and innovation club at Northstar University. We foster a community of builders, makers, and thinkers who are shaping the future through technology.',
    objectives: 'Promote technology literacy, run hackathons, support student projects, connect students with industry, and build an inclusive tech community on campus.',
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=techspark&backgroundColor=5146E5&radius=12',
    coverImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=400&fit=crop',
    institution: 'Northstar University',
    memberCount: 284,
    founded: '2018-09-15',
    verificationStatus: 'verified',
    isPublic: true,
    tags: ['Technology', 'Hackathons', 'Programming', 'AI/ML', 'Open Source'],
    leadership: [
      { userId: 'u1', role: 'President', since: '2025-01-01', verificationStatus: 'verified' },
      { userId: 'u5', role: 'Design Lead', since: '2025-01-01', verificationStatus: 'verified' },
      { userId: 'u8', role: 'Technical Lead', since: '2025-01-01', verificationStatus: 'verified' },
      { userId: 'f1', role: 'Faculty Adviser', since: '2023-01-01', verificationStatus: 'verified' },
    ],
    socialLinks: { github: 'github.com/techspark-nsu', instagram: '@techspark_nsu' },
  },
  {
    id: 'c2',
    name: 'RoboNSU',
    category: 'Engineering',
    description: 'Building the next generation of robotics engineers. RoboNSU competes in national and international robotics competitions and runs workshops for beginners.',
    objectives: 'Design and build competitive robots, educate members in robotics fundamentals, participate in FIRST Robotics and regional competitions.',
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=robonsu&backgroundColor=0F9D8A&radius=12',
    coverImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=400&fit=crop',
    institution: 'Northstar University',
    memberCount: 92,
    founded: '2019-02-10',
    verificationStatus: 'verified',
    isPublic: true,
    tags: ['Robotics', 'Engineering', 'Competition', 'Electronics', 'Automation'],
    leadership: [
      { userId: 'u2', role: 'President', since: '2025-01-01', verificationStatus: 'verified' },
      { userId: 'f2', role: 'Faculty Adviser', since: '2022-01-01', verificationStatus: 'verified' },
    ],
    socialLinks: { instagram: '@robo_nsu' },
  },
  {
    id: 'c3',
    name: 'Northstar Cultural Society',
    category: 'Culture & Arts',
    description: 'Celebrating the rich diversity of Northstar University through cultural exchange, festivals, performing arts, and creative expression.',
    objectives: 'Organize cultural festivals, support performing arts groups, foster cross-cultural dialogue, and showcase student talent.',
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=cultural&backgroundColor=B7791F&radius=12',
    coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=400&fit=crop',
    institution: 'Northstar University',
    memberCount: 312,
    founded: '2015-05-01',
    verificationStatus: 'verified',
    isPublic: true,
    tags: ['Culture', 'Arts', 'Dance', 'Music', 'Festivals', 'Diversity'],
    leadership: [
      { userId: 'u3', role: 'President', since: '2024-09-01', verificationStatus: 'verified' },
      { userId: 'f3', role: 'Faculty Adviser', since: '2023-09-01', verificationStatus: 'verified' },
    ],
    socialLinks: { instagram: '@nsu_culture' },
  },
  {
    id: 'c4',
    name: 'NSU Science Club',
    category: 'Science & Research',
    description: 'A space for curious minds across all scientific disciplines. We organize talks, lab visits, research presentations, and connect students with research opportunities.',
    objectives: 'Promote scientific inquiry, support undergraduate research, organize Science Fest, and build a cross-disciplinary science community.',
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=science&backgroundColor=14213D&radius=12',
    coverImage: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&h=400&fit=crop',
    institution: 'Northstar University',
    memberCount: 178,
    founded: '2016-03-20',
    verificationStatus: 'verified',
    isPublic: true,
    tags: ['Science', 'Research', 'Physics', 'Biology', 'Chemistry', 'Astronomy'],
    leadership: [
      { userId: 'u4', role: 'Vice President', since: '2025-01-01', verificationStatus: 'pending' },
      { userId: 'u2', role: 'Secretary', since: '2025-01-01', verificationStatus: 'verified' },
    ],
    socialLinks: {},
  },
  {
    id: 'c5',
    name: 'NSU Entrepreneurship Cell',
    category: 'Entrepreneurship',
    description: 'Nurturing the next generation of founders. We connect aspiring entrepreneurs with mentors, investors, and fellow builders.',
    objectives: 'Run startup bootcamps, organize pitch competitions, facilitate mentorship, and support early-stage student ventures.',
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=ecell&backgroundColor=16803D&radius=12',
    coverImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&h=400&fit=crop',
    institution: 'Northstar University',
    memberCount: 156,
    founded: '2020-09-01',
    verificationStatus: 'verified',
    isPublic: true,
    tags: ['Startups', 'Entrepreneurship', 'Innovation', 'Pitching', 'Mentorship'],
    leadership: [
      { userId: 'u1', role: 'Co-Lead', since: '2025-01-01', verificationStatus: 'verified' },
      { userId: 'u3', role: 'Event Coordinator', since: '2025-01-01', verificationStatus: 'verified' },
      { userId: 'f3', role: 'Faculty Adviser', since: '2024-01-01', verificationStatus: 'verified' },
    ],
    socialLinks: { instagram: '@nsu_ecell' },
  },
  {
    id: 'c6',
    name: 'NSU Finance & Investment Club',
    category: 'Finance',
    description: 'Where students learn the language of markets. We run investment simulation games, workshops, and connect with industry professionals.',
    objectives: 'Educate members on personal finance and investing, run stock pitch competitions, organize finance talks, and build a portfolio showcase.',
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=finance&backgroundColor=5146E5&radius=12',
    coverImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=400&fit=crop',
    institution: 'Northstar University',
    memberCount: 134,
    founded: '2021-01-15',
    verificationStatus: 'verified',
    isPublic: true,
    tags: ['Finance', 'Investing', 'Fintech', 'Economics', 'Stock Market'],
    leadership: [
      { userId: 'u6', role: 'President', since: '2025-01-01', verificationStatus: 'verified' },
      { userId: 'f3', role: 'Faculty Adviser', since: '2024-09-01', verificationStatus: 'verified' },
    ],
    socialLinks: { linkedIn: 'linkedin.com/company/nsu-finance' },
  },
  {
    id: 'c7',
    name: 'NSU Debate Society',
    category: 'Debate & Public Speaking',
    description: 'One of the oldest and most decorated clubs at Northstar. We train speakers, host inter-university debates, and compete nationally.',
    objectives: 'Develop public speaking and critical thinking skills, organize internal and external debate competitions, and represent NSU in national circuits.',
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=debate&backgroundColor=0F9D8A&radius=12',
    coverImage: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?w=1200&h=400&fit=crop',
    institution: 'Northstar University',
    memberCount: 89,
    founded: '2012-01-01',
    verificationStatus: 'verified',
    isPublic: true,
    tags: ['Debate', 'Public Speaking', 'Critical Thinking', 'Law', 'MUN'],
    leadership: [
      { userId: 'u7', role: 'President', since: '2025-01-01', verificationStatus: 'verified' },
    ],
    socialLinks: { instagram: '@nsu_debate' },
  },
  {
    id: 'c8',
    name: 'Northstar Photography Collective',
    category: 'Arts & Media',
    description: 'A creative community for photographers, visual artists, and storytellers at Northstar University.',
    objectives: 'Organize photo walks, exhibitions, workshops, and build a campus visual archive.',
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=photo&backgroundColor=B7791F&radius=12',
    coverImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&h=400&fit=crop',
    institution: 'Northstar University',
    memberCount: 67,
    founded: '2023-02-01',
    verificationStatus: 'pending',
    isPublic: true,
    tags: ['Photography', 'Visual Arts', 'Media', 'Creative'],
    leadership: [
      { userId: 'u5', role: 'Founder', since: '2023-02-01', verificationStatus: 'pending' },
    ],
    socialLinks: { instagram: '@nsu_photos' },
  },
];

// ============================================================
// EVENTS
// ============================================================

export const DEMO_EVENTS: Event[] = [
  {
    id: 'e1',
    title: 'HackNorthstar 2026',
    description: 'The biggest 36-hour hackathon at Northstar University. Open to all students. Build something incredible with teams of 2–4. Prizes, workshops, mentors and industry judges.',
    coverImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&h=600&fit=crop',
    category: 'Technical',
    date: '2026-11-08',
    endDate: '2026-11-09',
    time: '18:00',
    venue: 'NSU Innovation Hub, Building C',
    isOnline: false,
    organizerId: 'c1',
    organizerType: 'club',
    institution: 'Northstar University',
    registrationDeadline: '2026-11-01',
    capacity: 300,
    registeredCount: 218,
    eligibility: 'All enrolled Northstar University students',
    isFeatured: true,
    tags: ['Hackathon', 'Technology', 'Innovation', 'Programming'],
    status: 'upcoming',
  },
  {
    id: 'e2',
    title: 'NSU Cultural Fusion Festival 2026',
    description: 'A celebration of the diverse cultures at Northstar University. Three days of performances, food, art installations, workshops, and stories.',
    coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=600&fit=crop',
    category: 'Cultural',
    date: '2026-11-14',
    endDate: '2026-11-16',
    time: '11:00',
    venue: 'NSU Main Quad and Amphitheatre',
    isOnline: false,
    organizerId: 'c3',
    organizerType: 'club',
    institution: 'Northstar University',
    registrationDeadline: '2026-11-10',
    registeredCount: 520,
    eligibility: 'Open to all. Students, faculty, staff and alumni welcome.',
    isFeatured: true,
    tags: ['Culture', 'Festival', 'Music', 'Dance', 'Food'],
    status: 'upcoming',
  },
  {
    id: 'e3',
    title: 'Robotics Workshop: Intro to ROS 2',
    description: 'A hands-on introductory workshop on the Robot Operating System 2 (ROS 2). Learn to build, simulate and control your first robot. Bring your laptop.',
    coverImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=600&fit=crop',
    category: 'Workshops',
    date: '2026-10-25',
    time: '10:00',
    venue: 'Engineering Lab E-204',
    isOnline: false,
    organizerId: 'c2',
    organizerType: 'club',
    institution: 'Northstar University',
    registrationDeadline: '2026-10-22',
    capacity: 40,
    registeredCount: 37,
    eligibility: 'Engineering and CS students preferred. Basic programming knowledge required.',
    isFeatured: false,
    tags: ['Robotics', 'Workshop', 'ROS', 'Programming'],
    status: 'upcoming',
  },
  {
    id: 'e4',
    title: 'Startup Pitch Night — Autumn 2026',
    description: 'Six student teams pitch their startup ideas to a panel of founders and investors. Open to all to watch. Networking reception follows.',
    coverImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&h=600&fit=crop',
    category: 'Competitions',
    date: '2026-10-30',
    time: '17:30',
    venue: 'NSU Business School Auditorium, Room A1',
    isOnline: false,
    organizerId: 'c5',
    organizerType: 'club',
    institution: 'Northstar University',
    registrationDeadline: '2026-10-28',
    capacity: 150,
    registeredCount: 98,
    eligibility: 'Open to all students, faculty and invited guests.',
    isFeatured: true,
    tags: ['Startups', 'Pitching', 'Entrepreneurship', 'Networking'],
    status: 'upcoming',
  },
  {
    id: 'e5',
    title: 'AI in Healthcare — Panel Discussion',
    description: 'A multidisciplinary discussion on the current state and future of AI applications in healthcare, featuring researchers and practitioners.',
    coverImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=600&fit=crop',
    category: 'Seminars',
    date: '2026-10-22',
    time: '14:00',
    venue: 'NSU Science Block Lecture Hall 3 and Online',
    isOnline: true,
    onlineLink: 'meet.northstar.edu/ai-healthcare-panel',
    organizerId: 'c1',
    organizerType: 'club',
    institution: 'Northstar University',
    registrationDeadline: '2026-10-21',
    registeredCount: 142,
    eligibility: 'Open to all students and faculty.',
    isFeatured: false,
    tags: ['AI', 'Healthcare', 'Panel', 'Seminar'],
    status: 'upcoming',
  },
  {
    id: 'e6',
    title: 'NSU Intramural Sports Day 2026',
    description: 'Annual inter-department sports competition. Events include football, basketball, badminton, and track. Register your department team.',
    coverImage: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&h=600&fit=crop',
    category: 'Sports',
    date: '2026-11-22',
    time: '08:00',
    venue: 'NSU Sports Complex',
    isOnline: false,
    organizerId: 'a1',
    organizerType: 'institution',
    institution: 'Northstar University',
    registrationDeadline: '2026-11-15',
    registeredCount: 310,
    eligibility: 'All enrolled Northstar University students.',
    isFeatured: false,
    tags: ['Sports', 'Football', 'Basketball', 'Athletics'],
    status: 'upcoming',
  },
  {
    id: 'e7',
    title: 'Finance & Markets Bootcamp',
    description: 'A 3-day intensive bootcamp covering equity research, financial modeling, and portfolio construction. Facilitated by finance professionals.',
    coverImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=600&fit=crop',
    category: 'Workshops',
    date: '2026-12-05',
    endDate: '2026-12-07',
    time: '09:00',
    venue: 'NSU Business School, Seminar Room B2',
    isOnline: false,
    organizerId: 'c6',
    organizerType: 'club',
    institution: 'Northstar University',
    registrationDeadline: '2026-11-30',
    capacity: 60,
    registeredCount: 28,
    eligibility: 'Economics, Business and Finance students preferred.',
    isFeatured: false,
    tags: ['Finance', 'Workshop', 'Investing', 'Bootcamp'],
    status: 'upcoming',
  },
  {
    id: 'e8',
    title: 'NSU Alumni Homecoming 2026',
    description: 'Join alumni from across the years for the annual Northstar University Homecoming weekend. Campus tours, reunions, talks and the traditional alumni dinner.',
    coverImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=600&fit=crop',
    category: 'Alumni Reunions',
    date: '2026-12-19',
    endDate: '2026-12-20',
    time: '10:00',
    venue: 'NSU Main Campus',
    isOnline: false,
    organizerId: 'a1',
    organizerType: 'institution',
    institution: 'Northstar University',
    registrationDeadline: '2026-12-10',
    registeredCount: 185,
    eligibility: 'Open to all Northstar University alumni and graduating students.',
    isFeatured: true,
    tags: ['Alumni', 'Homecoming', 'Reunion', 'Networking'],
    status: 'upcoming',
  },
  {
    id: 'e9',
    title: 'Open Mic Night — Stories & Sound',
    description: 'Share your poetry, music, spoken word or comedy with the campus community. All skill levels welcome. A safe and supportive space.',
    coverImage: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1200&h=600&fit=crop',
    category: 'Cultural',
    date: '2026-10-24',
    time: '19:00',
    venue: 'NSU Student Centre, Rooftop Lounge',
    isOnline: false,
    organizerId: 'c3',
    organizerType: 'club',
    institution: 'Northstar University',
    registrationDeadline: '2026-10-23',
    capacity: 80,
    registeredCount: 61,
    eligibility: 'Open to all Northstar students and faculty.',
    isFeatured: false,
    tags: ['Music', 'Poetry', 'Open Mic', 'Community'],
    status: 'upcoming',
  },
  {
    id: 'e10',
    title: 'Inter-University Debate Championship',
    description: 'NSU hosts teams from 12 universities for the annual inter-university parliamentary debate championship. Round-robin followed by knockout stages.',
    coverImage: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?w=1200&h=600&fit=crop',
    category: 'Competitions',
    date: '2026-11-28',
    endDate: '2026-11-29',
    time: '09:00',
    venue: 'NSU Law Faculty, Moot Court',
    isOnline: false,
    organizerId: 'c7',
    organizerType: 'club',
    institution: 'Northstar University',
    registrationDeadline: '2026-11-15',
    registeredCount: 96,
    eligibility: 'NSU students and registered teams from partner universities.',
    isFeatured: false,
    tags: ['Debate', 'Competition', 'Inter-University', 'Law'],
    status: 'upcoming',
  },
];

// ============================================================
// POSTS
// ============================================================

export const DEMO_POSTS: Post[] = [
  {
    id: 'p1',
    authorId: 'a1',
    authorType: 'user',
    content: '📢 Official Announcement: We are excited to welcome Koinelio as the official campus community platform for Northstar University, effective from today. Use Koinelio to discover clubs, register for events, and connect with your campus community. For questions, contact studentaffairs@northstar.edu.',
    type: 'announcement',
    isOfficial: true,
    likes: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7'],
    comments: [
      { id: 'cm1', authorId: 'u1', content: 'So excited for this! TechSpark will definitely be posting updates here.', createdAt: '2026-10-15T08:30:00Z', likes: ['u2', 'u3'] },
      { id: 'cm2', authorId: 'u3', content: 'Finally a proper platform for NSU! Can\'t wait to post about Cultural Fest.', createdAt: '2026-10-15T09:00:00Z', likes: ['u1'] },
    ],
    savedBy: ['u1', 'u5'],
    createdAt: '2026-10-15T08:00:00Z',
  },
  {
    id: 'p2',
    authorId: 'c1',
    authorType: 'club',
    content: '🚀 HackNorthstar 2026 registrations are now OPEN! This is our biggest hackathon yet — 36 hours, ₦500K in prizes, and mentors from Google, Microsoft and Stripe. Teams of 2–4. All departments welcome.\n\nTheme reveal on opening night!\n\n👉 Register now via the Events tab. Deadline: November 1st.',
    type: 'event',
    isOfficial: false,
    likes: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u8', 'al1'],
    comments: [
      { id: 'cm3', authorId: 'u2', content: 'RoboNSU is fielding a team for the hardware track! LFG 🔥', createdAt: '2026-10-14T15:00:00Z', likes: ['u1', 'u8'] },
      { id: 'cm4', authorId: 'u8', content: 'Amazing! Graduate students are eligible too right?', createdAt: '2026-10-14T15:30:00Z', likes: ['u1'] },
      { id: 'cm5', authorId: 'u1', content: '@Leo yes! All enrolled students. Grad and undergrad alike.', createdAt: '2026-10-14T15:35:00Z', likes: ['u8', 'u2'] },
    ],
    savedBy: ['u2', 'u4', 'u8'],
    createdAt: '2026-10-14T14:00:00Z',
    clubId: 'c1',
    eventId: 'e1',
  },
  {
    id: 'p3',
    authorId: 'u1',
    authorType: 'user',
    content: 'Just finished reading the new paper on diffusion models from the Google DeepMind team. If anyone wants to discuss over coffee this week, drop a comment! Also sharing my notes in the TechSpark resources channel. 📚',
    type: 'general',
    isOfficial: false,
    likes: ['u8', 'f1', 'u4', 'u5'],
    comments: [
      { id: 'cm6', authorId: 'f1', content: 'Happy to join that discussion, Aisha! Great paper. Ping me on your calendar.', createdAt: '2026-10-13T10:00:00Z', likes: ['u1', 'u8'] },
      { id: 'cm7', authorId: 'u8', content: 'I\'m in! Wednesday afternoon works for me.', createdAt: '2026-10-13T10:15:00Z', likes: [] },
    ],
    savedBy: ['u8', 'f1'],
    createdAt: '2026-10-13T09:00:00Z',
  },
  {
    id: 'p4',
    authorId: 'u3',
    authorType: 'user',
    content: '🌏 Cultural Fusion Festival is 4 weeks away and we are finalising our line-up! We have performances from 22 cultural groups, a global food market, and a student art exhibition. Volunteers needed for logistics — DM me or comment below. This is going to be unforgettable. ✨',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=450&fit=crop',
    type: 'event',
    isOfficial: false,
    likes: ['u1', 'u5', 'u7', 'u6', 'al3', 'f3'],
    comments: [
      { id: 'cm8', authorId: 'u5', content: 'I can help with the design of signage and banners! Let\'s connect this week.', createdAt: '2026-10-12T12:00:00Z', likes: ['u3'] },
      { id: 'cm9', authorId: 'al3', content: 'Looking forward to attending as an alumna! The 2022 festival was magical.', createdAt: '2026-10-12T13:00:00Z', likes: ['u3', 'u5'] },
    ],
    savedBy: ['u1', 'u7'],
    createdAt: '2026-10-12T11:30:00Z',
  },
  {
    id: 'p5',
    authorId: 'u2',
    authorType: 'user',
    content: '🤖 RoboNSU just placed 2nd at the West Africa Robotics Championship! Our autonomous navigation system outperformed 15 other universities. Incredibly proud of this team. Special thanks to Prof. Adeyemi for 3 months of late-night lab sessions.',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=450&fit=crop',
    type: 'achievement',
    isOfficial: false,
    likes: ['u1', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'f1', 'f2', 'f3', 'a1', 'al1', 'al2'],
    comments: [
      { id: 'cm10', authorId: 'f2', content: 'I could not be more proud of this team. This result is a testament to their dedication and brilliance. Well done, all of you.', createdAt: '2026-10-11T09:00:00Z', likes: ['u2', 'u1', 'u3', 'u4'] },
      { id: 'cm11', authorId: 'al2', content: 'As the founder of RoboNSU, this moment means the world to me. You\'ve taken it to another level!', createdAt: '2026-10-11T09:30:00Z', likes: ['u2', 'f2', 'u1'] },
    ],
    savedBy: ['f2', 'a1', 'al2'],
    createdAt: '2026-10-11T08:30:00Z',
  },
  {
    id: 'p6',
    authorId: 'f1',
    authorType: 'user',
    content: 'Exciting news for CS students: applications are open for the 2027 NSU Undergraduate Research Programme in AI and Machine Learning. Work directly with faculty on published research. Stipend available. Applications close 15 November.\n\nDetails on the department notice board and I\'ll share the full brief at the next TechSpark meeting.',
    type: 'announcement',
    isOfficial: true,
    likes: ['u1', 'u8', 'u4', 'u5'],
    comments: [
      { id: 'cm12', authorId: 'u1', content: 'Already working on my application! This is a wonderful opportunity for junior students.', createdAt: '2026-10-10T14:00:00Z', likes: ['f1'] },
    ],
    savedBy: ['u1', 'u8', 'u4'],
    createdAt: '2026-10-10T13:00:00Z',
  },
  {
    id: 'p7',
    authorId: 'u6',
    authorType: 'user',
    content: '📈 NSU Finance Club is launching our first ever Student Investment Portfolio — a simulated investment fund managed entirely by students. We\'ll track performance against the index, publish monthly reports, and invite guest analysts. Applications to join the investment committee open now.',
    type: 'general',
    isOfficial: false,
    likes: ['u3', 'u7', 'al3', 'f3'],
    comments: [
      { id: 'cm13', authorId: 'al3', content: 'This is a fantastic initiative! Wish we had this when I was a student. The experience is invaluable.', createdAt: '2026-10-09T16:00:00Z', likes: ['u6'] },
    ],
    savedBy: ['u3', 'al3'],
    createdAt: '2026-10-09T15:00:00Z',
    clubId: 'c6',
  },
  {
    id: 'p8',
    authorId: 'al1',
    authorType: 'user',
    content: 'Alumni perspective: I graduated from NSU CS in 2022 and I\'m now a Senior Engineer at Stripe. The single most valuable thing I did at NSU was get deeply involved in TechSpark. The projects, the competitions, the network — it all translated directly to my career.\n\nIf you\'re a student reading this: show up. Build things. Help others. That\'s the whole game.',
    type: 'alumni',
    isOfficial: false,
    likes: ['u1', 'u2', 'u3', 'u4', 'u5', 'u8', 'f1'],
    comments: [
      { id: 'cm14', authorId: 'u1', content: 'This is so inspiring, Chioma! You\'re one of the reasons I got involved with TechSpark.', createdAt: '2026-10-08T11:00:00Z', likes: ['al1', 'u5'] },
      { id: 'cm15', authorId: 'u8', content: 'Gold advice. Printing this.', createdAt: '2026-10-08T11:30:00Z', likes: ['u1', 'al1'] },
    ],
    savedBy: ['u1', 'u3', 'u5', 'u8'],
    createdAt: '2026-10-08T10:00:00Z',
  },
  {
    id: 'p9',
    authorId: 'u7',
    authorType: 'user',
    content: '❓ Discussion: With AI-generated content becoming mainstream, how should universities update their academic integrity policies? I\'m working on a paper on this and would love perspectives from across departments. CS, Law, Education — all views welcome.',
    type: 'question',
    isOfficial: false,
    likes: ['u1', 'f1', 'u8', 'u4'],
    comments: [
      { id: 'cm16', authorId: 'f1', content: 'Great question. I\'d argue we need a nuanced approach that distinguishes between using AI as a thinking tool vs. AI as a substitute for thinking. Happy to share some resources.', createdAt: '2026-10-07T14:00:00Z', likes: ['u7', 'u1', 'u8'] },
      { id: 'cm17', authorId: 'u8', content: 'From a CS perspective, detection is unreliable and adversarial. Policy has to focus on outcomes and assessment design, not policing tools.', createdAt: '2026-10-07T14:30:00Z', likes: ['u7', 'f1'] },
    ],
    savedBy: ['f1', 'u1'],
    createdAt: '2026-10-07T13:00:00Z',
  },
  {
    id: 'p10',
    authorId: 'u5',
    authorType: 'user',
    content: '🎨 Presenting my final year project: "Invisible Architectures" — a generative art installation exploring urban spaces through data visualization. The system pulls live public transit data and maps it into an evolving visual canvas.\n\nShowing at the Design Faculty Open Studio on Nov 5th. Everyone welcome.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=450&fit=crop',
    type: 'project',
    isOfficial: false,
    likes: ['u1', 'u3', 'u7', 'f1', 'al1'],
    comments: [
      { id: 'cm18', authorId: 'u1', content: 'Sofia this is STUNNING. The data integration alone is such a brilliant idea.', createdAt: '2026-10-06T10:00:00Z', likes: ['u5'] },
    ],
    savedBy: ['u1', 'u3'],
    createdAt: '2026-10-06T09:00:00Z',
  },
];

// ============================================================
// NOTIFICATIONS
// ============================================================

export const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    userId: 'u1',
    type: 'comment',
    title: 'Dr. Eleanor Voss commented on your post',
    message: '"Happy to join that discussion, Aisha! Great paper. Ping me on your calendar."',
    isRead: false,
    createdAt: '2026-10-13T10:00:00Z',
    actorId: 'f1',
  },
  {
    id: 'n2',
    userId: 'u1',
    type: 'like',
    title: 'Leo Martinez and 3 others liked your post',
    message: 'Your post about diffusion models is getting attention!',
    isRead: false,
    createdAt: '2026-10-13T10:30:00Z',
    actorId: 'u8',
  },
  {
    id: 'n3',
    userId: 'u1',
    type: 'membership_decision',
    title: 'Jordan Osei has requested to join TechSpark NSU',
    message: 'A new membership request is awaiting review. Review it in your club dashboard.',
    isRead: false,
    createdAt: '2026-10-14T09:00:00Z',
    actorId: 'u4',
    actionUrl: '/clubs/c1/dashboard',
  },
  {
    id: 'n4',
    userId: 'u1',
    type: 'event_reminder',
    title: 'Reminder: AI in Healthcare Panel Discussion',
    message: 'The event is tomorrow at 2:00 PM in Lecture Hall 3.',
    isRead: true,
    createdAt: '2026-10-21T09:00:00Z',
    actionUrl: '/events/e5',
  },
  {
    id: 'n5',
    userId: 'u1',
    type: 'announcement',
    title: 'Official: Koinelio launched at Northstar University',
    message: 'James Whitfield (Dean of Student Affairs) posted an official announcement.',
    isRead: true,
    createdAt: '2026-10-15T08:00:00Z',
    actorId: 'a1',
  },
  {
    id: 'n6',
    userId: 'u1',
    type: 'verification',
    title: 'Your TechSpark President role has been verified',
    message: 'The institution has verified your leadership position at TechSpark NSU.',
    isRead: true,
    createdAt: '2026-10-01T10:00:00Z',
    actionUrl: '/profile/u1',
  },
  {
    id: 'n7',
    userId: 'u1',
    type: 'registration',
    title: 'Registration confirmed: HackNorthstar 2026',
    message: 'You are registered for HackNorthstar 2026 on November 8–9. See you there!',
    isRead: true,
    createdAt: '2026-10-05T14:00:00Z',
    actionUrl: '/events/e1',
  },
];

// ============================================================
// MEMBERSHIP REQUESTS
// ============================================================

export const DEMO_MEMBERSHIP_REQUESTS: MembershipRequest[] = [
  {
    id: 'mr1',
    userId: 'u4',
    clubId: 'c1',
    status: 'pending',
    requestedAt: '2026-10-14T09:00:00Z',
    message: 'Hi! I\'m Jordan, a physics student interested in computational physics and AI. Would love to be part of TechSpark!',
  },
  {
    id: 'mr2',
    userId: 'u7',
    clubId: 'c1',
    status: 'pending',
    requestedAt: '2026-10-13T14:00:00Z',
    message: 'Law student here, interested in tech policy and legal tech. Would love to contribute to TechSpark\'s community.',
  },
  {
    id: 'mr3',
    userId: 'u6',
    clubId: 'c1',
    status: 'approved',
    requestedAt: '2026-09-20T10:00:00Z',
    decidedAt: '2026-09-22T10:00:00Z',
  },
];

// ============================================================
// DEMO SESSION USERS (for switching demo modes)
// ============================================================

export const DEMO_SESSION_USERS = [
  { id: 'u1', label: 'Aisha Nwosu — Student & Club President', role: 'student' as UserRole },
  { id: 'u2', label: 'Marcus Chen — Student & Club President', role: 'student' as UserRole },
  { id: 'f1', label: 'Dr. Eleanor Voss — Faculty', role: 'faculty' as UserRole },
  { id: 'a1', label: 'James Whitfield — Administrator', role: 'admin' as UserRole },
  { id: 'al1', label: 'Chioma Eze — Alumni', role: 'alumni' as UserRole },
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
  const now = new Date('2026-10-15T16:00:00Z');
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
