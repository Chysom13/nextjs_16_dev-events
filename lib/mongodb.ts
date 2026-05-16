import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable.")
}

type MongooseCache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // `var` is required for global scope augmentation in TypeScript.
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined
}

// Reuse a single cache across hot reloads in development.
const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
}

if (!global.mongooseCache) {
  global.mongooseCache = cached
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  // Return an already established connection if available.
  if (cached.conn) {
    return cached.conn
  }

  // Create one in-flight connection promise so parallel requests don't open duplicates.
  if (!cached.promise) {
    const options: mongoose.ConnectOptions = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI, options)
  }

  try {
    cached.conn = await cached.promise
  } catch (error) {
    // Reset promise so future attempts can retry after a failed connect.
    cached.promise = null
    throw error
  }

  return cached.conn
}

export default connectToDatabase
