import { NextRequest, NextResponse } from "next/server";
import { journalEntryCreateSchema } from "@/schemas/journal";
import {
  deleteJournalEntry,
  getJournalEntry,
  updateJournalEntry,
} from "@/services/journal";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const entry = await getJournalEntry(id);
    if (!entry) {
      return NextResponse.json({ error: "Journal entry not found." }, { status: 404 });
    }
    return NextResponse.json(entry);
  } catch {
    return NextResponse.json(
      { error: "Failed to load journal entry." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = journalEntryCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 422 });
    }
    const updated = await updateJournalEntry(id, parsed.data);
    if (!updated) {
      return NextResponse.json({ error: "Journal entry not found." }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Failed to update journal entry." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteJournalEntry(id);
    if (!deleted) {
      return NextResponse.json({ error: "Journal entry not found." }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete journal entry." },
      { status: 500 }
    );
  }
}
