import mongoose, { Schema, model, models } from "mongoose";

const InvestmentSchema = new Schema({
  investor: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  startup: {
    type: Schema.Types.ObjectId,
    ref: "Startup",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled"],
    default: "confirmed",
  },
  paymentMethod: {
    type: String,
    default: "platform",
  },
  message: {
    type: String,
    maxlength: 500,
  },
  confirmedAt: Date,
  cancelledAt: Date,
  cancellationReason: String,
}, {
  timestamps: true,
});

// Indexes for efficient querying
InvestmentSchema.index({ investor: 1, createdAt: -1 });
InvestmentSchema.index({ startup: 1, createdAt: -1 });
InvestmentSchema.index({ status: 1 });

// Prevent duplicate investments (same investor + startup within 1 hour)
InvestmentSchema.index({ investor: 1, startup: 1, createdAt: -1 });

const Investment = models.Investment || model("Investment", InvestmentSchema);

export default Investment;
