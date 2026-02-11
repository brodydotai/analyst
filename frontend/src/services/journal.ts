import { getClient } from "@/lib/db";
import type {
  JournalEntry,
  JournalEntryCreate,
  TradeEntry,
  TradeEntryCreate,
} from "@/schemas/journal";

export async function listTradeEntries(
  status?: string | null
): Promise<TradeEntry[]> {
  const client = getClient();
  let query = client
    .from("trade_entries")
    .select("*")
    .order("trade_date", { ascending: false });
  if (status) {
    query = query.eq("status", status);
  }
  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []) as TradeEntry[];
}

export async function getTradeEntry(id: string): Promise<TradeEntry | null> {
  const client = getClient();
  const { data, error } = await client
    .from("trade_entries")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? null) as TradeEntry | null;
}

export async function createTradeEntry(
  entry: TradeEntryCreate
): Promise<TradeEntry> {
  const client = getClient();
  const { data, error } = await client
    .from("trade_entries")
    .insert(entry)
    .select("*")
    .single();
  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    throw new Error("Failed to insert trade entry.");
  }
  return data as TradeEntry;
}

export async function updateTradeEntry(
  id: string,
  entry: TradeEntryCreate
): Promise<TradeEntry | null> {
  const client = getClient();
  const { data, error } = await client
    .from("trade_entries")
    .update(entry)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? null) as TradeEntry | null;
}

export async function deleteTradeEntry(id: string): Promise<boolean> {
  const client = getClient();
  const { data, error } = await client
    .from("trade_entries")
    .delete()
    .eq("id", id)
    .select("id");
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []).length > 0;
}

export async function listJournalEntries(
  tag?: string | null
): Promise<JournalEntry[]> {
  const client = getClient();
  let query = client
    .from("journal_entries")
    .select("*")
    .order("entry_date", { ascending: false });
  if (tag) {
    query = query.contains("tags", [tag]);
  }
  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []) as JournalEntry[];
}

export async function getJournalEntry(id: string): Promise<JournalEntry | null> {
  const client = getClient();
  const { data, error } = await client
    .from("journal_entries")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? null) as JournalEntry | null;
}

export async function createJournalEntry(
  entry: JournalEntryCreate
): Promise<JournalEntry> {
  const client = getClient();
  const { data, error } = await client
    .from("journal_entries")
    .insert(entry)
    .select("*")
    .single();
  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    throw new Error("Failed to insert journal entry.");
  }
  return data as JournalEntry;
}

export async function updateJournalEntry(
  id: string,
  entry: JournalEntryCreate
): Promise<JournalEntry | null> {
  const client = getClient();
  const { data, error } = await client
    .from("journal_entries")
    .update(entry)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? null) as JournalEntry | null;
}

export async function deleteJournalEntry(id: string): Promise<boolean> {
  const client = getClient();
  const { data, error } = await client
    .from("journal_entries")
    .delete()
    .eq("id", id)
    .select("id");
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []).length > 0;
}
