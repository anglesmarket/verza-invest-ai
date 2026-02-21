import mongoose, { Schema, model, models } from "mongoose";

const BilingualSchema = new Schema({
  en: String,
  fa: String,
}, { _id: false });

const StartupSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["draft", "pending", "approved", "rejected"],
    default: "draft",
  },
  basicInfo: {
    name: BilingualSchema,
    tagline: BilingualSchema,
    logo: String,
    industry: String,
    location: String,
    foundedDate: Date,
    website: String,
    socialLinks: {
      linkedin: String,
      twitter: String,
      instagram: String,
    },
  },
  pitch: {
    problem: BilingualSchema,
    solution: BilingualSchema,
    valueProposition: BilingualSchema,
    marketSize: String,
    businessModel: BilingualSchema,
    advantages: {
      en: [String],
      fa: [String],
    },
  },
  team: {
    founders: [{
      name: String,
      role: String,
      bio: String,
      image: String,
    }],
    teamSize: Number,
    keyMembers: [{
      name: String,
      role: String,
      bio: String,
      image: String,
    }],
  },
  funding: {
    goal: {
      type: Number,
      required: true,
    },
    raised: {
      type: Number,
      default: 0,
    },
    stage: String,
    useOfFunds: BilingualSchema,
    minimumInvestment: {
      type: Number,
      default: 1000,
    },
  },
  documents: {
    pitchDeck: String,
    businessPlan: String,
    financials: String,
  },
  metrics: {
    viewCount: {
      type: Number,
      default: 0,
    },
    investorInterest: {
      type: Number,
      default: 0,
    },
  },
  approvedAt: Date,
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  rejectionReason: String,
}, {
  timestamps: true,
});

// Indexes for efficient querying
StartupSchema.index({ status: 1, createdAt: -1 });
StartupSchema.index({ owner: 1 });
StartupSchema.index({ "basicInfo.industry": 1 });
StartupSchema.index({ "funding.stage": 1 });

const Startup = models.Startup || model("Startup", StartupSchema);

export default Startup;
