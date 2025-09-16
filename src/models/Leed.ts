// src/models/Leed.ts
import mongoose, { Schema, Document } from "mongoose";


export interface ILeed extends Document {
companyId: string;
campaignId?: string;
content: any; // arbitrary payload from forms/ads
WhatsApp: string; // default "N/A"
previousSite: string; // default "N/A"
createdTime: Date; // when the lead was created (business time)
badges: string[]; // default ["new"]
priority: number; // 1..5 default 3
lastContactedAt: Date | null; // default null
contactAttempts: number; // default 0
createdAt: Date;
updatedAt: Date;
}


const LeedSchema = new Schema<ILeed>(
{
companyId: { type: String, required: true },
campaignId: { type: String, required: false },
content: { type: Schema.Types.Mixed, required: true },
WhatsApp: { type: String, default: "N/A", trim: true },
previousSite: { type: String, default: "N/A", trim: true },
createdTime: { type: Date, default: Date.now },
badges: { type: [String], default: ["new"] },
priority: { type: Number, min: 1, max: 5, default: 3 },
lastContactedAt: { type: Date, default: null },
contactAttempts: { type: Number, default: 0 },
},
{ timestamps: true }
);


LeedSchema.pre("save", function (next) {
if (!this.badges || this.badges.length === 0) this.badges = ["new"];
if (!this.createdTime) this.createdTime = new Date();
next();
});


export default (mongoose.models.Leed as mongoose.Model<ILeed>) ||
mongoose.model<ILeed>("Leed", LeedSchema);