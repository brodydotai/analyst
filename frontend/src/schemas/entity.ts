import { z } from "zod";

export const entityCreateSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["company", "person", "fund"]),
  cik: z.string().nullable().default(null),
  ticker: z.string().nullable().default(null),
  exchange: z.string().nullable().default(null),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const entitySchema = entityCreateSchema.extend({
  id: z.number().int(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type EntityCreate = z.infer<typeof entityCreateSchema>;
export type Entity = z.infer<typeof entitySchema>;
