# Backend Schema Conventions

> Standing reference for Zod schema patterns. All backend schemas follow these conventions.
> Promoted from Brief 004 (Backend Migration — Python to Node/TypeScript).

---

## Zod Schema Pattern

Each domain gets a schema file in `frontend/src/schemas/`. Zod replaces Pydantic as the validation and type system.

### File Structure

```typescript
// frontend/src/schemas/[domain].ts
import { z } from "zod";

// "Create" schemas — used for API input validation
export const [name]CreateSchema = z.object({
  field: z.string().min(1),
  optional_field: z.string().nullable().default(null),
  // ...
});

// "Full" schemas — includes database-generated fields
export const [name]Schema = [name]CreateSchema.extend({
  id: z.string().uuid(),       // or z.number().int() for bigint PKs
  created_at: z.string(),
  updated_at: z.string(),
});

// Inferred types — replaces manually written TypeScript types
export type [Name]Create = z.infer<typeof [name]CreateSchema>;
export type [Name] = z.infer<typeof [name]Schema>;
```

### Export Convention

Every schema file exports exactly four things:

| Export | Purpose |
|--------|---------|
| `[name]CreateSchema` | Zod object for validating API input (excludes DB-generated fields) |
| `[name]Schema` | Zod object for the full database row (extends create schema) |
| `[Name]Create` | TypeScript type inferred from create schema |
| `[Name]` | TypeScript type inferred from full schema |

### Rules

- **Types are always inferred from Zod** — never manually written. Use `z.infer<typeof schema>`.
- **Create schemas exclude DB-generated fields** — `id`, `created_at`, `updated_at` are added by the full schema via `.extend()`.
- **Field names match SQL column names exactly** — snake_case, same nullability, same defaults.
- **Barrel export** — `frontend/src/schemas/index.ts` re-exports all domain schemas.
- **Frontend types** — `frontend/src/types/[domain].ts` re-exports types from schemas for backward compatibility. Components import from `@/types/` or `@/schemas/` — both work.

### SQL-to-Zod Type Mapping

| SQL Type | Zod Validator |
|----------|--------------|
| `text NOT NULL` | `z.string().min(1)` |
| `text` (nullable) | `z.string().nullable().default(null)` |
| `bigint` / `integer` | `z.number().int()` |
| `numeric(p,s)` | `z.number()` |
| `boolean` | `z.boolean()` |
| `uuid` | `z.string().uuid()` |
| `date` / `timestamptz` | `z.string()` (ISO string) |
| `jsonb` | `z.record(z.string(), z.unknown()).default({})` |
| `text[]` | `z.array(z.string()).default([])` |
| `vector(N)` | `z.array(z.number()).nullable().default(null)` |
| `text CHECK (IN (...))` | `z.enum([...])` |

### Example: Journal Schema

```typescript
import { z } from "zod";

export const tradeSideSchema = z.enum(["buy", "sell", "short", "cover"]);
export const tradeStatusSchema = z.enum(["open", "closed", "partial"]);

export const tradeEntryCreateSchema = z.object({
  ticker: z.string().min(1),
  side: tradeSideSchema,
  trade_date: z.string(),
  price: z.number(),
  quantity: z.number(),
  thesis: z.string().default(""),
  status: tradeStatusSchema.default("open"),
  exit_price: z.number().nullable().default(null),
  exit_date: z.string().nullable().default(null),
  pnl: z.number().nullable().default(null),
  pnl_percent: z.number().nullable().default(null),
  notes: z.string().nullable().default(null),
  tags: z.array(z.string()).default([]),
});

export const tradeEntrySchema = tradeEntryCreateSchema.extend({
  id: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type TradeEntryCreate = z.infer<typeof tradeEntryCreateSchema>;
export type TradeEntry = z.infer<typeof tradeEntrySchema>;
```
