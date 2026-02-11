import { NextRequest, NextResponse } from "next/server";
import { tradeEntryCreateSchema } from "@/schemas/journal";
import {
  deleteTradeEntry,
  getTradeEntry,
  updateTradeEntry,
} from "@/services/journal";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const trade = await getTradeEntry(id);
    if (!trade) {
      return NextResponse.json({ error: "Trade entry not found." }, { status: 404 });
    }
    return NextResponse.json(trade);
  } catch {
    return NextResponse.json(
      { error: "Failed to load trade entry." },
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
    const parsed = tradeEntryCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 422 });
    }
    const updated = await updateTradeEntry(id, parsed.data);
    if (!updated) {
      return NextResponse.json({ error: "Trade entry not found." }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Failed to update trade entry." },
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
    const deleted = await deleteTradeEntry(id);
    if (!deleted) {
      return NextResponse.json({ error: "Trade entry not found." }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete trade entry." },
      { status: 500 }
    );
  }
}
