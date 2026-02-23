import mongoose, { Schema, model, models } from "mongoose";

const ContactSchema = new Schema(
  {
    // The user who saved the contact
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // The contact being saved (another user / startup owner)
    contactUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Optional: linked startup that prompted the contact
    startupId: {
      type: Schema.Types.ObjectId,
      ref: "Startup",
    },
    // User-defined label
    note: {
      type: String,
      maxlength: 500,
      default: "",
    },
    // Categorization
    category: {
      type: String,
      enum: ["investor", "entrepreneur", "partner", "advisor", "other"],
      default: "other",
    },
  },
  { timestamps: true }
);

// Prevent duplicate contacts (same user saving same contact)
ContactSchema.index({ userId: 1, contactUserId: 1 }, { unique: true });
ContactSchema.index({ userId: 1, createdAt: -1 });

const Contact = models.Contact || model("Contact", ContactSchema);

export default Contact;
