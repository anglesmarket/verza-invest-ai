import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';
import User from '../src/models/User';
import Startup from '../src/models/Startup';
import Investment from '../src/models/Investment';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable inside .env');
  process.exit(1);
}

// Entrepreneur users to own the startups
const ENTREPRENEURS = [
  {
    name: "Sarah Chen",
    email: "sarah@ecotech.example.com",
    password: "password123",
    roles: ["entrepreneur"],
    entrepreneurProfile: {
      bio: { en: "Serial entrepreneur with 10+ years in cleantech", fa: "" },
      expertise: ["CleanTech", "Sustainability", "IoT"],
    },
  },
  {
    name: "Dr. Amir Patel",
    email: "amir@healthai.example.com",
    password: "password123",
    roles: ["entrepreneur"],
    entrepreneurProfile: {
      bio: { en: "Healthcare AI researcher turned founder", fa: "" },
      expertise: ["HealthTech", "AI", "Machine Learning"],
    },
  },
  {
    name: "Maria Rodriguez",
    email: "maria@eduflow.example.com",
    password: "password123",
    roles: ["entrepreneur"],
    entrepreneurProfile: {
      bio: { en: "Former educator passionate about edtech innovation", fa: "" },
      expertise: ["EdTech", "E-Learning"],
    },
  },
  {
    name: "James Wilson",
    email: "james@finsync.example.com",
    password: "password123",
    roles: ["entrepreneur"],
    entrepreneurProfile: {
      bio: { en: "Fintech veteran with Goldman Sachs background", fa: "" },
      expertise: ["FinTech", "Payments", "Blockchain"],
    },
  },
  {
    name: "Li Zhang",
    email: "li@agridrone.example.com",
    password: "password123",
    roles: ["entrepreneur"],
    entrepreneurProfile: {
      bio: { en: "Drone engineer and precision agriculture expert", fa: "" },
      expertise: ["AgriTech", "Drones", "Robotics"],
    },
  },
];

// Investor users
const INVESTORS = [
  {
    name: "Alex Johnson",
    email: "alex.investor@example.com",
    password: "password123",
    roles: ["investor"],
    investorProfile: {
      bio: { en: "Angel investor focused on early-stage startups", fa: "" },
      preferences: { industries: ["CleanTech", "HealthTech"], minInvestment: 1000, maxInvestment: 50000 },
    },
  },
  {
    name: "Priya Sharma",
    email: "priya.investor@example.com",
    password: "password123",
    roles: ["investor"],
    investorProfile: {
      bio: { en: "VC partner at TechVentures Capital", fa: "" },
      preferences: { industries: ["FinTech", "EdTech"], minInvestment: 5000, maxInvestment: 100000 },
    },
  },
  {
    name: "Michael Brown",
    email: "michael.investor@example.com",
    password: "password123",
    roles: ["investor"],
    investorProfile: {
      bio: { en: "Retired tech executive turned angel investor", fa: "" },
      preferences: { industries: ["SaaS", "AI"], minInvestment: 2000, maxInvestment: 25000 },
    },
  },
];

