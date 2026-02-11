import { NextRequest, NextResponse } from "next/server";
import { tradeEntryCreateSchema } from "@/schemas/journal";
import { createTradeEntry, listTradeEntries } from "@/services/journal";

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get("status");
    const trades = await listTradeEntries(status);
    return NextResponse.json(trades);
  } catch {
    return NextResponse.json(
      { error: "Failed to load trade entries." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = tradeEntryCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 422 });
    }
    const trade = await createTradeEntry(parsed.data);
    return NextResponse.json(trade, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create trade entry." },
      { status: 500 }
    );
  }
}
