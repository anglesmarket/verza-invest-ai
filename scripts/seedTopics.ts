import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Topic from '../src/models/Topic';

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable inside .env');
  process.exit(1);
}

const TOPICS = [
  {
    id: 1,
    en: "The Impact of Artificial Intelligence on Job Security",
    flashcard: "AI is projected to automate millions of roles. Is this a new era of productivity or a systemic threat to employment as we know it?",
    status: "approved"
  },
  {
    id: 2,
    en: "Universal Basic Income (UBI): Pros and Cons",
    flashcard: "Could a guaranteed monthly payment solve poverty, or would it lead to a decrease in local labor participation and inflation?",
    status: "approved"
  },
  {
    id: 3,
    en: "Privacy vs. Security in the Digital Age",
    flashcard: "Do governments have the right to mass surveillance to prevent crime, or is personal data privacy an absolute human right?",
    status: "approved"
  },
  {
    id: 4,
    en: "The Future of Space Exploration",
    flashcard: "Should we prioritize colonizing Mars or solving climate change on Earth first? Is space mining the next gold rush?",
    status: "approved"
  },
  {
    id: 5,
    en: "Social Media's Role in Modern Politics",
    flashcard: "Has social media democratized information or merely amplified echo chambers and misinformation in political discourse?",
    status: "approved"
  },
  {
    id: 6,
    en: "Ethical Considerations in Genetic Engineering",
    flashcard: "CRISPR technology allows us to edit DNA. Where do we draw the line? Should we allow 'designer babies'?",
    status: "approved"
  },
  {
    id: 7,
    en: "The Shift Towards Renewable Energy",
    flashcard: "Is a 100% renewable grid realistic by 2050? What are the biggest hurdles: technology, storage, or political will?",
    status: "approved"
  },
  {
    id: 8,
    en: "Remote Work vs. Traditional Office Culture",
    flashcard: "The pandemic forced a shift to WFH. Is the physical office dead, or is face-to-face collaboration irreplaceable for long-term growth?",
    status: "approved"
  }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI as string);
    console.log('Connected successfully!');

    console.log('Clearing existing topics...');
    await Topic.deleteMany({});
    
    console.log(`Seeding ${TOPICS.length} topics...`);
    await Topic.insertMany(TOPICS);
    
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
