import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  roles: string[];
  entrepreneurProfile?: {
    bio?: { en?: string; fa?: string };
    linkedin?: string;
    experience?: { en?: string; fa?: string };
    expertise?: string[];
  };
  investorProfile?: {
    bio?: { en?: string; fa?: string };
    linkedin?: string;
    preferences?: {
      industries?: string[];
      stages?: string[];
      minInvestment?: number;
      maxInvestment?: number;
    };
    accreditedInvestor?: boolean;
  };
  verified: boolean;
  status: 'active' | 'suspended' | 'deleted';
  lastLoginAt?: Date;
}

const BilingualSchema = new Schema({
  en: String,
  fa: String,
}, { _id: false });

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  image: { type: String },
  roles: {
    type: [String],
    enum: ['investor', 'entrepreneur', 'admin', 'moderator'],
    default: ['investor'],
  },
  entrepreneurProfile: {
    bio: BilingualSchema,
    linkedin: String,
    experience: BilingualSchema,
    expertise: [String],
  },
  investorProfile: {
    bio: BilingualSchema,
    linkedin: String,
    preferences: {
      industries: [String],
      stages: [String],
      minInvestment: Number,
      maxInvestment: Number,
    },
    accreditedInvestor: { type: Boolean, default: false },
  },
  verified: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['active', 'suspended', 'deleted'],
    default: 'active',
  },
  lastLoginAt: Date,
}, { timestamps: true });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
