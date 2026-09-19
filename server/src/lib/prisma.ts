import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
  max: 10,
  idleTimeoutMillis: 300000,
  connectionTimeoutMillis: 5000,
  keepAlive: true,
});

export const prisma = new PrismaClient({
  adapter,
});