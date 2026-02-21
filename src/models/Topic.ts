import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITopic extends Document {
  id: number;
  en: string;
  votes: number;
  flashcard: string;
  status: 'pending' | 'approved' | 'rejected';
  isActive?: boolean;
  tags?: string[];
  submittedBy?: mongoose.Types.ObjectId;
  votedBy?: mongoose.Types.ObjectId[];
}

const TopicSchema: Schema = new Schema({
  id: { type: Number, required: true, unique: true },
  en: { type: String, required: true },
  votes: { type: Number, default: 0 },
  flashcard: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  isActive: { type: Boolean, default: false },
  tags: { type: [String], default: [] },
  submittedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  votedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const Topic: Model<ITopic> = mongoose.models.Topic || mongoose.model<ITopic>('Topic', TopicSchema);

export default Topic;