const STARTUPS = [
  {
    basicInfo: {
      name: { en: "EcoTech Solutions", fa: "اکوتک سولوشنز" },
      tagline: { en: "Revolutionizing sustainable energy for smart cities", fa: "انقلاب در انرژی پایدار شهرهای هوشمند" },
      logo: "",
      industry: "CleanTech",
      location: "San Francisco, CA",
      foundedDate: new Date("2023-03-15"),
      website: "https://ecotech.example.com",
      socialLinks: { linkedin: "https://linkedin.com/company/ecotech", twitter: "https://twitter.com/ecotech" },
    },
    pitch: {
      problem: { en: "Cities waste 40% of energy through outdated infrastructure. Municipal energy systems are inefficient, expensive, and contribute significantly to carbon emissions.", fa: "" },
      solution: { en: "Our smart energy grid technology uses IoT sensors and AI to optimize energy distribution in real-time, cutting waste by up to 40% while reducing costs for municipalities.", fa: "" },
      valueProposition: { en: "Save cities millions in energy costs while achieving carbon neutrality goals 10 years faster.", fa: "" },
      businessModel: { en: "SaaS licensing to municipalities with hardware integration fees. Recurring annual contracts averaging $500K per city.", fa: "" },
    },
    team: {
      founders: [{ name: "Sarah Chen", role: "CEO", bio: "10+ years in cleantech, ex-Tesla energy division" }],
      teamSize: 18,
      keyMembers: [{ name: "Tom Davis", role: "CTO", bio: "PhD in Smart Grid Systems from MIT" }],
    },
    funding: { goal: 500000, raised: 325000, stage: "Series A", minimumInvestment: 1000 },
    status: "approved",
    metrics: { viewCount: 1240, investorInterest: 48 },
  },
  {
    basicInfo: {
      name: { en: "HealthAI", fa: "هلث‌ای‌آی" },
      tagline: { en: "AI-powered personalized healthcare diagnostics", fa: "تشخیص پزشکی شخصی‌سازی‌شده با هوش مصنوعی" },
      logo: "",
      industry: "HealthTech",
      location: "Boston, MA",
      foundedDate: new Date("2022-08-01"),
      website: "https://healthai.example.com",
      socialLinks: { linkedin: "https://linkedin.com/company/healthai" },
    },
    pitch: {
      problem: { en: "Diagnostic errors affect 12 million Americans annually. Doctors are overwhelmed with data and lack AI-assisted tools to make faster, more accurate diagnoses.", fa: "" },
      solution: { en: "Our platform analyzes patient data in real-time using proprietary ML models, providing doctors with accurate, actionable insights that reduce diagnostic time by 60%.", fa: "" },
      valueProposition: { en: "Improve patient outcomes by 35% while reducing healthcare costs per diagnosis by $2,000.", fa: "" },
      businessModel: { en: "Per-diagnosis SaaS fee to hospitals and clinics. Enterprise licensing for health systems. Currently serving 45 hospitals.", fa: "" },
    },
    team: {
      founders: [{ name: "Dr. Amir Patel", role: "CEO", bio: "Harvard Medical School + Stanford CS" }],
      teamSize: 25,
      keyMembers: [{ name: "Dr. Lisa Wang", role: "Chief Medical Officer", bio: "15 years clinical practice" }],
    },
    funding: { goal: 750000, raised: 520000, stage: "Series A", minimumInvestment: 2000 },
    status: "approved",
    metrics: { viewCount: 2100, investorInterest: 62 },
  },
  {
    basicInfo: {
      name: { en: "EduFlow", fa: "ادوفلو" },
      tagline: { en: "Interactive learning platform for the next generation", fa: "پلتفرم یادگیری تعاملی برای نسل آینده" },
      logo: "",
      industry: "EdTech",
      location: "Austin, TX",
      foundedDate: new Date("2023-01-10"),
      website: "https://eduflow.example.com",
    },
    pitch: {
      problem: { en: "Traditional e-learning has a 90% dropout rate. Students lack engagement and personalized learning paths.", fa: "" },
      solution: { en: "Gamified, AI-adaptive learning platform that adjusts to each student's pace and learning style. Our engagement rates are 5x industry average.", fa: "" },
      valueProposition: { en: "Increase course completion rates from 10% to 78% with personalized AI-driven learning paths.", fa: "" },
      businessModel: { en: "B2B SaaS for schools and universities. B2C freemium model with premium content subscriptions.", fa: "" },
    },
    team: {
      founders: [{ name: "Maria Rodriguez", role: "CEO", bio: "Former high school teacher, Stanford MBA" }],
      teamSize: 12,
    },
    funding: { goal: 300000, raised: 280000, stage: "Seed", minimumInvestment: 500 },
    status: "approved",
    metrics: { viewCount: 890, investorInterest: 35 },
  },
  {
    basicInfo: {
      name: { en: "FinSync", fa: "فین‌سینک" },
      tagline: { en: "Seamless financial management for small businesses", fa: "مدیریت مالی یکپارچه برای کسب‌وکارهای کوچک" },
      logo: "",
      industry: "FinTech",
      location: "New York, NY",
      foundedDate: new Date("2022-05-20"),
      website: "https://finsync.example.com",
      socialLinks: { linkedin: "https://linkedin.com/company/finsync", twitter: "https://twitter.com/finsync" },
    },
    pitch: {
      problem: { en: "60% of small businesses fail due to poor financial management. Existing tools are complex and designed for enterprises.", fa: "" },
      solution: { en: "One-click financial dashboard that auto-syncs with banks, generates tax reports, and provides cash flow predictions using AI.", fa: "" },
      valueProposition: { en: "Save small business owners 10+ hours/week on bookkeeping while reducing accounting errors by 95%.", fa: "" },
      businessModel: { en: "Monthly SaaS subscription tiers: Starter ($29/mo), Growth ($79/mo), Enterprise ($199/mo). 85% gross margins.", fa: "" },
    },
    team: {
      founders: [{ name: "James Wilson", role: "CEO", bio: "Ex-Goldman Sachs VP, 12 years in fintech" }],
      teamSize: 20,
      keyMembers: [{ name: "Rachel Kim", role: "CPO", bio: "Ex-Stripe product lead" }],
    },
    funding: { goal: 600000, raised: 410000, stage: "Series A", minimumInvestment: 1000 },
    status: "approved",
    metrics: { viewCount: 1560, investorInterest: 54 },
  },
  {
    basicInfo: {
      name: { en: "AgriDrone", fa: "اگری‌درون" },
      tagline: { en: "Autonomous drones optimizing agricultural yield", fa: "پهپادهای خودکار برای بهینه‌سازی بازده کشاورزی" },
      logo: "",
      industry: "AgriTech",
      location: "Denver, CO",
      foundedDate: new Date("2023-06-01"),
      website: "https://agridrone.example.com",
    },
    pitch: {
      problem: { en: "Farmers lose $20B annually to crop diseases detected too late. Manual field inspection covers only 5% of farmland.", fa: "" },
      solution: { en: "Fleet of AI-powered drones that scan entire farms daily, detecting diseases, pests, and irrigation issues with 98% accuracy before visible symptoms appear.", fa: "" },
      valueProposition: { en: "Increase crop yield by 25% while reducing pesticide use by 40% through precision agriculture.", fa: "" },
      businessModel: { en: "Hardware sales + per-acre monthly monitoring subscription. Average contract $15K/year per farm.", fa: "" },
    },
    team: {
      founders: [{ name: "Li Zhang", role: "CEO", bio: "Drone engineer, ex-DJI R&D lead" }],
      teamSize: 14,
    },
    funding: { goal: 450000, raised: 195000, stage: "Seed", minimumInvestment: 1000 },
    status: "approved",
    metrics: { viewCount: 670, investorInterest: 28 },
  },
  {
    basicInfo: {
      name: { en: "SpaceLog", fa: "اسپیس‌لاگ" },
      tagline: { en: "Blockchain-powered supply chain transparency", fa: "شفافیت زنجیره تامین مبتنی بر بلاکچین" },
      logo: "",
      industry: "Logistics",
      location: "Seattle, WA",
      foundedDate: new Date("2022-02-14"),
      website: "https://spacelog.example.com",
      socialLinks: { linkedin: "https://linkedin.com/company/spacelog" },
    },
    pitch: {
      problem: { en: "Supply chain fraud costs the global economy $2T annually. Companies lack real-time visibility into product provenance and handling.", fa: "" },
      solution: { en: "Blockchain-based tracking platform that creates an immutable record of every touchpoint in a product's journey from manufacturer to consumer.", fa: "" },
      valueProposition: { en: "Reduce supply chain fraud by 90% and cut verification time from weeks to seconds.", fa: "" },
      businessModel: { en: "Enterprise SaaS with per-transaction fees. Average enterprise contract $200K/year.", fa: "" },
    },
    team: {
      founders: [{ name: "David Park", role: "CEO", bio: "Ex-Amazon supply chain, blockchain researcher" }],
      teamSize: 22,
      keyMembers: [{ name: "Elena Volkov", role: "VP Engineering", bio: "Ethereum core contributor" }],
    },
    funding: { goal: 800000, raised: 650000, stage: "Series A", minimumInvestment: 2000 },
    status: "approved",
    metrics: { viewCount: 1890, investorInterest: 71 },
  },
  {
    basicInfo: {
      name: { en: "CyberShield", fa: "سایبرشیلد" },
      tagline: { en: "Next-gen cybersecurity for remote-first companies", fa: "امنیت سایبری نسل بعد برای شرکت‌های ریموت" },
      logo: "",
      industry: "CyberSecurity",
      location: "Tel Aviv, Israel",
      foundedDate: new Date("2023-02-28"),
      website: "https://cybershield.example.com",
    },
    pitch: {
      problem: { en: "Remote work increased cyberattacks by 300%. Traditional perimeter security doesn't work when employees are everywhere.", fa: "" },
      solution: { en: "Zero-trust security platform built for distributed teams. AI-powered threat detection with 99.9% accuracy and sub-second response time.", fa: "" },
      valueProposition: { en: "Eliminate 99% of remote work security breaches at 1/3 the cost of traditional enterprise security.", fa: "" },
      businessModel: { en: "Per-seat monthly subscription. Currently 200+ enterprise customers with 95% renewal rate.", fa: "" },
    },
    team: {
      founders: [{ name: "Yael Goldstein", role: "CEO", bio: "Ex-IDF Cyber Unit 8200, MIT CS" }],
      teamSize: 30,
    },
    funding: { goal: 1000000, raised: 720000, stage: "Series B", minimumInvestment: 5000 },
    status: "approved",
    metrics: { viewCount: 3200, investorInterest: 85 },
  },
  {
    basicInfo: {
      name: { en: "NutriGenome", fa: "نوتری‌ژنوم" },
      tagline: { en: "DNA-based personalized nutrition plans", fa: "برنامه تغذیه شخصی‌سازی‌شده مبتنی بر DNA" },
      logo: "",
      industry: "BioTech",
      location: "San Diego, CA",
      foundedDate: new Date("2023-09-01"),
      website: "https://nutrigenome.example.com",
    },
    pitch: {
      problem: { en: "Generic diet plans fail 85% of people. Nutrition is highly individual but current advice ignores genetic differences.", fa: "" },
      solution: { en: "At-home DNA test kit + AI platform that creates hyper-personalized meal plans based on genetic markers, microbiome data, and health goals.", fa: "" },
      valueProposition: { en: "3x better health outcomes than generic diets with scientifically-backed, personalized nutrition.", fa: "" },
      businessModel: { en: "DNA kit sales ($149) + monthly meal plan subscription ($29/mo). 60% of kit buyers convert to subscription.", fa: "" },
    },
    team: {
      founders: [{ name: "Dr. Sophia Martinez", role: "CEO", bio: "PhD Nutritional Genomics, UCSD" }],
      teamSize: 10,
    },
    funding: { goal: 350000, raised: 125000, stage: "Seed", minimumInvestment: 500 },
    status: "approved",
    metrics: { viewCount: 520, investorInterest: 19 },
  },
  {
    basicInfo: {
      name: { en: "UrbanPark", fa: "اربن‌پارک" },
      tagline: { en: "Smart parking solutions for congested cities", fa: "راه‌حل‌های پارکینگ هوشمند برای شهرهای شلوغ" },
      logo: "",
      industry: "Smart City",
      location: "Los Angeles, CA",
      foundedDate: new Date("2022-11-15"),
      website: "https://urbanpark.example.com",
    },
    pitch: {
      problem: { en: "Drivers spend 17 hours/year searching for parking, causing $345B in wasted time, fuel, and emissions globally.", fa: "" },
      solution: { en: "IoT sensor network + mobile app that shows real-time parking availability, enables reservations, and optimizes city parking flow.", fa: "" },
      valueProposition: { en: "Reduce parking search time by 80% and cut urban traffic congestion by 30%.", fa: "" },
      businessModel: { en: "B2B SaaS to parking operators + B2C premium app subscriptions. Revenue share with municipalities.", fa: "" },
    },
    team: {
      founders: [{ name: "Carlos Rivera", role: "CEO", bio: "Urban planning PhD, ex-Waze product team" }],
      teamSize: 15,
    },
    funding: { goal: 400000, raised: 210000, stage: "Seed", minimumInvestment: 1000 },
    status: "approved",
    metrics: { viewCount: 780, investorInterest: 32 },
  },
];

