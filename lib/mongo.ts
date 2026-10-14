import "server-only";
import { MongoClient } from "mongodb";

export const mongoUri = process.env.MONGODB_URI ?? "";

const globalForMongo = globalThis as unknown as { mongoClient?: MongoClient };

/**
 * One client per server instance, reused across warm invocations and dev hot
 * reloads. It connects lazily on the first query, so importing this without
 * MONGODB_URI set (e.g. during a build) is harmless.
 */
export const mongoClient = (globalForMongo.mongoClient ??= new MongoClient(mongoUri || "mongodb://localhost:27017"));

export const db = mongoClient.db(process.env.MONGODB_DB || "forge");
