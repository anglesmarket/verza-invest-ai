import mongoose, { Schema, model, models } from "mongoose";

const SavedStartupSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startupId: {
      type: Schema.Types.ObjectId,
      ref: "Startup",
      required: true,
    },
  },
  { timestamps: true }
);

// One save per user per startup
SavedStartupSchema.index({ userId: 1, startupId: 1 }, { unique: true });
SavedStartupSchema.index({ userId: 1, createdAt: -1 });

const SavedStartup =
  models.SavedStartup || model("SavedStartup", SavedStartupSchema);

export default SavedStartup;
