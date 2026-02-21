import { NextResponse, NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Topic from '@/models/Topic';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authConfig";
import { siteEventManager } from '@/lib/siteEvents';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'You must be logged in to vote' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Topic ID is required' }, { status: 400 });
    }

    await connectDB();

    // Check if user has already voted for ANY topic in this section
    // Requirement says "shouldn't allow a user to vote more than once"
    const alreadyVotedTopic = await Topic.findOne({ votedBy: userId });

    if (alreadyVotedTopic) {
        // If already voted for the SAME topic, ignore
        if (alreadyVotedTopic.id === Number(id)) {
            return NextResponse.json(alreadyVotedTopic.toObject(), { status: 200 });
        }
        
        // Remove vote from the old topic
        await Topic.updateOne(
            { _id: alreadyVotedTopic._id },
            { 
              $pull: { votedBy: userId },
              $inc: { votes: -1 } 
            }
        );
    }

    // Add vote to the new topic
    const updatedTopic = await Topic.findOneAndUpdate(
      { id: Number(id) },
      { 
        $push: { votedBy: userId },
        $inc: { votes: 1 } 
      },
      { new: true }
    );

    if (!updatedTopic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    // Notify clients to refresh global metadata (topics / publicSessions / portfolio)
    try { siteEventManager.emit({ type: 'refresh', data: { reason: 'vote', topicId: updatedTopic.id } }); } catch (e) { console.warn('siteEvent emit failed', e); }

    return NextResponse.json(updatedTopic.toObject(), { status: 200 });

  } catch (error: any) {
    console.error('Error voting for topic:', error);
    return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 });
  }
}
