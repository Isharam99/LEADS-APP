// src/lib/db.ts
import mongoose from "mongoose";


// Allow global caching in dev to avoid hot-reload multiple connections
const MONGODB_URI = process.env.MONGODB_URI as string;


if (!MONGODB_URI) {
throw new Error("Please define MONGODB_URI in .env.local");
}


type MongooseCache = {
conn: typeof mongoose | null;
promise: Promise<typeof mongoose> | null;
};


let cached = (globalThis as typeof globalThis & { mongoose?: MongooseCache }).mongoose as MongooseCache;


if (!cached) {
cached = ((globalThis as typeof globalThis & { mongoose?: MongooseCache })).mongoose = { conn: null, promise: null };
}


export async function connectToDB() {
if (cached.conn) return cached.conn;


if (!cached.promise) {
cached.promise = mongoose.connect(MONGODB_URI, {
serverSelectionTimeoutMS: 20000,
// bufferCommands default true; we keep defaults
});
}


cached.conn = await cached.promise;
return cached.conn;
}