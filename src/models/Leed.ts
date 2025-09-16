import mongoose, { Schema, Document } from "mongoose";

export interface ILeed extends Document {
  companyId: string;
  campaignId: string;
  content: any;                 // arbitrary payload from forms/ads
  WhatsApp: string;             // default "N/A"
  previousSite: string;         // default "N/A"
  createdTime: Date;            // when the lead was created (business time)
  badges: string[];             // default ["new"]

  // added (simple, creation-friendly)
  priority: number;             // 1 (low) .. 5 (high); default 3
  lastContactedAt: Date | null; // default null
  contactAttempts: number;      // default 0

  // mongoose timestamps
  createdAt: Date;
  updatedAt: Date;
}

const LeedSchema = new Schema<ILeed>(
  {
    companyId: { type: String, required: true },
    campaignId: { type: String, required: true },

    content: { type: Schema.Types.Mixed, required: true },

    WhatsApp: { type: String, default: "N/A", trim: true },
    previousSite: { type: String, default: "N/A", trim: true },

    createdTime: { type: Date, default: Date.now },

    badges: {
      type: [String],
      default: ["new"],
    },

    // Extras (kept simple)
    priority: { type: Number, min: 1, max: 5, default: 3 },
    lastContactedAt: { type: Date, default: null },
    contactAttempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Optional: ensure we always have at least one badge on new docs
LeedSchema.pre("save", function (next) {
  if (!this.badges || this.badges.length === 0) this.badges = ["new"];
  if (!this.createdTime) this.createdTime = new Date();
  next();
});

export default mongoose.models.Leed || mongoose.model<ILeed>("Leed", LeedSchema);