// Seed investments to link investors to startups
function generateInvestments(investorIds: string[], startupMap: Map<string, string>) {
  const investments: any[] = [];
  
  // Alex invests in EcoTech and HealthAI
  const alexId = investorIds[0];
  const priyaId = investorIds[1];
  const michaelId = investorIds[2];
  
  const ecotech = startupMap.get("EcoTech Solutions");
  const healthai = startupMap.get("HealthAI");
  const eduflow = startupMap.get("EduFlow");
  const finsync = startupMap.get("FinSync");
  const agridrone = startupMap.get("AgriDrone");
  const spacelog = startupMap.get("SpaceLog");
  const cybershield = startupMap.get("CyberShield");

  if (ecotech && alexId) {
    investments.push({ investor: alexId, startup: ecotech, amount: 8000, status: "confirmed", confirmedAt: new Date("2025-06-15") });
    investments.push({ investor: priyaId, startup: ecotech, amount: 15000, status: "confirmed", confirmedAt: new Date("2025-07-02") });
  }
  if (healthai) {
    investments.push({ investor: alexId, startup: healthai, amount: 7000, status: "confirmed", confirmedAt: new Date("2025-05-20") });
    investments.push({ investor: michaelId, startup: healthai, amount: 10000, status: "confirmed", confirmedAt: new Date("2025-08-10") });
  }
  if (eduflow) {
    investments.push({ investor: priyaId, startup: eduflow, amount: 12000, status: "confirmed", confirmedAt: new Date("2025-04-01") });
    investments.push({ investor: alexId, startup: eduflow, amount: 5000, status: "confirmed", confirmedAt: new Date("2025-09-15") });
  }
  if (finsync) {
    investments.push({ investor: priyaId, startup: finsync, amount: 20000, status: "confirmed", confirmedAt: new Date("2025-03-22") });
    investments.push({ investor: michaelId, startup: finsync, amount: 5000, status: "confirmed", confirmedAt: new Date("2025-07-19") });
  }
  if (agridrone) {
    investments.push({ investor: alexId, startup: agridrone, amount: 3000, status: "confirmed", confirmedAt: new Date("2025-10-01") });
  }
  if (spacelog) {
    investments.push({ investor: michaelId, startup: spacelog, amount: 8000, status: "confirmed", confirmedAt: new Date("2025-06-30") });
    investments.push({ investor: priyaId, startup: spacelog, amount: 25000, status: "confirmed", confirmedAt: new Date("2025-05-05") });
  }
  if (cybershield) {
    investments.push({ investor: michaelId, startup: cybershield, amount: 15000, status: "confirmed", confirmedAt: new Date("2025-08-22") });
    investments.push({ investor: alexId, startup: cybershield, amount: 10000, status: "confirmed", confirmedAt: new Date("2025-09-01") });
  }

  return investments;
}

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI as string);
    console.log('Connected!');

    // Clear existing startup-related data
    console.log('Clearing existing startup, investment data...');
    await Startup.deleteMany({});
    await Investment.deleteMany({});
    console.log('Cleared.');

    // Create entrepreneur users
    console.log('\nCreating entrepreneur users...');
    const entrepreneurIds: string[] = [];
    for (const userData of ENTREPRENEURS) {
      await User.deleteOne({ email: userData.email });
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = await User.create({ ...userData, password: hashedPassword });
      entrepreneurIds.push(user._id.toString());
      console.log(`  ✓ ${userData.name} (${userData.email})`);
    }

    // Create investor users
    console.log('\nCreating investor users...');
    const investorIds: string[] = [];
    for (const userData of INVESTORS) {
      await User.deleteOne({ email: userData.email });
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = await User.create({ ...userData, password: hashedPassword });
      investorIds.push(user._id.toString());
      console.log(`  ✓ ${userData.name} (${userData.email})`);
    }

    // Create startups
    console.log('\nCreating startups...');
    const startupNameToId = new Map<string, string>();
    for (let i = 0; i < STARTUPS.length; i++) {
      const startupData = STARTUPS[i];
      // Assign owner: first 5 startups get the 5 entrepreneurs, rest get random
      const ownerIdx = i < entrepreneurIds.length ? i : Math.floor(Math.random() * entrepreneurIds.length);
      const startup = await Startup.create({
        ...startupData,
        owner: entrepreneurIds[ownerIdx],
        approvedAt: new Date(),
      });
      startupNameToId.set(startupData.basicInfo.name.en, startup._id.toString());
      console.log(`  ✓ ${startupData.basicInfo.name.en} ($${startupData.funding.raised.toLocaleString()} raised)`);
    }

    // Create investments
    console.log('\nCreating investments...');
    const investmentData = generateInvestments(investorIds, startupNameToId);
    for (const inv of investmentData) {
      await Investment.create(inv);
    }
    console.log(`  ✓ Created ${investmentData.length} investments`);

    console.log('\n✅ Seeding completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   Entrepreneurs: ${ENTREPRENEURS.length}`);
    console.log(`   Investors: ${INVESTORS.length}`);
    console.log(`   Startups: ${STARTUPS.length}`);
    console.log(`   Investments: ${investmentData.length}`);
    console.log(`\n🔐 Test accounts:`);
    console.log(`   Investor: alex.investor@example.com / password123`);
    console.log(`   Investor: priya.investor@example.com / password123`);
    console.log(`   Entrepreneur: sarah@ecotech.example.com / password123`);

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
