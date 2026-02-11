import { Client } from "@upstash/qstash";
import { QSTASH_TOKEN, VERCEL_URL } from "./config";

let client: Client | null = null;

function getQStashClient(): Client {
  if (!client) {
    client = new Client({ token: QSTASH_TOKEN });
  }
  return client;
}

export async function publish(
  endpoint: string,
  body: Record<string, unknown>
): Promise<string> {
  const qstash = getQStashClient();
  const base = VERCEL_URL.replace(/\/$/, "");
  const result = await qstash.publishJSON({
    url: `${base}${endpoint}`,
    body,
  });
  return result.messageId;
}
