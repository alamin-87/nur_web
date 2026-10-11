import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = globalThis.mongooseCache ?? {
  conn: null,
  promise: null,
};
globalThis.mongooseCache = cached;

/**
 * Use only the configured database. Existing catalog readers support sample
 * data when no database is configured; write endpoints reject that state.
 */
export async function connectDB() {
  if (process.env.SAMPLE_DATA_PREVIEW === "true") return null;
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;
  if (!/^mongodb(?:\+srv)?:\/\//.test(uri)) {
    throw new Error("MONGODB_URI must be a valid MongoDB connection URI");
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
        maxPoolSize: 10,
        minPoolSize: 1,
        maxIdleTimeMS: 60_000,
        serverSelectionTimeoutMS: 8_000,
        connectTimeoutMS: 10_000,
        family: 4,
        autoIndex: process.env.NODE_ENV !== "production",
      })
      .then((connection) => {
        cached.conn = connection;
        return connection;
      })
      .catch(() => {
        cached.promise = null;
        cached.conn = null;
        throw new Error("MongoDB connection failed. Check the configured connection and network access.");
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    console.error(error instanceof Error ? error.message : "MongoDB connection failed");
    return null;
  }
}
