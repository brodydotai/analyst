# Backend API Conventions

> Standing reference for Next.js API route and service layer patterns. All backend routes follow these conventions.
> Promoted from Brief 004 (Backend Migration — Python to Node/TypeScript).

---

## Next.js API Route Pattern

API routes use the Next.js App Router convention — `route.ts` files with named HTTP method exports.

### File Structure

```
frontend/src/app/api/[domain]/route.ts         → GET (list), POST (create)
frontend/src/app/api/[domain]/[id]/route.ts     → GET (single), PUT (update), DELETE
```

### Route Template

```typescript
import { NextRequest, NextResponse } from "next/server";
import { [name]CreateSchema } from "@/schemas/[domain]";
import { list[Names], create[Name] } from "@/services/[domain]";

export async function GET(request: NextRequest) {
  try {
    const filter = request.nextUrl.searchParams.get("filter_key");
    const items = await list[Names](filter);
    return NextResponse.json(items);
  } catch {
    return NextResponse.json(
      { error: "Failed to load [names]." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = [name]CreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 422 });
    }
    const item = await create[Name](parsed.data);
    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create [name]." },
      { status: 500 }
    );
  }
}
```

### Dynamic Route Template ([id])

```typescript
import { NextRequest, NextResponse } from "next/server";
import { [name]CreateSchema } from "@/schemas/[domain]";
import { get[Name], update[Name], delete[Name] } from "@/services/[domain]";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await get[Name](id);
    if (!item) {
      return NextResponse.json({ error: "[Name] not found." }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch {
    return NextResponse.json(
      { error: "Failed to load [name]." },
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
    const parsed = [name]CreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 422 });
    }
    const updated = await update[Name](id, parsed.data);
    if (!updated) {
      return NextResponse.json({ error: "[Name] not found." }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Failed to update [name]." },
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
    const deleted = await delete[Name](id);
    if (!deleted) {
      return NextResponse.json({ error: "[Name] not found." }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete [name]." },
      { status: 500 }
    );
  }
}
```

### Status Code Convention

| Scenario | Status Code |
|----------|------------|
| Successful read (single or list) | `200` |
| Successful create | `201` |
| Successful delete | `204` (no body) |
| Invalid input (Zod validation fails) | `422` with `{ error: issues[] }` |
| Resource not found | `404` with `{ error: "[Name] not found." }` |
| Server error | `500` with `{ error: "Failed to [verb] [name]." }` |

### Rules

- **Routes are thin.** Validate input with Zod `safeParse`, call a service function, return `NextResponse.json`. No business logic in routes.
- **Every route handles three error classes:** bad input (422), not found (404), server error (500). Never return 200 with an error message in the body.
- **Dynamic params are async** — `{ params }: { params: Promise<{ id: string }> }` with `await params`.
- **Filtering via query params** — GET list routes accept optional query params for filtering (e.g., `?status=open`, `?tag=macro`). Pass them to the service function.

---

## Service Layer Pattern

Services contain all business logic and Supabase queries. One file per domain in `frontend/src/services/`.

### File Structure

```typescript
// frontend/src/services/[domain].ts
import { getClient } from "@/lib/db";
import type { [Name], [Name]Create } from "@/schemas/[domain]";

export async function list[Names](filter?: string | null): Promise<[Name][]> {
  const client = getClient();
  let query = client.from("[table]").select("*").order("[sort_col]", { ascending: false });
  if (filter) {
    query = query.eq("[filter_col]", filter);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as [Name][];
}

export async function get[Name](id: string): Promise<[Name] | null> {
  const client = getClient();
  const { data, error } = await client
    .from("[table]").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data ?? null) as [Name] | null;
}

export async function create[Name](entry: [Name]Create): Promise<[Name]> {
  const client = getClient();
  const { data, error } = await client
    .from("[table]").insert(entry).select("*").single();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Failed to insert [name].");
  return data as [Name];
}

export async function update[Name](id: string, entry: [Name]Create): Promise<[Name] | null> {
  const client = getClient();
  const { data, error } = await client
    .from("[table]").update(entry).eq("id", id).select("*").maybeSingle();
  if (error) throw new Error(error.message);
  return (data ?? null) as [Name] | null;
}

export async function delete[Name](id: string): Promise<boolean> {
  const client = getClient();
  const { data, error } = await client
    .from("[table]").delete().eq("id", id).select("id");
  if (error) throw new Error(error.message);
  return (data ?? []).length > 0;
}
```

### Rules

- **Database access through `@/lib/db` only** — call `getClient()`, never instantiate a Supabase client.
- **Services return typed data** — parameters and return types use Zod-inferred types from `@/schemas/`.
- **Errors thrown as `Error` objects** — routes catch and format responses. Services never return HTTP status codes.
- **One file per domain** — `journal.ts`, `watchlist.ts`, `market-data.ts`, etc.
- **Null handling** — `get` returns `T | null` (uses `.maybeSingle()`). `delete` returns `boolean`. `create` returns `T` (throws on failure). `update` returns `T | null`.

### CRUD Function Signatures

Every domain service exports these five functions per entity:

| Function | Signature | Notes |
|----------|-----------|-------|
| `list[Names]` | `(filter?: string \| null) => Promise<[Name][]>` | Optional filtering |
| `get[Name]` | `(id: string) => Promise<[Name] \| null>` | null if not found |
| `create[Name]` | `(entry: [Name]Create) => Promise<[Name]>` | Throws on failure |
| `update[Name]` | `(id: string, entry: [Name]Create) => Promise<[Name] \| null>` | null if not found |
| `delete[Name]` | `(id: string) => Promise<boolean>` | false if not found |
