import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISession extends Document {
  sessionId: string;
  owner: mongoose.Types.ObjectId;
  participants: {
    user: mongoose.Types.ObjectId;
    joinedAt: Date;
  }[];
  isActive: boolean;
  isPublic: boolean;
  currentTopicId?: number;
}

const SessionSchema: Schema = new Schema({
  sessionId: { type: String, required: true, unique: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    joinedAt: { type: Date, default: Date.now }
  }],
  isActive: { type: Boolean, default: true },
  isPublic: { type: Boolean, default: true },
  currentTopicId: { type: Number },
}, { timestamps: true });

const Session: Model<ISession> = mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);

export default Session;
