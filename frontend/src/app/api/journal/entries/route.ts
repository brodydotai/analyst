import { NextRequest, NextResponse } from "next/server";
import { journalEntryCreateSchema } from "@/schemas/journal";
import { createJournalEntry, listJournalEntries } from "@/services/journal";

export async function GET(request: NextRequest) {
  try {
    const tag = request.nextUrl.searchParams.get("tag");
    const entries = await listJournalEntries(tag);
    return NextResponse.json(entries);
  } catch {
    return NextResponse.json(
      { error: "Failed to load journal entries." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = journalEntryCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 422 });
    }
    const entry = await createJournalEntry(parsed.data);
    return NextResponse.json(entry, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create journal entry." },
      { status: 500 }
    );
  }
}
