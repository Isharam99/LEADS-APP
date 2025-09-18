/* eslint-disable @typescript-eslint/no-require-imports */
// Simple script to seed sample data for testing
// Run with: node src/scripts/seedData.js

const mongoose = require("mongoose");

// Define the Company schema (simplified version)
const companySchema = new mongoose.Schema(
  {
    companyId: { type: String, required: true, unique: true },
    companyName: { type: String, required: true },
    image: { type: String, default: "/company.png" },
    campaigns: [
      {
        campaignId: { type: String, required: true },
        name: { type: String, required: true },
        adsetId: { type: String, required: true },
        params: { type: [String], default: ["first-name", "last-name"] },
        creativeLink: { type: [String], default: [] },
      },
    ],
    ownerId: { type: String },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

const Company = mongoose.model("Company", companySchema);

async function seedData() {
  try {
    // Connect to MongoDB
    const MONGO_URI =
      process.env.MONGO_URI || "mongodb://localhost:27017/leads-app";
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Check if company already exists
    const existingCompany = await Company.findOne({
      companyId: "COMP00000001",
    });
    if (existingCompany) {
      console.log("Company COMP00000001 already exists");
      return;
    }

    // Create sample company with campaigns
    const sampleCompany = new Company({
      companyId: "COMP00000001",
      companyName: "Sample Company",
      image: "/company.png",
      campaigns: [
        {
          campaignId: "CAMP00001",
          name: "Basic Lead Campaign",
          adsetId: "ADSET001",
          params: ["first-name", "last-name", "email"],
          creativeLink: ["https://example.com/creative1.jpg"],
        },
        {
          campaignId: "CAMP00002",
          name: "Contact Campaign",
          adsetId: "ADSET002",
          params: ["first-name", "last-name", "email", "phone"],
          creativeLink: ["https://example.com/creative2.jpg"],
        },
        {
          campaignId: "CAMP00003",
          name: "Location Campaign",
          adsetId: "ADSET003",
          params: ["first-name", "last-name", "location"],
          creativeLink: ["https://example.com/creative3.jpg"],
        },
        {
          campaignId: "CAMP00004",
          name: "Full Contact Campaign",
          adsetId: "ADSET004",
          params: ["first-name", "last-name", "email", "phone", "location"],
          creativeLink: ["https://example.com/creative4.jpg"],
        },
        {
          campaignId: "CAMP00005",
          name: "WhatsApp Campaign",
          adsetId: "ADSET005",
          params: ["name", "whatsapp", "location"],
          creativeLink: ["https://example.com/creative5.jpg"],
        },
      ],
      status: "active",
    });

    await sampleCompany.save();
    console.log(
      "Sample company created successfully with campaigns:",
      sampleCompany.campaigns.map((c) => c.name)
    );
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

seedData();
