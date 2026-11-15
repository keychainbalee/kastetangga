import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  libsqlClient?: Client;
};

function getLibsqlClient(): Client {
  if (globalForDb.libsqlClient) {
    return globalForDb.libsqlClient;
  }

  const url = process.env.TURSO_DATABASE_URL;
  if (!url) {
    throw new Error(
      "Variabel lingkungan TURSO_DATABASE_URL belum diatur di file .env"
    );
  }

  const client = createClient({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.libsqlClient = client;
  }

  return client;
}

export const db = drizzle(getLibsqlClient(), { schema });
