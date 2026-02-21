import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';
import User from '../src/models/User';

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable inside .env');
  process.exit(1);
}

const USERS = [
  {
    name: "System Admin",
    email: "admin@portal.com",
    password: "adminPassword123", // Will be hashed below
    role: "admin",
    image: "https://ui-avatars.com/api/?name=Admin&background=020617&color=fff"
  },
  {
    name: "Abbas Moderator",
    email: "abbas@portal.com",
    password: "moderatorPass123", // Will be hashed below
    role: "moderator",
    image: "https://ui-avatars.com/api/?name=Abbas&background=2563eb&color=fff"
  },
  {
    name: "Jane Smith",
    email: "jane@portal.com",
    password: "moderatorPass123", // Will be hashed below
    role: "moderator",
    image: "https://ui-avatars.com/api/?name=Jane+Smith&background=4f46e5&color=fff"
  }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI as string);
    console.log('Connected successfully!');

    console.log('Clearing existing users (keeping only those not in seed if necessary, but manual seed usually wipes)...');
    // For safety in dev, we often wipe or find by email. Let's wipe to ensure clean state.
    // await User.deleteMany({ email: { $in: USERS.map(u => u.email) } });
    
    // Actually, let's just delete the ones we are about to add to avoid duplicates
    for (const userData of USERS) {
      await User.deleteOne({ email: userData.email });
      
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      await User.create({
        ...userData,
        password: hashedPassword
      });
      console.log(`Created user: ${userData.name} (${userData.role})`);
    }
    
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
