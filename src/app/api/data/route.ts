import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Portfolio from '@/models/Portfolio';
import Topic from '@/models/Topic';
import Session from '@/models/Session';
import { INITIAL_SITE_CONTENT } from '@/lib/constants';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authConfig";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    // Fetch the first portfolio document and all approved topics
    let portfolio: any = await Portfolio.findOne().lean();
    
    // Fallback if DB is empty
    if (!portfolio) {
      portfolio = INITIAL_SITE_CONTENT;
    }

    const topics = await Topic.find({ status: 'approved', isActive: false }).sort({ votes: -1 }).lean();
    const activeTopic = await Topic.findOne({ isActive: true }).lean();

    let votedTopicId: number | null = null;
    if (session?.user) {
        const userId = (session.user as any).id;
        const votedTopic = await Topic.findOne({ votedBy: userId });
        if (votedTopic) {
            votedTopicId = votedTopic.id;
        }
    }

    // Fetch active public sessions
    const publicSessions = await Session.find({ 
      isActive: true, 
      isPublic: true 
    })
    .populate('owner', 'name')
    .sort({ createdAt: -1 })
    .lean();

    return NextResponse.json({
      portfolio,
      topics,
      activeTopic,
      votedTopicId,
      publicSessions: publicSessions.map(s => ({
        sessionId: s.sessionId,
        ownerName: (s.owner as any)?.name || 'Anonymous',
        participantCount: s.participants?.length || 0,
        currentTopicId: s.currentTopicId
      }))
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
