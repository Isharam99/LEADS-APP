import mongoose, { Schema, Document } from "mongoose";

export interface ICompany extends Document {
  companyId: string; // e.g., COMP00001
  companyName: string;
  image: string;
  campaigns: {
    campaignId: string;
    name: string;
    adsetId: string;
    params: string[];
    creativeLink: [string];
  }[];
  ownerId?: mongoose.Types.ObjectId; // reference to a User (optional)
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const campaignSchema = new Schema(
  {
    campaignId: { type: String, required: true },
    name: { type: String, required: true },
    adsetId: { type: String, required: true },
    params: {
      type: [String],
      default: ["first-name", "last-name"],
    },
    creativeLink: { type: [String], required: true, default: [] },
  },
  { _id: false } // don’t create a new _id for subdocs
);

const companySchema = new Schema<ICompany>(
  {
    companyId: { type: String, required: true, unique: true }, // you can auto-generate like COMP00001
    companyName: { type: String, required: true },
    image: { type: String, default: "/company.png" },
    campaigns: { type: [campaignSchema], default: [] },
    ownerId: { type: String },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.models.Company ||
  mongoose.model<ICompany>("Company", companySchema);
